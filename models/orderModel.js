const conn = require("../config/database"); // Kết nối cơ sở dữ liệu

const Order = {
  // Thêm đơn hàng mới
  createOrder: (userId, cartItems, totalAmount, customerDetails, callback) => {
    const { name, email, phone, address } = customerDetails;
    const query = `
      INSERT INTO orders (customer_id, name, email, phone, address, total_amount, status, token, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW());
    `;
    const token = generateToken(); // Hàm tạo mã token

    conn.query(query, [userId, name, email, phone, address, totalAmount, token], (err, result) => {
      if (err) return callback(err);

      const orderId = result.insertId;
      const orderDetails = cartItems.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.cart_price,
      ]);
      
      const itemsQuery = `
        INSERT INTO order_details (order_id, product_id, quantity, price) VALUES ?;
      `;
      conn.query(itemsQuery, [orderDetails], callback);
    });
  },

  // Lưu thông tin giao dịch PayPal (nếu cần)
  saveTransaction: (orderId, transactionId, status, callback) => {
    const query = `
      UPDATE orders SET status = ? WHERE id = ?;
    `;
    conn.query(query, [status, orderId], callback);
  },

  // Lấy thông tin đơn hàng theo người dùng
  getOrdersByUserId: (userId, callback) => {
    const query = `
      SELECT o.id, o.name, o.email, o.phone, o.address, o.total_amount, o.status, o.created_at, o.token, 
             od.product_id, od.quantity, od.price
      FROM orders o
      JOIN order_details od ON o.id = od.order_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC;
    `;
    conn.query(query, [userId], callback);
  },
};

// Hàm tạo mã token (ví dụ: UUID hoặc chuỗi ngẫu nhiên)
function generateToken() {
  return Math.random().toString(36).substr(2, 9); // Ví dụ tạo mã ngẫu nhiên
}

module.exports = Order;
