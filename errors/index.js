
const handleCustomErrors = (err, req, res, next) => {
    console.log(err.status)
    if(err.status) {
        return res.status(err.status).send({ msg: err.msg })
    } else next(err);
};

const handlePsqlErrors = (err, req, res, next) => {
    console.log(err.status)
    if(err.code === '') {
        return res.status().send({ msg: '??'})
    } else next(err);
};

const handleServerErrors = (err, req, res, next) => {
    console.log(err)
    return res.status(500).send({ msg: 'Internal Server Error'})
}

module.exports = {
    handleCustomErrors,
    handlePsqlErrors,
    handleServerErrors
}