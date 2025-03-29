
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');

// Маршруты для работы с профилем пользователя
router.get('/me', authMiddleware, profileController.getProfile);
router.post('/update-profile', authMiddleware, profileController.updateProfile);
router.post('/change-password', authMiddleware, profileController.changePassword);

module.exports = router;
