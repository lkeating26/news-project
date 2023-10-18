const db = require('../db/connection');

const selectUsers = () => {
    return db.query(
        `SELECT * FROM users;`)
    .then((result) => {
        return result.rows;
    })
}

module.exports = { selectUsers }