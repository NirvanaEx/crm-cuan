// api/routes/certificate/certificateRequestRoutes.js
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../../controllers/certificate/certificateRequestController');
const checkAccess= require('../../middlewares/checkAccess');

// список заявок
router.get('/',         checkAccess('certificateRequest_read'),   ctrl.list);
// детальная информация о заявке (без полей)
router.get('/:id',      checkAccess('certificateRequest_read'),   ctrl.getById);
// получить сохранённые данные полей для заявки
router.get('/:id/data', checkAccess('certificateRequest_read'),   ctrl.getData);

// создать новую заявку
router.post('/',        checkAccess('certificateRequest_create'), ctrl.create);
// сохранить или обновить значения полей (certificate_data)
router.post('/:id/data',checkAccess('certificateRequest_update'), ctrl.saveData);

// изменить статус заявки (approved / rejected / canceled)
router.put('/:id',      checkAccess('certificateRequest_update'), ctrl.update);
// удалить заявку целиком (если нужно)
router.delete('/:id',   checkAccess('certificateRequest_delete'), ctrl.delete);

module.exports = router;
