const express = require('express');
const router = express.Router();
const userSettingController = require('../controllers/userSettingController');

router.get('/', userSettingController.getSettings);
router.put('/', userSettingController.updateSettings);

module.exports = router;
