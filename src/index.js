import app from './config/server'

let port = process.env.PORT || 3000
let listener = app.listen(port, () => {
  console.log(
    'Server ON - NODE_ENV=' +
      process.env.NODE_ENV +
      ' - PORT=' +
      listener.address().port +
      ' - DB_HOST=' +
      process.env.DB_HOST
  )
})
