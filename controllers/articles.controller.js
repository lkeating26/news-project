const { selectArticles, selectArticleById, updateArticle } = require('../models/articles.models')

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

const patchArticle = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    if(!inc_votes) {
        return res.status(400).send({ msg:'Please provide inc_votes'})
    }

    updateArticle(article_id, inc_votes).then((article) => {
        console.log(article)
        res.status(200).send({article});
    })
    .catch((err) => {
        next(err)
    })
}


module.exports = { getArticles, getArticleById, patchArticle }