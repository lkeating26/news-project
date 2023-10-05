const { createComment } = require('../models/comments.models')

const postComment = (req, res, next) => {
    const { article_id } = req.params;
    const newComment = req.body;
    if(!newComment.username || !newComment.body) {
        return res.status(422).send({msg: 'Please provide username and body'})
    }
    createComment(newComment, article_id).then((comment) => {
        res.status(201).send({ comment })
    })
    .catch((err) => {
        next(err)
    })
}







module.exports = { postComment }