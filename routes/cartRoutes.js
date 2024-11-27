const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Hiển thị trang giỏ hàng
router.get('/', cartController.getCartPage);

// Thêm sản phẩm vào giỏ hàng
router.get('/add/:productId', cartController.addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.post('/update/:productId', cartController.updateQuantity);

// Xóa sản phẩm khỏi giỏ hàng
router.get('/delete/:productId', cartController.removeProduct);


// Xóa toàn bộ giỏ hàng - sử dụng POST
router.post('/clear', cartController.clearCart);


module.exports = router;
