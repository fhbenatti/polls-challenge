import * as dotenv from 'dotenv'
import * as express from 'express'
import router from '../api/routes'
import * as bodyParser from 'body-parser'

dotenv.config()

const app = express()
app.use(bodyParser.json())
app.use('/api', router)

export default app
