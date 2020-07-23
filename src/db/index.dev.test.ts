import * as dotenv from 'dotenv'
import { expect } from 'chai'
import 'mocha'
import { get, set, incr } from './index'

describe('_dev', () => {
  describe('db', () => {
    it('get redis key', async function () {
      this.timeout(60000)

      try {
        dotenv.config()
        const result = await get('foo')
        console.log(result)
      } catch (error) {
        expect.fail(null, null, error.message)
      }
    })
    it('set redis key', async function () {
      this.timeout(60000)

      try {
        dotenv.config()
        const result = await set('foo', 'foobar')
        console.log(result)
      } catch (error) {
        expect.fail(null, null, error.message)
      }
    })
    it('incr redis key', async function () {
      this.timeout(60000)

      try {
        dotenv.config()
        const result = await incr('seqFoo')
        console.log(result)
      } catch (error) {
        expect.fail(null, null, error.message)
      }
    })
  })
})
