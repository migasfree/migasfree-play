const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const rateLimit = require('express-rate-limit')

const packagesRouter = require('./routes/packages')
const preferencesRouter = require('./routes/preferences')
const computerRouter = require('./routes/computer')
const tokenRouter = require('./routes/token')
const executionsRouter = require('./routes/executions')
const userRouter = require('./routes/user')
const tagsRouter = require('./routes/tags')

const allowedOrigin = `http://localhost:${process.env.MFP_QUASAR_PORT || 9999}`
const allowedHost = 'localhost'

const allowOnlyOrigin = (req, res, next) => {
  if (
    (typeof req.headers.origin === 'undefined' &&
      !req.headers.host.includes(allowedHost)) ||
    (typeof req.headers.origin === 'string' &&
      req.headers.origin !== allowedOrigin)
  ) {
    return res.status(403).send('allowOnlyOrigin: false')
  }

  next()
}

const app = express()

app.use(allowOnlyOrigin)
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 80,
  }),
)
app.use(
  cors({
    origin: allowedOrigin,
  }),
)
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 100000,
  }),
)
app.use(bodyParser.json({ limit: '10mb' }))

app.use('/packages', packagesRouter)
app.use('/preferences', preferencesRouter)
app.use('/computer', computerRouter)
app.use('/token', tokenRouter)
app.use('/executions', executionsRouter)
app.use('/user', userRouter)
app.use('/tags', tagsRouter)

// error handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  // set locals, only providing error in development
  res.locals.message = err.message
  // res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.locals.error = err

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

app.listen(process.env.MFP_EXPRESS_PORT || 3000, () => {
  console.log(
    `Express server listening on port ${process.env.MFP_EXPRESS_PORT || 3000}`,
  )
})

module.exports = app
