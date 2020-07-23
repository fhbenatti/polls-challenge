import { Poll } from '../models/Poll'
import pollsOptions from './pollsOptions'

const polls: Poll[] = [
  {
    id: 1,
    description: 'foo',
    options: pollsOptions.filter(po => po.pollId === 1)
  },
  {
    id: 2,
    description: 'bar',
    options: pollsOptions.filter(po => po.pollId === 2)
  }
]

export default polls
