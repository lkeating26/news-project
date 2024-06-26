const db = require("../db/connection");

const selectArticles = ({
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1,
} = {}) => {
  const validSortBy = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrder = ["asc", "desc"];

  const offset = (p - 1) * limit;

  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by query" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const queryValues = [];

  let queryStr = `
    SELECT articles.author,
            articles.title,
            articles.article_id,
            articles.topic, 
            articles.created_at,
            articles.votes,         
            articles.article_img_url,
            COUNT(comment_id)::int AS comment_count,
            COUNT(*) OVER()::int AS total_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        `;

  if (topic) {
    queryValues.push(topic);
    queryStr += `WHERE articles.topic = $1 `;
  }

  queryStr += `GROUP BY articles.article_id 
                ORDER BY ${sort_by} ${order}
                LIMIT $${queryValues.length + 1} OFFSET $${
    queryValues.length + 2
  };`;

  queryValues.push(limit, offset);

  return db.query(queryStr, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Topic not found!" });
    }
    return rows;
  });
};

const selectArticleById = (article_id) => {
  return db
    .query(
      `
    SELECT articles.*, COUNT(comments.comment_id):: int AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [article_id]
    )
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article_id not found!" });
      }
      return article;
    });
};

const updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({ status: 404, msg: "Article_id not found!" });
      }
      return article;
    });
};

const createArticle = ({ title, body, topic, author, article_img_url }) => {
  const values = [title, body, topic, author];
  let placeholders = `$1, $2, $3, $4`;

  if (article_img_url) {
    values.push(article_img_url);
    placeholders += `, $5`;
  } else {
    placeholders += `, DEFAULT`;
  }

  const query = `
  INSERT INTO articles (title, body, topic, author, article_img_url)
  VALUES (${placeholders})
  RETURNING *, 0 AS comment_count;`;

  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

module.exports = {
  selectArticles,
  selectArticleById,
  updateArticle,
  createArticle,
};
