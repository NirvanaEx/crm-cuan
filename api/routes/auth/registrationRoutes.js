const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/auth/registrationController');

// POST /api/registration
router.post('/', registrationController.registerRequest);

module.exports = router;
