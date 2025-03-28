const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

// Маршруты для работы с access
// Здесь тонкая настройка реализована прямо в контроллере, поэтому дополнительные middleware не используются
router.get('/', accessController.getAccessList);
router.get('/:id', accessController.getAccessById);
router.post('/', accessController.createAccess);
router.put('/:id', accessController.updateAccess);
router.delete('/:id', accessController.deleteAccess);

module.exports = router;
