
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const profileController = require('../../controllers/profile/profileController');

// Маршруты для работы с профилем пользователя
router.get('/me', profileController.getProfile);
router.post('/update-profile', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);

module.exports = router;
