const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const isAuthenticated = require('../middleware/auth'); // Middleware kiểm tra đăng nhập

// Hiển thị danh sách sản phẩm yêu thích
router.get('/', isAuthenticated, favoriteController.getFavoritesPage);

// Thêm hoặc xóa sản phẩm yêu thích
router.get('/:id', isAuthenticated, favoriteController.toggleFavorite);

module.exports = router;
