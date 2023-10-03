const express = require('express')

const { getTopics } = require('./controllers/topics.controller')
const { getApis } = require('./controllers/api.controllers')

const app = express()
app.use(express.json())

app.get('/api/topics', getTopics);

app.get('/api', getApis);

app.all('/api/*', (req, res, next) => {
    res.status(404).send({ msg: 'Path not found!'})
})

module.exports = app;