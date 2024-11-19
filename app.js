const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const initializePassport = require('./config/passport');
const flash = require('connect-flash');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const homeRoutes = require('./routes/homeRoutes');
const accountRoutes = require('./routes/accountRoutes');
const app = express();
const port = 3000;
app.use(flash());
initializePassport(passport);
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));



// Cấu hình session trước Passport
app.use(session({
  secret: 'truong0205',
  resave: false,
  saveUninitialized: true
}));
app.use((req, res, next) => {
  res.locals.success_flash = req.flash('success');
  res.locals.error_flash = req.flash('error');
  next();
});
// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use('/', categoryRoutes);
app.use('/', productRoutes);
app.use('/', homeRoutes);
app.use('/', accountRoutes);
app.use(homeRoutes);
// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
