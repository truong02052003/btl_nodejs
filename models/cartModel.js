const conn = require("../config/database"); // Kết nối cơ sở dữ liệu

const Cart = {
  // Lấy giỏ hàng của người dùng, bao gồm thông tin sản phẩm
  getCartByUserId: (userId, callback) => {
    const query = `
           SELECT 
            c.product_id, 
            c.quantity, 
            c.price AS cart_price, 
            p.name, 
            p.price AS product_price, 
            p.sale_price, 
            p.image
        FROM carts c
        JOIN products p ON c.product_id = p.id
        WHERE c.customer_id = ?
        `;
    conn.query(query, [userId], callback);
  },

  // Thêm sản phẩm vào giỏ
  addProduct: (userId, productId, callback) => {
    const query = `INSERT INTO carts (customer_id, product_id, quantity) VALUES (?, ?, 1)`;
    conn.query(query, [userId, productId], callback);
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  updateQuantity: (userId, productId, quantity, callback) => {
    const query = `UPDATE carts SET quantity = ? WHERE customer_id = ? AND product_id = ?`;
    conn.query(query, [quantity, userId, productId], callback);
  },

  // Xóa sản phẩm khỏi giỏ
  removeProduct: (userId, productId, callback) => {
    const query = `DELETE FROM carts WHERE customer_id = ? AND product_id = ?`;
    conn.query(query, [userId, productId], callback);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: (userId, callback) => {
    const query = `DELETE FROM carts WHERE customer_id = ?`;
    conn.query(query, [userId], callback);
  },
};

module.exports = Cart;
