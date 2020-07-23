import * as express from 'express'
import {
  getById as dbGetPollById,
  getOptionById as dbGetOptionById,
  getOptions as dbGetOptions,
  getViews as dbGetViews,
  getPollOptionsVotes as dbGetPollOptionsVotes,
  getPollNextId as dbGetPollNextId,
  getPollOptionNextId as dbGetPollOptionNextId,
  insertPoll as dbInsertPoll,
  insertPollOptionVote as dbInsertPollOptionVote,
  insertPollView as dbInsertPollView
} from './poll.db'
import {
  get as getPoll,
  create as createPoll,
  vote as votePoll,
  getStats as getPollStats
} from './poll'
import HttpExceptionResponse from '../utils/HttpExceptionResponse'

const router = express.Router()

router.route('/').get(async (req, res) => {
  try {
    res.send(
      'Server ON - NODE_ENV=' +
        process.env.NODE_ENV +
        ' - PORT=' +
        process.env.PORT +
        'DB_HOST=' +
        process.env.DB_HOST
    )
  } catch (error) {
    res.send(500, error)
  }
})

router.route('/poll').post(async (req, res) => {
  try {
    const { poll_description, options } = req.body
    const poll = await createPoll(
      dbGetPollNextId,
      dbGetPollOptionNextId,
      poll_description,
      options
    )
    await dbInsertPoll(poll)
    res.send({ poll_id: poll.id })
  } catch (error) {
    HttpExceptionResponse(res, error)
  }
})

router.route('/poll/:id').get(async (req, res) => {
  try {
    const { id: pollId } = req.params
    res.send(await getPoll(dbGetPollById, parseInt(pollId)))
    dbInsertPollView(parseInt(pollId))
  } catch (error) {
    HttpExceptionResponse(res, error)
  }
})

router.route('/poll/:id/vote').post(async (req, res) => {
  try {
    const { id: pollId } = req.params
    const { option_id: optionId } = req.body
    const pollVoteOption = await votePoll(dbGetOptionById, pollId, optionId)
    await dbInsertPollOptionVote(pollVoteOption.pollId, pollVoteOption.id)
    res.send({ option_id: optionId })
  } catch (error) {
    HttpExceptionResponse(res, error)
  }
})

router.route('/poll/:id/stats').get(async (req, res) => {
  try {
    const { id: pollId } = req.params
    const pollStats = await getPollStats(
      dbGetPollById,
      dbGetOptions,
      dbGetViews,
      dbGetPollOptionsVotes,
      pollId
    )
    res.send(pollStats)
  } catch (error) {
    HttpExceptionResponse(res, error)
  }
})

export default router
