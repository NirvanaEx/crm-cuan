const express     = require('express');
const router      = express.Router();
const ctrl        = require('../../controllers/coworking/coworkingBookController');
const checkAccess = require('../../middlewares/checkAccess');

// Admin (all)
router.get(   '/pending',        checkAccess('coworkingBook_read_all'),   ctrl.getPendingAll);
router.get(   '/active',         checkAccess('coworkingBook_read_all'),   ctrl.getActiveAll);
router.get(   '/history',        checkAccess('coworkingBook_read_all'),   ctrl.getHistoryAll);
router.put(   '/:id/status',     checkAccess('coworkingBook_update_all'), ctrl.changeStatusAll);

// User (own)
router.get(   '/my/pending',     checkAccess('coworkingBook_read_own'),   ctrl.getPendingOwn);
router.get(   '/my/active',      checkAccess('coworkingBook_read_own'),   ctrl.getActiveOwn);
router.get(   '/my/history',     checkAccess('coworkingBook_read_own'),   ctrl.getHistoryOwn);
router.put(   '/my/:id/status',  checkAccess('coworkingBook_update_own'), ctrl.changeStatusOwn);

// Shared create
router.post(  '/',               checkAccess('coworkingBook_create'),     ctrl.create);

module.exports = router;
