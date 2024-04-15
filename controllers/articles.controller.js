const { post } = require("../app");
const {
  selectArticles,
  selectArticleById,
  updateArticle,
  createArticle,
} = require("../models/articles.models");

const getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;

  selectArticles({ topic, sort_by, order, limit, p })
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (!inc_votes) {
    return res.status(400).send({ msg: "Please provide inc_votes" });
  }

  updateArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const postArticle = (req, res, next) => {
  const newArticle = req.body;
  if (
    !newArticle.title ||
    !newArticle.body ||
    !newArticle.topic ||
    !newArticle.author
  ) {
    return res
      .status(400)
      .send({ msg: "Please provide title, body, topic and author" });
  }
  createArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getArticles, getArticleById, patchArticle, postArticle };
