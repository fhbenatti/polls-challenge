export default class ResourceNotFoundException extends Error {
  constructor (m: string = null) {
    super(m)

    Object.setPrototypeOf(this, ResourceNotFoundException.prototype)
  }

  public getMessage () {
    return 'ResourceNotFoundException:\n' + this.message
  }
}
