const db = require("../db/connection");

const selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((topics) => {
    return topics.rows;
  });
};

const createTopic = (newTopic) => {
  return db
    .query(
      `
        INSERT INTO topics(
        slug, 
        description)
        VALUES
        ($1, $2)
        RETURNING *;`,
      [newTopic.slug, newTopic.description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = { selectTopics, createTopic };
