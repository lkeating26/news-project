
const handlePsqlErrors = (err, req, res, next) => {
    if(err.code === '22P02') {
        res.status(400).send({ msg: 'invalid id'})
    } else next(err)
}

const handleCustomErrors = (err, req, res, next) => {
    if(err.status) {
        res.status(err.status).send({msg: err.msg})
    } else next(err)
}



module.exports = {
    handlePsqlErrors,
    handleCustomErrors,
}