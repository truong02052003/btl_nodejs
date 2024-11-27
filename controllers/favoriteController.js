const Favorite = require('../models/favoriteModel');
const Category = require('../models/categoryModel'); // Import model Category để lấy danh mục
const Banner = require('../models/bannerModel'); // Import model Banner để lấy banner

// Lấy danh sách sản phẩm yêu thích
const getFavoritesPage = (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ session

    // Lấy danh sách danh mục sản phẩm
    Category.getAllCategories((err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Lấy danh sách sản phẩm yêu thích của người dùng
        Favorite.getFavoritesByUserId(userId, (err, favorites) => {
            if (err) {
                console.error('Error fetching favorites:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Lấy giỏ hàng từ session
            const carts = req.session.carts || []; // Nếu giỏ hàng không tồn tại, gán giá trị mặc định là mảng rỗng

            // Lấy banner top (giả sử bạn có một function trong Banner model)
            Banner.getTopBanner((err, topBanner) => {
                if (err) {
                    console.error('Error fetching top banner:', err);
                    return res.status(500).send('Internal Server Error');
                }

                // Render trang favorites và truyền thông tin vào view
                res.render('home/favorites', {
                    favorites,
                    categories, // Truyền danh sách danh mục vào view
                    carts, // Truyền giỏ hàng vào view
                    topBanner, // Truyền thông tin banner top vào view
                    userAuthenticated: req.isAuthenticated(), // Truyền thông tin xác thực người dùng vào view
                    user: req.user // Truyền thông tin người dùng vào view
                });
            });
        });
    });
};

// Thêm hoặc xóa sản phẩm yêu thích
const toggleFavorite = (req, res) => {
    const userId = req.user.id; // Lấy ID người dùng từ session
    const productId = req.params.id; // Lấy ID sản phẩm từ URL

    // Kiểm tra xem sản phẩm đã yêu thích chưa
    Favorite.checkFavorite(userId, productId, (err, isFavorited) => {
        if (err) {
            console.error('Error checking favorite:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (isFavorited) {
            // Nếu sản phẩm đã yêu thích, xóa khỏi danh sách yêu thích
            Favorite.removeFavorite(userId, productId, (err) => {
                if (err) {
                    console.error('Error removing favorite:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/favorites');
            });
        } else {
            // Nếu sản phẩm chưa yêu thích, thêm vào danh sách yêu thích
            Favorite.addFavorite(userId, productId, (err) => {
                if (err) {
                    console.error('Error adding favorite:', err);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/favorites');
            });
        }
    });
};

module.exports = {
    getFavoritesPage,
    toggleFavorite
};
