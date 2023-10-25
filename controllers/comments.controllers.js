const { createComment, selectComments, removeComment } = require('../models/comments.models')

const postComment = (req, res, next) => {
    const { article_id } = req.params;
    const newComment = req.body;
    if(!newComment.username || !newComment.body) {
        return res.status(400).send({msg: 'Please provide username and body'})
    }
    createComment(newComment, article_id).then((comment) => {
        res.status(201).send({ comment })
    })
    .catch((err) => {
        next(err)
    })
}     

const getComments = (req, res, next) => {
    const { article_id } = req.params;
    
    selectComments(article_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })
}

const deleteComment = (req, res, next) => {
    const { comment_id } = req.params;

    removeComment(comment_id).then(() => {
        res.status(204).send()
    })
    .catch((err) => {
        next(err)
    })
}





module.exports = { postComment, getComments, deleteComment }
