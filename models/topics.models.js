const db = require('../db/connection')

const selectTopics = () => {
    return db.query('SELECT * FROM topics;').then((topics) => {
        return topics.rows;
    });
};

module.exports = { selectTopics }