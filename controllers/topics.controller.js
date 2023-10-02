const { selectTopics } = require('../models/topics.models');

const getTopics = (req, res, next) => {
    console.log('in controller')
    selectTopics().then((topics) => {
        res.status(200).send({ topics });
    });
};

module.exports = { getTopics }