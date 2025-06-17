// routes/carCategoryRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/carCategoryController');
const checkAccess = require('../middlewares/checkAccess');

// List all
router.get('/', checkAccess('carCategory_read'), ctrl.list);

// Get by id
router.get('/:id', checkAccess('carCategory_read'), ctrl.getById);

// Create new
router.post('/', checkAccess('carCategory_create'), ctrl.create);

// Update existing
router.put('/:id', checkAccess('carCategory_update'), ctrl.update);

// Soft-delete
router.delete('/:id', checkAccess('carCategory_delete'), ctrl.delete);

module.exports = router;
