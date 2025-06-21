const express = require('express');
const router = express.Router();
const registrationAdminController = require('../../controllers/admin/registrationAdminController');
const authMiddleware = require('../../middlewares/authMiddleware');
const checkAccess = require('../../middlewares/checkAccess');

router.use(authMiddleware);
router.use(checkAccess('registration_manage'));

/**
 *  GET    /api/admin/registration      — список заявок
 *  GET    /api/admin/registration/:id  — детальная заявка
 *  PATCH  /api/admin/registration/:id  — изменение статуса (approve/reject)
 */
router.get('/', registrationAdminController.listRequests);
router.get('/:id', registrationAdminController.getRequestById);
router.patch('/:id', registrationAdminController.updateRequestStatus);

module.exports = router;
