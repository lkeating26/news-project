const apiRouter = require("express").Router();

const userRouter = require("./users-router");
const topicRouter = require("./topics-router");
const articleRouter = require("./articles-router");
const commmentsRouter = require("./comments-router");

const { getApis } = require("../controllers/api.controllers");

apiRouter.get("/", getApis);

apiRouter.use("/users", userRouter);

apiRouter.use("/topics", topicRouter);

apiRouter.use("/articles", articleRouter);

apiRouter.use("/comments", commmentsRouter);

module.exports = apiRouter;
