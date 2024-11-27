const conn = require('../config/database');

// Lấy tất cả các banner
const getBanners = (callback) => {
  const query = 'SELECT * FROM banners';
  conn.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Lấy banner đầu tiên
const getFirstBanner = (callback) => {
  const query = 'SELECT * FROM banners LIMIT 1';
  conn.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Lấy banner top (giả sử có cột 'position' để phân biệt)
const getTopBanner = (callback) => {
  const query = 'SELECT * FROM banners WHERE position = "top" LIMIT 1';  // Lọc banner có position là 'top'
  conn.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);  // Trả về banner top
  });
};

module.exports = {
  getBanners,
  getFirstBanner,
  getTopBanner // Xuất hàm getTopBanner
};
