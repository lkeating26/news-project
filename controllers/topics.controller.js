const { selectTopics, createTopic } = require("../models/topics.models");

const getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

const postTopic = (req, res, next) => {
  const newTopic = req.body;
  if (!newTopic.slug || !newTopic.description) {
    return res.status(400).send({ msg: "Please provide slug and description" });
  }
  createTopic(newTopic)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getTopics, postTopic };
