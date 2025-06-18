// routes/car/carBookRoutes.js
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../../controllers/car/carBookController');
const checkAccess = require('../../middlewares/checkAccess');

// 1) Pending bookings
router.get(
  '/pending',
  checkAccess('carBook_read'),
  ctrl.getPending
);

// 2) Active bookings
router.get(
  '/active',
  checkAccess('carBook_read'),
  ctrl.getActive
);

// 3) History (canceled/rejected)
router.get(
  '/history',
  checkAccess('carBook_read'),
  ctrl.getHistory
);

// 4) Create new booking
router.post(
  '/',
  checkAccess('carBook_create'),
  ctrl.create
);

// 5) Update status
router.put(
  '/:id/status',
  checkAccess('carBook_update'),
  ctrl.changeStatus
);

module.exports = router;
