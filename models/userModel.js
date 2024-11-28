const conn = require('../config/database');
const bcrypt = require('bcrypt'); // Import bcrypt

const User = {
    // Hàm tạo người dùng mới
    createUser: (user, callback) => {
        const sql = 'INSERT INTO customers (name, email, phone, address, password, role) VALUES (?, ?, ?, ?, ?, ?)';
        conn.query(
            sql,
            [user.name, user.email, user.phone, user.address, user.password, user.role || 'NULL'],
            (err, result) => {
                if (err) return callback(err);
                callback(null, result);
            }
        );
    },


    findUserByEmailAndPassword: (email, password, callback) => {
        const sql = 'SELECT * FROM customers WHERE email = ?';
        conn.query(sql, [email], (err, data) => {
            if (err) return callback(err);
            if (!data[0]) return callback(null, null); // Không tìm thấy người dùng

            const user = data[0];
            // So sánh mật khẩu băm
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return callback(err);
                if (!isMatch) return callback(null, null); // Mật khẩu không khớp
                callback(null, user); // Trả về người dùng nếu hợp lệ
            });
        });
    },
};

module.exports = User;
