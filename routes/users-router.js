const userRouter = require("express").Router();

const { getUsers, getUser } = require("../controllers/users.controllers");

userRouter.get("/", getUsers);

userRouter.get("/:username", getUser);

module.exports = userRouter;
