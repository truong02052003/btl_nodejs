const Cart = require('../models/cartModel');

const cartMiddleware = (req, res, next) => {
    const userId = req.session.userId;

    if (!userId) {
        res.locals.cartCount = 0;
        return next();
    }

    Cart.getCartByUserId(userId, (err, carts) => {
        if (err) {
            console.error(err);
            res.locals.cartCount = 0;
        } else {
            res.locals.cartCount = carts.reduce((total, item) => total + item.quantity, 0);
        }
        next();
    });
};

module.exports = cartMiddleware;
