const express = require('express')

const { getTopics } = require('./controllers/topics.controller')
const { getApis } = require('./controllers/api.controllers')
const { getArticles, getArticleById } = require('./controllers/articles.controller')
const { postComment } = require('./controllers/comments.controllers')
const { getComments, deleteComment } = require('./controllers/comments.controllers')
const { handlePsqlErrors, handleCustomErrors } = require('./errors/index')
const { getUsers } = require('./controllers/users.controllers')

const app = express()

app.use(express.json())

app.get('/api', getApis);

app.get('/api/topics', getTopics);

app.get('/api/articles', getArticles);

app.get('/api/users', getUsers);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles/:article_id/comments', getComments);

app.post('/api/articles/:article_id/comments', postComment);

app.delete('/api/comments/:comment_id', deleteComment);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.all('/api/*', (req, res, next) => {
    res.status(404).send({ msg: 'Path not found!'})
})

module.exports = app;