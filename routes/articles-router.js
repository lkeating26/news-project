const articleRouter = require("express").Router();

const {
  getArticles,
  getArticleById,
  patchArticle,
} = require("../controllers/articles.controller");
const {
  getComments,
  postComment,
} = require("../controllers/comments.controllers");

articleRouter.route("/").get(getArticles);

articleRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articleRouter.route("/:article_id/comments").get(getComments).post(postComment);

module.exports = articleRouter;
