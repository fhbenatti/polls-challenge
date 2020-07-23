import ValidationException from './ValidationException'
import ResourceNotFoundException from './ResourceNotFoundException'

export default function HttpExceptionResponse (res: any, error: any) {
  if (error instanceof ResourceNotFoundException) {
    res.status(404).send({ error: error.message })
  } else if (error instanceof ValidationException) {
    res.status(409).send({ error: error.message })
  } else {
    res.status(500).send('Internal error')
  }
}
