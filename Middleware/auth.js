const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login'); // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
};

module.exports = isAuthenticated;
