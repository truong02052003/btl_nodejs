// models/orderModel.js

const conn = require("../config/database"); // Kết nối cơ sở dữ liệu

const Order = {
  // Tạo đơn hàng mới và lưu chi tiết sản phẩm
  createOrder: (userId, cartItems, totalAmount, customerDetails, callback) => {
    const { name, email, phone, address } = customerDetails;

    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    conn.beginTransaction((err) => {
      if (err) return callback(err);

      const orderQuery = `
        INSERT INTO orders (customer_id, name, email, phone, address, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW());
      `;

      conn.query(
        orderQuery,
        [userId, name, email, phone, address, totalAmount],
        (err, result) => {
          if (err) {
            return conn.rollback(() => callback(err));
          }

          const orderId = result.insertId; // Lấy ID đơn hàng vừa tạo

          // Chuẩn bị dữ liệu chi tiết đơn hàng
          const orderDetails = cartItems.map((item) => [
            orderId,
            item.product_id,
            item.quantity,
            item.sale_price || item.product_price,
          ]);

          const orderDetailQuery = `
            INSERT INTO order_detail (order_id, product_id, quantity, price)
            VALUES ?
          `;

          conn.query(orderDetailQuery, [orderDetails], (err) => {
            if (err) {
              return conn.rollback(() => callback(err));
            }

            conn.commit((err) => {
              if (err) {
                return conn.rollback(() => callback(err));
              }

              callback(null, orderId); // Trả về ID đơn hàng nếu thành công
            });
          });
        }
      );
    });
  },

  // Lưu giao dịch PayPal vào bảng orders
  saveTransaction: (orderId, transactionId, status, callback) => {
    const query = `
      UPDATE orders
      SET transaction_id = ?, status = ?
      WHERE id = ?;
    `;

    conn.query(query, [transactionId, status, orderId], (err, result) => {
      if (err) return callback(err);

      // Kiểm tra xem cập nhật có thành công không
      if (result.affectedRows === 0) {
        return callback(
          new Error("Không tìm thấy đơn hàng để cập nhật giao dịch.")
        );
      }

      callback(null, result);
    });
  },

  // Lấy thông tin đơn hàng của người dùng
  getOrdersByUserId: (userId, callback) => {
    const query = `
      SELECT o.id, o.total_amount, o.status, o.created_at,
             d.product_id, d.quantity, d.price
      FROM orders o
      JOIN order_detail d ON o.id = d.order_id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC;
    `;

    conn.query(query, [userId], callback);
  },
};

module.exports = Order;
