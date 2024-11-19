const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.get('/register', authController.getRegisterPage);
router.post('/register', authController.postRegister);


router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);


router.get('/logout', authController.getLogout);

router.get('/admin/login', authController.getLoginPage);
router.post('/admin/login', authController.postLogin);
router.get('/admin/logout', authController.getLogout);
module.exports = router;
