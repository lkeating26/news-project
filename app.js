const express = require('express')

const app = express()

const { getTopics } = require('./controllers/topics.controller')

const { 
    handleCustomErrors, 
    handlePsqlErrors, 
    handleServerErrors
    } = require('./errors/index.js')


app.use(express.json())

app.get('/api/topics', getTopics);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleServerErrors);

module.exports = app;