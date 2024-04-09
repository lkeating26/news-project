const express = require("express");

const cors = require("cors");

const { handlePsqlErrors, handleCustomErrors } = require("./errors/index");

const apiRouter = require("./routes/api-router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.all("/api/*", (req, res, next) => {
  res.status(404).send({ msg: "Path not found!" });
});

module.exports = app;
