const Cart = require('../models/cartModel');

const cartController = {
    // Hiển thị giỏ hàng
    getCartPage: (req, res) => {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login');
        }

        Cart.getCartByUserId(userId, (err, carts) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi server');
            }

            // Nếu không có sản phẩm nào trong giỏ hàng
            if (!carts || carts.length === 0) {
                return res.render('home/cart', { carts: [], message: 'Giỏ hàng của bạn đang trống.' });
            }

            // Truyền thông tin giỏ hàng vào view
            res.render('home/cart', { carts });
        });
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart: (req, res) => {
        const { productId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        Cart.getCartByUserId(userId, (err, carts) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi server');
            }

            // Kiểm tra sản phẩm đã có trong giỏ hàng hay chưa
            const existingProduct = carts.find(item => item.product_id === parseInt(productId));

            if (existingProduct) {
                // Nếu sản phẩm đã có, tăng số lượng
                const newQuantity = existingProduct.quantity + 1;
                Cart.updateQuantity(userId, productId, newQuantity, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Lỗi server');
                    }
                    res.redirect('/cart');
                });
            } else {
                // Nếu sản phẩm chưa có, thêm sản phẩm mới vào giỏ
                Cart.addProduct(userId, productId, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Lỗi server');
                    }
                    res.redirect('/cart');
                });
            }
        });
    },

    // Cập nhật số lượng sản phẩm trong giỏ
    updateQuantity: (req, res) => {
        const productId = req.params.productId;  // Lấy ID sản phẩm từ URL
        const quantity = req.body.quantity;  // Lấy số lượng sản phẩm từ form gửi lên
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).send('Số lượng sản phẩm không hợp lệ');
        }

        Cart.updateQuantity(userId, productId, quantity, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi server');
            }

            // Sau khi cập nhật, chuyển hướng đến trang giỏ hàng
            res.redirect('/cart');
        });
    },

    // Xóa sản phẩm khỏi giỏ
    removeProduct: (req, res) => {
        const { productId } = req.params;
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        Cart.removeProduct(userId, productId, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi server');
            }
            res.redirect('/cart');
        });
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: (req, res) => {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect('/login');
        }

        Cart.clearCart(userId, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi server');
            }
            res.redirect('/cart');
        });
    }
};

module.exports = cartController;
