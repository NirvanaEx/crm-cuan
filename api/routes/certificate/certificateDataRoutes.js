const express = require('express');
const router  = express.Router();
const ctrl    = require('../../controllers/certificate/certificateDataController');
const checkAccess = require('../../middlewares/checkAccess');

router.get(
  '/',
  checkAccess('certificateData_read'),
  ctrl.listByRequest
);

router.delete(
  '/',
  checkAccess('certificateData_delete'),
  ctrl.deleteByRequest
);

router.post(
  '/',
  checkAccess('certificateData_create'),
  ctrl.createBulk
);

module.exports = router;
