const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');
const checkAccess = require('../middlewares/checkAccess');

// Маршруты для работы с access
router.get('/', checkAccess('access_read'), accessController.getAccessList);
router.get('/:id', checkAccess('access_read'),accessController.getAccessById);
router.post('/', checkAccess('access_create'), accessController.createAccess);
router.put('/:id', checkAccess('access_update'), accessController.updateAccess);
router.delete('/:id', checkAccess('access_delete'), accessController.deleteAccess);

module.exports = router;
