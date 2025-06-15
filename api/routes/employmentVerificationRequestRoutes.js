// routes/employmentVerificationRequestRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employmentVerificationRequestController');
const checkAccess = require('../middlewares/checkAccess');

// Получить весь список заявок (с пагинацией)
router.get(
  '/',
  checkAccess('verification_request_read'),
  ctrl.list
);

// Создать справку по user_id
router.post(
  '/',
  checkAccess('verification_request_create'),
  ctrl.create
);

// Обновить статус справки и дату
router.put(
  '/:id/status',
  checkAccess('verification_request_update'),
  ctrl.updateStatus
);

// Получить все справки пользователя
router.get(
  '/user/:userId',
  checkAccess('verification_request_read'),
  ctrl.getByUser
);

module.exports = router;
