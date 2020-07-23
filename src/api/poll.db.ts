import { Poll } from './models/Poll'
import { PollOption } from './models/PollOption'
import { PollViews } from './models/PollViews'
import { PollOptionVotes } from './models/PollOptionVotes'
import { get, set, incr } from '../db/index'

const seqPollKey = 'seqPoll'
const seqPollOptionKey = 'seqPollOption'
const pollViewsKey = 'pollViews'
const pollOptionVoteCountKey = 'pollOptionVoteCount'

export async function getPollNextId (): Promise<number> {
  return incr(seqPollKey)
}

export async function getPollOptionNextId (): Promise<number> {
  return incr(seqPollOptionKey)
}

export async function getById (id: number): Promise<Poll> {
  const dbPoll = await get(`Poll:${id}`)
  if (!dbPoll) {
    return null
  }
  const poll = new Poll()
  poll.id = dbPoll.id
  poll.description = dbPoll.description
  poll.options = dbPoll.options.map(o => {
    const pollOption = new PollOption()
    pollOption.id = o.id
    pollOption.pollId = dbPoll.id
    pollOption.description = dbPoll.description
    return pollOption
  })
  return poll
}

export async function getOptionById (
  pollId: number,
  pollOptionId: number
): Promise<PollOption> {
  const poll = await getById(pollId)
  if (!poll) {
    return null
  }

  return poll.options.find(o => o.id === pollOptionId)
}

export async function getOptions (pollId: number): Promise<PollOption[]> {
  const poll = await getById(pollId)
  if (!poll) {
    return null
  }

  return poll.options
}

export async function getViews (pollId: number): Promise<PollViews> {
  const viewsCount = await get(`${pollViewsKey}:${pollId}`)
  const pollViews = new PollViews()
  pollViews.pollId = pollId
  pollViews.views = viewsCount || 0

  return pollViews
}

export async function getPollOptionsVotes (
  pollId: number
): Promise<PollOptionVotes[]> {
  const options = await getOptions(pollId)
  const pollOptionsVotes = await Promise.all(
    options.map(async o => {
      const optionVotes = new PollOptionVotes()
      optionVotes.pollId = o.pollId
      optionVotes.pollOptionid = o.id
      optionVotes.voteQty =
        (await get(`${pollOptionVoteCountKey}:${o.pollId}:${o.id}`)) || 0
      return optionVotes
    })
  )
  return pollOptionsVotes
}

export async function insertPoll (poll: Poll) {
  const result = await set(`Poll:${poll.id}`, poll)
  return result
}

export async function insertPollView (pollId: number) {
  return incr(`${pollViewsKey}:${pollId}`)
}

export async function insertPollOptionVote (
  pollId: number,
  pollOptionId: number
) {
  return incr(`${pollOptionVoteCountKey}:${pollId}:${pollOptionId}`)
}
