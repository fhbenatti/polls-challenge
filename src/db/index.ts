import * as redis from 'redis'
import { promisify } from 'util'

function client () {
  const redisInstance = redis.createClient(process.env.DB_HOST, false)
  redisInstance.on('error', error => {
    redisInstance.quit()
    console.log('Redis error ' + error.message)
  })
  return redisInstance
}

export async function get (key: string) {
  const redisInstance = client()
  const getAsync = promisify(redisInstance.get).bind(redisInstance)
  let result = await getAsync(key)
  try {
    result = JSON.parse(result)
  } catch (error) {
    result = result
  }

  return result
}

export async function set (key: string, keyValue: any) {
  const redisInstance = client()
  const setAsync = promisify(redisInstance.set).bind(redisInstance)

  const keyValueParse = () => {
    return typeof keyValue === 'object' ? JSON.stringify(keyValue) : keyValue
  }

  const result = await setAsync(key, keyValueParse())

  return result
}

export async function incr (key: string) {
  const redisInstance = client()
  const incrAsync = promisify(redisInstance.incr).bind(redisInstance)
  let result = await incrAsync(key)
  return Number(result)
}
