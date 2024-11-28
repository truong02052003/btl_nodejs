const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("./config/passport");
const flash = require("connect-flash");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const homeRoutes = require("./routes/homeRoutes");
const accountRoutes = require("./routes/accountRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartMiddleware = require("./Middleware/cartMiddleware");

const app = express();
const port = 3000;

app.use(flash());
app.use(cookieParser());

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình session trước Passport
app.use(
  session({
    secret: "truong0205",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // secure=false trong môi trường phát triển
    },
  })
);

// Khởi tạo Passport
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use((req, res, next) => {
  res.locals.success_flash = req.flash("success");
  res.locals.error_flash = req.flash("error");
  next();
});
app.get('/confirm-payment', (req, res) => {
  res.render('home/confirm-payment'); // Đây là nơi bạn render confirm-payment.ejs
});

// Routes
app.use("/", categoryRoutes);
app.use("/", productRoutes);
app.use("/", homeRoutes);
app.use("/", accountRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/cart", cartRoutes);

app.use("/order", orderRoutes);

// Middleware cho giỏ hàng
app.use(cartMiddleware);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
