const db = require('../db/connection')

const selectArticles = () => {
    return db.query(
        `SELECT articles.author,
        articles.title, 
        articles.article_id, 
        articles.topic, 
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comment_id)::int AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;`)
        .then((articles) => {
        return articles.rows;
    })
}

const selectArticleById = (article_id) => {
    return db.query(`SELECT * FROM articles WHERE article_id=$1;`, [article_id])
        .then(({ rows }) => {
            const article = rows[0];
            if(!article) {
                return Promise.reject({ status: 404, msg: 'Article_id not found!' })
            }
            return article;
        });
};

const updateArticle = (article_id, inc_votes) => {
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`, [inc_votes, article_id])
    .then(({ rows }) => {
        const article = rows[0];
        if(!article) {
            return Promise.reject({ status: 404, msg: 'Article_id not found!' })
        }
        return article;
    })
}


module.exports = { selectArticles, selectArticleById, updateArticle }