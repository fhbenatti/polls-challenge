import { Poll } from './models/Poll'
import { PollOption } from './models/PollOption'
import ResourceNotFoundException from '../utils/ResourceNotFoundException'
import ValidationException from '../utils/ValidationException'
import { PollViews } from './models/PollViews'
import { PollOptionVotes } from './models/PollOptionVotes'

export async function create (
  getPollNextId: () => Promise<number>,
  getPollOptionNextId: () => Promise<number>,
  pollDescription: string,
  pollOptionsDescriptions: string[]
): Promise<Poll> {
  if (!pollDescription) {
    throw new ValidationException('poll description must be informed')
  }
  if (!pollOptionsDescriptions) {
    throw new ValidationException('poll options description must be informed')
  }

  const newPollId = await getPollNextId()

  const newPoll = new Poll()
  newPoll.id = newPollId
  newPoll.description = pollDescription
  newPoll.options = await Promise.all(
    pollOptionsDescriptions.map(async po => {
      const option: PollOption = {
        pollId: newPollId,
        id: await getPollOptionNextId(),
        description: po
      }
      return option
    })
  )

  return newPoll
}

export async function get (
  getPollById: (id: number) => Promise<Poll>,
  pollId: number
): Promise<{
  poll_id: number;
  poll_description: string;
  options: any;
}> {
  if (!pollId) {
    throw new ValidationException('poll id must be informed')
  }

  const poll = await getPollById(pollId)

  if (!poll) {
    throw new ResourceNotFoundException(`poll ${pollId} not found`)
  }

  return {
    poll_id: poll.id,
    poll_description: poll.description,
    options: poll.options.map(o => {
      return {
        option_id: o.id,
        option_description: o.description
      }
    })
  }
}

/**
 * Return the vote option for poll
 * @param getPollOptionById
 * @param pollId
 * @param pollOptionId
 */
export async function vote (
  getPollOptionById: (
    pollId: number,
    pollOptionId: number
  ) => Promise<PollOption>,
  pollId: number,
  pollOptionId: number
): Promise<PollOption> {
  if (!pollId) {
    throw new ValidationException('poll id must be informed')
  }
  if (!pollOptionId) {
    throw new ValidationException('poll option id must be informed')
  }

  const pollOption = await getPollOptionById(pollId, pollOptionId)

  if (!pollOption) {
    throw new ResourceNotFoundException('poll option not found')
  }

  return pollOption
}

export async function getStats (
  getPollById: (id: number) => Promise<Poll>,
  getPollOptions: (pollId: number) => Promise<PollOption[]>,
  getPollViews: (pollId: number) => Promise<PollViews>,
  getPollOptionsVotes: (pollId: number) => Promise<PollOptionVotes[]>,
  pollId: number
): Promise<{
  views: number;
  votes: {
    option_id: number;
    qty: number;
  }[];
}> {
  if (!pollId) {
    throw new ValidationException('poll id must be informed')
  }

  const poll = await getPollById(pollId)
  if (!poll) {
    throw new ResourceNotFoundException('poll not found')
  }

  const pollOptions = await getPollOptions(poll.id)
  const pollViews = await getPollViews(poll.id)
  const pollOptionsVotes = await getPollOptionsVotes(poll.id)
  const pollOptionsVotesSummary = pollOptions.map(po => {
    return {
      option_id: po.id,
      qty: (() => {
        const optVotes = pollOptionsVotes.find(v => v.pollOptionid === po.id)
        return optVotes ? optVotes.voteQty || 0 : 0
      })()
    }
  })

  return {
    views: pollViews ? pollViews.views || 0 : 0,
    votes: pollOptionsVotesSummary
  }
}
