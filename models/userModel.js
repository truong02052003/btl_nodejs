const conn = require('../config/database');

const createUser = (user, callback) => {
    const sql = 'INSERT INTO customers (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)';
    conn.query(sql, [user.name, user.email, user.phone, user.address, user.password], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
};

const findUserByEmailAndPassword = (email, password, callback) => {
    const sql = 'SELECT * FROM customers WHERE email = ? AND password = ?';
    conn.query(sql, [email, password], (err, data) => {
        if (err) return callback(err);
        callback(null, data[0] || null);
    });
};

module.exports = {
    createUser,
    findUserByEmailAndPassword
};