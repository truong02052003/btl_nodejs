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
          user_action: "PAY_NOW", // Hiển thị nút "Pay Now"
          return_url: `${req.protocol}://${req.get(
            "host"
          )}/order/confirm-payment`, // Đường dẫn xác nhận
          cancel_url: `${req.protocol}://${req.get("host")}/order/cancel`, // Đường dẫn hủy
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
          console.error(err);
          res.status(500).send("Lỗi khi tạo thanh toán PayPal.");
        });
    });
  },

  // Xác nhận thanh toán PayPal
  confirmPayment: (req, res) => {
    const { token } = req.query; // Lấy token PayPal từ query string

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    paypalClient
      .execute(request)
      .then((response) => {
        const status = response.result.status;
        const transactionId =
          response.result.purchase_units[0].payments.captures[0].id;

        Order.saveTransaction(
          req.session.userId,
          transactionId,
          status,
          (err) => {
            if (err) return res.status(500).send("Lỗi khi lưu giao dịch.");

            // Hiển thị trang xác nhận thanh toán
            res.render("home/confirm-payment");
          }
        );
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Lỗi khi xác nhận thanh toán.");
      });
  },
};

module.exports = OrderController;
