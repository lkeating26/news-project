const {
  createComment,
  selectComments,
  removeComment,
  updateComment,
} = require("../models/comments.models");

const postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  if (!newComment.username || !newComment.body) {
    return res.status(400).send({ msg: "Please provide username and body" });
  }
  createComment(newComment, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const getComments = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;

  selectComments({ article_id, limit, p })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;

  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

const patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  if (!inc_votes) {
    return res.status(400).send({ msg: "Please provide inc_votes" });
  }
  updateComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { postComment, getComments, deleteComment, patchComment };
