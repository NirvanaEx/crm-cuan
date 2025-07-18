// routes/car/carBookRoutes.js
const express     = require('express');
const router      = express.Router();
const ctrl        = require('../../controllers/car/carBookController');
const checkAccess = require('../../middlewares/checkAccess');

// ==== Admin (ALL) ====
router.get(   '/pending', checkAccess('carBook_read_all'),    ctrl.getPendingAll);
router.get(   '/active',  checkAccess('carBook_read_all'),    ctrl.getActiveAll);
router.get(   '/history', checkAccess('carBook_read_all'),    ctrl.getHistoryAll);
router.put(   '/:id/status', checkAccess('carBook_update_all'), ctrl.changeStatusAll);

// ==== User (OWN) ====
router.get(   '/my/pending', checkAccess('carBook_read_own'),  ctrl.getPendingOwn);
router.get(   '/my/active',  checkAccess('carBook_read_own'),  ctrl.getActiveOwn);
router.get(   '/my/history', checkAccess('carBook_read_own'),  ctrl.getHistoryOwn);
router.put(   '/my/:id/status', checkAccess('carBook_update_own'), ctrl.changeStatusOwn);

// ==== Create (shared) ====
router.post(  '/',            checkAccess('carBook_create'),   ctrl.create);

module.exports = router;
