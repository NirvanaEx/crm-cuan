const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const checkAccess = require('../middlewares/checkAccess');

// GET: Получение списка всех сессий с пагинацией и поиском
router.get('/', checkAccess('read_session'), sessionController.getAllSessions);

// POST: Создание новой сессии (например, при логине)
router.post('/', checkAccess('create_session'), sessionController.createSession);

// PUT: Обновление даты последней активности сессии
router.put('/:id', checkAccess('update_session'), sessionController.updateSessionLastActive);

// DELETE: Удаление сессии
router.delete('/:id', checkAccess('delete_session'), sessionController.deleteSession);

module.exports = router;
