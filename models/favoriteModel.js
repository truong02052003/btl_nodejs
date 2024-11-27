const conn = require('../config/database'); // Kết nối tới database

const Favorite = {
    // Lấy danh sách sản phẩm yêu thích của một người dùng
    getFavoritesByUserId: (userId, callback) => {
        const sql = `
            SELECT p.id, p.name, p.price, p.sale_price, p.image, f.created_at, f.updated_at 
            FROM products p
            JOIN favorites f ON p.id = f.product_id 
            WHERE f.customer_id = ?
        `;
        conn.query(sql, [userId], callback);
    },

    // Kiểm tra xem sản phẩm có trong danh sách yêu thích của người dùng hay không
    checkFavorite: (userId, productId, callback) => {
        const sql = 'SELECT * FROM favorites WHERE customer_id = ? AND product_id = ?';
        conn.query(sql, [userId, productId], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0); // Trả về true nếu sản phẩm đã yêu thích
        });
    },

    // Thêm sản phẩm vào danh sách yêu thích
    addFavorite: (userId, productId, callback) => {
        const sql = 'INSERT INTO favorites (customer_id, product_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
        conn.query(sql, [userId, productId], callback);
    },

    // Xóa sản phẩm khỏi danh sách yêu thích
    removeFavorite: (userId, productId, callback) => {
        const sql = 'DELETE FROM favorites WHERE customer_id = ? AND product_id = ?';
        conn.query(sql, [userId, productId], callback);
    },

    // Thêm hoặc xóa sản phẩm yêu thích
    toggleFavorite: (userId, productId, callback) => {
        const checkQuery = 'SELECT * FROM favorites WHERE customer_id = ? AND product_id = ?';
        conn.query(checkQuery, [userId, productId], (err, results) => {
            if (err) return callback(err);
            if (results.length > 0) {
                // Nếu đã yêu thích, xóa bỏ và cập nhật `updated_at`
                const deleteQuery = 'DELETE FROM favorites WHERE customer_id = ? AND product_id = ?';
                conn.query(deleteQuery, [userId, productId], callback);
            } else {
                // Nếu chưa yêu thích, thêm mới và gán `created_at` và `updated_at`
                const insertQuery = 'INSERT INTO favorites (customer_id, product_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
                conn.query(insertQuery, [userId, productId], callback);
            }
        });
    },

    // Cập nhật thông tin yêu thích (ví dụ, cập nhật `updated_at`)
    updateFavorite: (userId, productId, callback) => {
        const sql = 'UPDATE favorites SET updated_at = NOW() WHERE customer_id = ? AND product_id = ?';
        conn.query(sql, [userId, productId], callback);
    }
};

module.exports = Favorite;
