const commmentsRouter = require("express").Router();

const { deleteComment } = require("../controllers/comments.controllers");

commmentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commmentsRouter;
