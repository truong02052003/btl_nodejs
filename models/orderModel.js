const conn = require("../config/database"); // Kết nối cơ sở dữ liệu

const Order = {
  // Thêm đơn hàng mới
  createOrder: (userId, cartItems, totalAmount, callback) => {
    const query = `
            INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, 'pending');
        `;
    conn.query(query, [userId, totalAmount], (err, result) => {
      if (err) return callback(err);

      const orderId = result.insertId;
      const orderItems = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.cart_price,
      ]);
      const itemsQuery = `
                INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?;
            `;
      conn.query(itemsQuery, [orderItems], callback);
    });
  },

  // Lưu thông tin giao dịch PayPal
  saveTransaction: (orderId, transactionId, status, callback) => {
    const query = `
            UPDATE orders SET transaction_id = ?, status = ? WHERE id = ?;
        `;
    conn.query(query, [transactionId, status, orderId], callback);
  },

  // Lấy thông tin đơn hàng theo người dùng
  getOrdersByUserId: (userId, callback) => {
    const query = `
            SELECT o.id, o.total_amount, o.status, o.created_at, oi.product_id, oi.quantity, oi.price
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC;
        `;
    conn.query(query, [userId], callback);
  },
};

module.exports = Order;
