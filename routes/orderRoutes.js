const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/orderController");

// Route hiển thị checkout
router.post("/", OrderController.checkout);

// Route tạo thanh toán PayPal
router.post("/create-payment", OrderController.createPayment);

// Route xác nhận thanh toán
router.get("/confirm-payment", OrderController.confirmPayment);

module.exports = router;
