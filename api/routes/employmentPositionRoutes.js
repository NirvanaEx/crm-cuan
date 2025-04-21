const express = require('express');
const router = express.Router();
const positionController = require('../controllers/employmentPositionController');
const checkAccess = require('../middlewares/checkAccess');

// Получение всех должностей
router.get('/', checkAccess('position_read'), positionController.getPositions);

// Получение одной должности по ID
router.get('/:id', checkAccess('position_read'), positionController.getPositionById);

// Создание должности
router.post('/', checkAccess('position_create'), positionController.createPosition);

// Обновление должности
router.put('/:id', checkAccess('position_update'), positionController.updatePosition);

// Мягкое удаление должности
router.delete('/:id', checkAccess('position_delete'), positionController.deletePosition);

module.exports = router;
