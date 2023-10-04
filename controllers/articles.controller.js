const { selectArticles, selectArticleById } = require('../models/articles.models')

const getArticles = (req, res, next) => {
    selectArticles().then((articles) => {
        res.status(200).send({ articles })
    })
    .catch((err) => {
        next(err)
    })
}

const getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id).then((article) => {
        res.status(200).send({ article });
    })
    .catch((err) => {
        next(err);
    })
}


module.exports = { getArticles, getArticleById }