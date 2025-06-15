const express   = require('express');
const router    = express.Router({ mergeParams: true });
const ctrl      = require('../controllers/employmentVerificationContractPeriodController');
const checkAccess = require('../middlewares/checkAccess');

// Получить все выбранные периоды одной справки
router.get(
  '/:requestId/periods',
  checkAccess('verification_request_read'),
  ctrl.listPeriods
);

// Создать периоды по списку ID контрактов
router.post(
  '/:requestId/periods',
  checkAccess('verification_request_update'),
  ctrl.createPeriods
);

module.exports = router;
