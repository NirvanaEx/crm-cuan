const express = require('express');
const router = express.Router();
const userSettingController = require('../../controllers/profile/userSettingController');

router.get('/', userSettingController.getSettings);
router.put('/', userSettingController.updateSettings);

module.exports = router;
