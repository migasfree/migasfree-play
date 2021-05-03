const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const packagesRouter = require('./routes/packages')
const preferencesRouter = require('./routes/preferences')
const computerRouter = require('./routes/computer')
const tokenRouter = require('./routes/token')
const executionsRouter = require('./routes/executions')
const userRouter = require('./routes/user')
const tagsRouter = require('./routes/tags')

const app = express()

app.use(
  cors({
    origin: 'http://localhost:9999'
  })
)
app.use(express.json())
app.use(
  bodyParser.urlencoded({ extended: true, limit: '5mb', parameterLimit: 50000 })
)
app.use(bodyParser.json({ limit: '5mb' }))

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

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})

module.exports = app
