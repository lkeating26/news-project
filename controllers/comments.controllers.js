const { selectComments } = require('../models/comments.models');

const getComments = (req, res, next) => {
    const { article_id } = req.params;
    
    selectComments(article_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })
}


module.exports = { getComments }