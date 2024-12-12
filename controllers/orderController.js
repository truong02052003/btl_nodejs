// controllers/orderController.js

const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const paypal = require("@paypal/checkout-server-sdk");

// Cấu hình PayPal SDK
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    "ATSO14A_8db9PpFlCTdYMhaJp5W9GPG4LTLKXmrst8nT6QwnS7wPDyDjHbI3aKFb3jKgkBSmFpjZ6nDG",
    "EOtVMUHRH_-UzkRrlNwneac1mb70u9r2KS03I1JptW4yAl0PVksiFfEIRpp1VFD7uNB_Y4ONiegGe7nB"
  )
);

const OrderController = {
  // Hiển thị trang checkout với thông tin giỏ hàng
  checkout: (req, res) => {
    const userId = req.session.userId;

    Cart.getCartByUserId(userId, (err, cartItems) => {
      if (err) return res.status(500).send("Lỗi khi lấy giỏ hàng.");
      if (!cartItems.length) return res.redirect("/cart");

      const totalAmount = cartItems.reduce(
        (sum, item) =>
          sum + item.quantity * (item.sale_price || item.product_price),
        0
      );

      res.render("home/order", { cartItems, totalAmount });
    });
  },

  // Tạo thanh toán PayPal với nút "Pay Now"
  createPayment: (req, res) => {
    const userId = req.session.userId;

    Cart.getCartByUserId(userId, (err, cartItems) => {
      if (err) return res.status(500).send("Lỗi khi lấy giỏ hàng.");
      if (!cartItems.length) return res.redirect("/cart");

      const totalAmount = cartItems.reduce(
        (sum, item) =>
          sum + item.quantity * (item.sale_price || item.product_price),
        0
      );

      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `USER_${userId}`,
            amount: {
              currency_code: "USD",
              value: (totalAmount / 23000).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "MeatDeli",
          user_action: "PAY_NOW",

          return_url: `${req.protocol}://${req.get("host")}/confirm-payment`,
          cancel_url: `${req.protocol}://${req.get("host")}/cart`,
        },
      });

      paypalClient
        .execute(request)
        .then((paypalOrder) => {
          res.redirect(
            paypalOrder.result.links.find((link) => link.rel === "approve").href
          );
        })
        .catch((err) => {
          console.error("Lỗi khi tạo thanh toán PayPal:", err);
          res.status(500).send("Lỗi khi tạo thanh toán PayPal.");
        });
    });
  },

  // Xác nhận thanh toán PayPal và lưu vào CSDL với kiểm tra lỗi chi tiết
  confirmPayment: (req, res) => {
    const { token } = req.query;

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    paypalClient
      .execute(request)
      .then((response) => {
        const transactionId =
          response.result.purchase_units[0].payments.captures[0].id;
        const status = response.result.status;
        const userId = req.session.userId;
        d;
        Cart.getCartByUserId(userId, (err, cartItems) => {
          if (err) {
            console.error("Lỗi khi lấy giỏ hàng:", err);
            return res.status(500).send("Không thể lấy giỏ hàng.");
          }

          if (!cartItems.length) {
            console.error("Giỏ hàng trống.");
            return res.redirect("/cart");
          }
          const totalAmount = cartItems.reduce(
            (sum, item) =>
              sum + item.quantity * (item.sale_price || item.product_price),
            0
          );
          const customerDetails = {
            name: req.session.userName || "Tên khách hàng",
            email: req.session.userEmail || "email@example.com",
            phone: req.session.userPhone || "0123456789",
            address: req.session.userAddress || "Địa chỉ mặc định",
          };
          Order.createOrder(
            userId,
            cartItems,
            totalAmount,
            customerDetails,
            (err, orderId) => {
              if (err) {
                console.error("Lỗi khi lưu đơn hàng:", err);
                return res.status(500).send("Không thể lưu đơn hàng.");
              }
              Order.saveTransaction(orderId, transactionId, status, (err) => {
                if (err) {
                  console.error("Lỗi khi lưu giao dịch:", err);
                  return res.status(500).send("Không thể lưu giao dịch.");
                }
                Cart.clearCartByUserId(userId, (err) => {
                  if (err) {
                    console.error("Lỗi khi xóa giỏ hàng:", err);
                    return res
                      .status(500)
                      .send("Không thể xóa giỏ hàng sau khi thanh toán.");
                  }

                  res.render("home/confirm-payment", {
                    transactionId,
                    status,
                  });
                });
              });
            }
          );
        });
      })
      .catch((err) => {
        console.error("Lỗi khi xác nhận thanh toán PayPal:", err);
        res.status(500).send("Không thể xác nhận thanh toán.");
      });
  },
};

module.exports = OrderController;
