const db = require("../db/connection");
const { selectArticleById } = require("./articles.models");

const createComment = (newComment, article_id) => {
  return db
    .query(
      `
        INSERT INTO comments(
        body, 
        article_id, 
        author)
        VALUES
        ($1, $2, $3)
        RETURNING *;`,
      [newComment.body, article_id, newComment.username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

const selectComments = (article_id) => {
  return selectArticleById(article_id)
    .then(() => {
      return db.query(
        `
        SELECT *
        FROM comments
        WHERE article_id=$1
        ORDER BY created_at DESC;
        `,
        [article_id]
      );
    })
    .then((comments) => {
      return comments.rows;
    });
};

const removeComment = (comment_id) => {
  return db
    .query(
      `
    DELETE
    FROM comments
    WHERE comment_id=$1
    RETURNING *`,
      [comment_id]
    )
    .then(({ rows }) => {
      const comment = rows[0];
      if (!comment) {
        return Promise.reject({ status: 404, msg: "Comment_id not found!" });
      }
      return comment;
    });
};

const updateComment = (comment_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE comments
    SET votes = votes + $2
    WHERE comment_id = $1
    RETURNING *;`,
      [comment_id, inc_votes]
    )
    .then(({ rows }) => {
      const comment = rows[0];
      if (!comment) {
        return Promise.reject({ status: 404, msg: "Comment_id not found!" });
      }
      return comment;
    });
};

module.exports = {
  selectComments,
  createComment,
  removeComment,
  updateComment,
};
