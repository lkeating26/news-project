const db = require('../db/connection')

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
            console.log(rows[0])
            return rows[0];
        })
}

module.exports = { createComment }