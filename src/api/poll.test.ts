import { expect } from 'chai'
import 'mocha'
import * as dotenv from 'dotenv'
import pollsData from './testData/polls'
import pollsOptionsData from './testData/pollsOptions'
import pollsViewsData from './testData/pollsViews'
import pollsOptionsVotesData from './testData/pollsOptionsVotes'
import {
  get as getPoll,
  create as createPoll,
  vote as votePoll,
  getStats as getPollStats
} from './poll'
import ResourceNotFoundException from '../utils/ResourceNotFoundException'
import ValidationException from '../utils/ValidationException'
import { PollOptionVotes } from './models/PollOptionVotes'
import { PollViews } from './models/PollViews'
import { PollOption } from './models/PollOption'
import { Poll } from './models/Poll'
import {
  insertPoll as dbInsertPoll,
  getById as dbGetPollById,
  getViews as dbGetPollViews,
  getOptionById as dbGetPollOptionById,
  getOptions as dbGetPollOptions,
  getPollOptionsVotes as dbGetPollOptionsVotes,
  getPollNextId as dbGetPollNextId,
  getPollOptionNextId as dbGetPollOptionNextId
} from './poll.db'

function checkExceptionType<T> (error, errorType: new () => T) {
  const pollNotFoundTypeCheck = error instanceof errorType
  expect(pollNotFoundTypeCheck).eq(true)
}

async function getPollDataById (id: number): Promise<Poll> {
  return pollsData.find(p => p.id === id)
}

async function getPollOptionsData (pollId: number): Promise<PollOption[]> {
  return pollsOptionsData.filter(po => po.pollId === pollId)
}

async function getPollOptionDataById (pollId: number, pollOptionId: number) {
  return pollsOptionsData.find(
    po => po.pollId === pollId && po.id === pollOptionId
  )
}

function getNextPollOptionId () {
  let currentId = 1000
  return async () => {
    currentId++
    return currentId
  }
}

async function getPollViewsData (pollId: number): Promise<PollViews> {
  return pollsViewsData.find(pv => pv.pollId === pollId)
}

async function getPollOptionsVotesData (
  pollId: number
): Promise<PollOptionVotes[]> {
  return pollsOptionsVotesData.filter(pv => pv.pollId === pollId)
}

describe('api', () => {
  describe('poll-db', () => {
    dotenv.config()
    it('insert poll', async function () {
      this.timeout(60000)
      const result = await dbInsertPoll(pollsData[0])
      expect(result).eq('OK')
    })
    it('get poll', async function () {
      this.timeout(60000)
      await dbInsertPoll(pollsData[0])
      const result = await dbGetPollById(1)
      expect(result instanceof Poll).eq(true)
      expect(result).has.property('id', 1)
      const nullResult = await dbGetPollById(0)
      expect(nullResult).eq(null)
    })
    it('get poll views', async function () {
      this.timeout(60000)
      await dbInsertPoll(pollsData[0])
      const result = await dbGetPollViews(1)
      expect(result instanceof PollViews).eq(true)
    })
    it('get poll options', async function () {
      this.timeout(60000)

      await dbInsertPoll(pollsData[0])

      const resultPollOptionId = await dbGetPollOptionById(1, 1)
      expect(resultPollOptionId instanceof PollOption).eq(true)
      expect(resultPollOptionId).has.property('id', 1)

      const resultPollOptions = await dbGetPollOptions(1)
      expect(resultPollOptions[0] instanceof PollOption).eq(true)
      expect(resultPollOptions).to.satisfy(pos => {
        return pos.length === 2
      })
    })
    it('get poll options votes', async function () {
      this.timeout(60000)
      await dbInsertPoll(pollsData[0])
      const result = await dbGetPollOptionsVotes(1)
      expect(result[0] instanceof PollOptionVotes).eq(true)
    })
    it('get poll next id', async function () {
      this.timeout(60000)
      const result = await dbGetPollNextId()
      expect(result).has.a('number')
    })
    it('get poll option next id', async function () {
      this.timeout(60000)
      const result = await dbGetPollOptionNextId()
      expect(result).has.a('number')
    })
  })
  describe('poll', () => {
    it('get poll by id', async function () {
      this.timeout(60000)

      try {
        const pollFound = await getPoll(getPollDataById, 1)
        expect(pollFound.poll_id).eq(1)

        try {
          await getPoll(getPollDataById, 42)
        } catch (error) {
          checkExceptionType(error, ResourceNotFoundException)
        }

        try {
          await getPoll(getPollDataById, null)
        } catch (error) {
          checkExceptionType(error, ValidationException)
        }
      } catch (error) {
        expect.fail(null, null, error.message)
      }
    })
    it('create new poll', async function () {
      this.timeout(60000)

      try {
        const poll = await createPoll(
          async () => 1000,
          getNextPollOptionId(),
          'foo',
          ['foo1', 'foo2']
        )
        expect(poll).has.property('id', 1000)
      } catch (error) {
        expect.fail(null, null, error.message)
      }

      try {
        await createPoll(async () => 1000, getNextPollOptionId(), null, [
          'foo1',
          'foo2'
        ])
      } catch (error) {
        checkExceptionType(error, ValidationException)
      }

      try {
        await createPoll(async () => 1000, getNextPollOptionId(), 'foo', null)
      } catch (error) {
        checkExceptionType(error, ValidationException)
      }
    })
    it('vote an option for a poll', async function () {
      this.timeout(60000)

      const optionVote = await votePoll(getPollOptionDataById, 1, 1)
      expect(optionVote).has.property('description', 'Opt1-2')

      try {
        await votePoll(getPollOptionDataById, 1, 42)
      } catch (error) {
        checkExceptionType(error, ResourceNotFoundException)
      }

      try {
        await votePoll(getPollOptionDataById, 1, null)
      } catch (error) {
        checkExceptionType(error, ValidationException)
      }
    })
    it('get poll stats', async function () {
      this.timeout(60000)

      const pollStats = await getPollStats(
        getPollDataById,
        getPollOptionsData,
        getPollViewsData,
        getPollOptionsVotesData,
        1
      )
      expect(pollStats).has.property('views', 30)
      expect(pollStats.votes[0]).has.property('qty', 5)

      const pollWithoutViewsStats = await getPollStats(
        getPollDataById,
        getPollOptionsData,
        getPollViewsData,
        getPollOptionsVotesData,
        2
      )
      expect(pollWithoutViewsStats).has.property('views', 0)
      expect(pollWithoutViewsStats.votes[1]).has.property('qty', 0)

      try {
        await getPollStats(
          getPollDataById,
          getPollOptionsData,
          getPollViewsData,
          getPollOptionsVotesData,
          null
        )
      } catch (error) {
        checkExceptionType(error, ValidationException)
      }

      try {
        await getPollStats(
          getPollDataById,
          getPollOptionsData,
          getPollViewsData,
          getPollOptionsVotesData,
          3
        )
      } catch (error) {
        checkExceptionType(error, ResourceNotFoundException)
      }
    })
  })
})
