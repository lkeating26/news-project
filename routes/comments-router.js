const commmentsRouter = require("express").Router();

const {
  deleteComment,
  patchComment,
} = require("../controllers/comments.controllers");

commmentsRouter.route("/:comment_id").delete(deleteComment).patch(patchComment);

module.exports = commmentsRouter;
