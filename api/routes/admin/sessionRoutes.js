const express = require('express');
const router = express.Router();
const sessionController = require('../../controllers/admin/sessionController');
const checkAccess = require('../../middlewares/checkAccess');

// GET: Получение списка всех сессий с пагинацией и поиском
router.get('/', checkAccess('session_read'), sessionController.getAllSessions);

// POST: Создание новой сессии (например, при логине)
router.post('/', checkAccess('session_create'), sessionController.createSession);

// PUT: Обновление даты последней активности сессии
router.put('/:id', checkAccess('session_update'), sessionController.updateSessionLastActive);

// DELETE: Удаление сессии
router.delete('/:id', checkAccess('session_delete'), sessionController.deleteSession);

module.exports = router;
