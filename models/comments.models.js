
const db = require('../db/connection')
const { selectArticleById } = require('./articles.models')

const createComment = (newComment, article_id) => {

    return db.query(`
        INSERT INTO comments(
        body, 
        article_id, 
        author)
        VALUES
        ($1, $2, $3)
        RETURNING *;`, 
        [newComment.body, article_id, newComment.username])
        .then(({ rows }) => {
            return rows[0];
        })
}


const selectComments = (article_id) => {
    return selectArticleById(article_id).then(() => {
        return db.query(`
        SELECT *
        FROM comments
        WHERE article_id=$1
        ORDER BY created_at DESC;
        `, [article_id])
    })
        .then((comments) => {
            return comments.rows
        })
}
module.exports = { selectComments, createComment }

