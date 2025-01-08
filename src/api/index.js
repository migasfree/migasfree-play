import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

import packagesRouter from './routes/packages.js'
import preferencesRouter from './routes/preferences.js'
import computerRouter from './routes/computer.js'
import tokenRouter from './routes/token.js'
import executionsRouter from './routes/executions.js'
import userRouter from './routes/user.js'
import tagsRouter from './routes/tags.js'

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
  express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 100000,
  }),
)
app.use(express.json({ limit: '10mb' }))

app.use('/packages', packagesRouter)
app.use('/preferences', preferencesRouter)
app.use('/computer', computerRouter)
app.use('/token', tokenRouter)
app.use('/executions', executionsRouter)
app.use('/user', userRouter)
app.use('/tags', tagsRouter)

// error handler
app.use((err, req, res) => {
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

export default app
