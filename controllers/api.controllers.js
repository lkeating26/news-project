const endpoints = require('../endpoints.json')


const getApis = (req, res, next) => {
        res.status(200).send({ endpoints })
    };

module.exports = { getApis }