const Banner = require('../models/bannerModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// Hàm index
const index = (req, res) => {
    // Lấy banner đầu tiên
    Banner.getFirstBanner((err, topBanner) => {
        if (err) return res.send('Internal Server Error');

        // Lấy tất cả sản phẩm
        Product.getAll((err, allProducts) => {
            if (err) return res.send('Internal Server Error');

            // Lấy tất cả danh mục
            Category.getAllCategories((err, categories) => {
                if (err) return res.send('Internal Server Error');

                // Ghép sản phẩm với danh mục của chúng
                const productsWithCategories = allProducts.map(product => {
                    const category = categories.find(cat => cat.id === product.category_id);
                    return { ...product, cat: category };
                });

                // Lọc các sản phẩm theo loại (mới, giảm giá, hot)
                const newsProducts = productsWithCategories.slice(0, 2);
                const saleProducts = productsWithCategories.filter(p => p.sale_price > 0).slice(0, 3);
                const hotProducts = productsWithCategories.sort(() => Math.random() - 0.5).slice(0, 4);

                // Lấy giỏ hàng từ session
                const carts = req.session.carts || [];

                // Render view với các dữ liệu cần thiết
                res.render('home/index', {
                    topBanner,
                    news_products: newsProducts,
                    sale_products: saleProducts,
                    hot_products: hotProducts,
                    gallerys: [], // Bạn có thể thay đổi dữ liệu này nếu cần
                    userAuthenticated: req.isAuthenticated(),
                    user: req.user || null,
                    categories,
                    carts
                });
            });
        });
    });
};

// Hàm about

const about = (req, res) => {
    // Lấy tất cả danh mục từ cơ sở dữ liệu
    Category.getAllCategories((err, categories) => {
        if (err) return res.send('Internal Server Error');

        // Lấy giỏ hàng từ session
        const carts = req.session.carts || []; // Nếu không có giỏ hàng thì để là mảng rỗng

        // Truyền categories, carts và các dữ liệu khác vào view
        res.render('home/about', {
            categories, // Truyền danh mục vào view
            carts,      // Truyền giỏ hàng vào view
            userAuthenticated: req.isAuthenticated(), // Kiểm tra xem người dùng đã đăng nhập chưa
            user: req.user || null, // Lấy thông tin người dùng nếu có, nếu không thì null
        });
    });
};
const blog = (req, res) => {
    // Lấy tất cả danh mục từ cơ sở dữ liệu
    Category.getAllCategories((err, categories) => {
        if (err) return res.send('Internal Server Error');

        // Lấy giỏ hàng từ session
        const carts = req.session.carts || []; // Nếu không có giỏ hàng thì để là mảng rỗng

        // Truyền categories, carts và các dữ liệu khác vào view
        res.render('home/blog', {
            categories, // Truyền danh mục vào view
            carts,      // Truyền giỏ hàng vào view
            userAuthenticated: req.isAuthenticated(), // Kiểm tra xem người dùng đã đăng nhập chưa
            user: req.user || null, // Lấy thông tin người dùng nếu có, nếu không thì null
        });
    });
};
const page = (req, res) => {
    // Lấy tất cả danh mục từ cơ sở dữ liệu
    Category.getAllCategories((err, categories) => {
        if (err) return res.send('Internal Server Error');

        // Lấy giỏ hàng từ session
        const carts = req.session.carts || []; // Nếu không có giỏ hàng thì để là mảng rỗng

        // Truyền categories, carts và các dữ liệu khác vào view
        res.render('home/page', {
            categories, // Truyền danh mục vào view
            carts,      // Truyền giỏ hàng vào view
            userAuthenticated: req.isAuthenticated(), // Kiểm tra xem người dùng đã đăng nhập chưa
            user: req.user || null, // Lấy thông tin người dùng nếu có, nếu không thì null
        });
    });
};
const contact = (req, res) => {
    // Lấy tất cả danh mục từ cơ sở dữ liệu
    Category.getAllCategories((err, categories) => {
        if (err) return res.send('Internal Server Error');

        // Lấy giỏ hàng từ session
        const carts = req.session.carts || []; // Nếu không có giỏ hàng thì để là mảng rỗng

        // Truyền categories, carts và các dữ liệu khác vào view
        res.render('home/contact', {
            categories, // Truyền danh mục vào view
            carts,      // Truyền giỏ hàng vào view
            userAuthenticated: req.isAuthenticated(), // Kiểm tra xem người dùng đã đăng nhập chưa
            user: req.user || null, // Lấy thông tin người dùng nếu có, nếu không thì null
        });
    });
};

// Hàm category
const category = (req, res) => {
    const categoryId = req.params.catId;

    // Lấy banner đầu tiên
    Banner.getFirstBanner((err, topBanner) => {
        if (err) return res.send('Internal Server Error');

        // Lấy tất cả sản phẩm
        Product.getAll((err, allProducts) => {
            if (err) return res.send('Internal Server Error');

            // Lọc sản phẩm theo danh mục
            const products = allProducts.filter(p => p.category_id == categoryId)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const newsProducts = allProducts.slice(0, 3); // Lấy 3 sản phẩm mới nhất

            // Lấy danh mục để truyền vào view
            Category.getAllCategories((err, categories) => {
                if (err) return res.send('Internal Server Error');

                // Chuẩn bị dữ liệu cho view
                const userAuthenticated = req.isAuthenticated();
                const user = req.user || null;
                const carts = req.session.carts || [];
                const categoryMap = categories.reduce((map, cat) => {
                    map[cat.id] = cat.name;
                    return map;
                }, {});

                res.render('home/category', {
                    cat: { id: categoryId },
                    products,
                    news_products: newsProducts,
                    categories,
                    userAuthenticated,
                    user,
                    carts,
                    topBanner,
                    categoryMap
                });
            });
        });
    });
};

// Hàm product
const product = (req, res) => {
    const productId = req.params.productId;

    // Lấy thông tin sản phẩm theo ID
    Product.getById(productId, (err, product) => {
        if (err) return res.send('Internal Server Error');
        if (!product) return res.status(404).send('Product not found');

        // Lấy tất cả sản phẩm để tìm sản phẩm liên quan
        Product.getAll((err, allProducts) => {
            if (err) return res.send('Internal Server Error');

            // Lọc sản phẩm theo cùng danh mục và loại trừ sản phẩm hiện tại
            const products = allProducts
                .filter(p => p.category_id === product.category_id && p.id !== productId)
                .slice(0, 12); // Lấy 12 sản phẩm liên quan

            res.render('home/product', {
                product,
                products
            });
        });
    });
};

module.exports = {
    index,
    about,
    blog,
    page,
    contact,
    category,
    product
};
