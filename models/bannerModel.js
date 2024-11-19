const conn = require('../config/database');


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

module.exports = {
  getBanners,
  getFirstBanner
};
