export default class ValidationException extends Error {
  constructor (m: string = null) {
    super(m)

    Object.setPrototypeOf(this, ValidationException.prototype)
  }

  public getMessage () {
    return 'ValidationError:\n' + this.message
  }
}
