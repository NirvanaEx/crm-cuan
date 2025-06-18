// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const checkAccess = require('../../middlewares/checkAccess');

// Создание пользователя с ролью: базовое разрешение 'create_user' и тонкая настройка 'canCreateUser'
router.post('/with-role', checkAccess('create_user'), userController.createUserWithRole);

// Получение списка пользователей: базовое разрешение 'read_user'
router.get('/', checkAccess('user_read'), userController.getUsers);

// Получение пользователя по id: базовое разрешение 'read_user'
router.get('/:id', checkAccess('user_read'), userController.getUserById);

// Обновление пользователя: базовое разрешение 'update_user' и тонкая настройка 'canUpdateUser'
router.put('/:id', checkAccess('user_update'), userController.updateUser);

// Обновление статуса пользователя: базовое разрешение 'read_user_status' и тонкая настройка 'canUpdateStatus'
router.put('/:id/status', checkAccess('userStatus_read'), userController.updateUserStatus);

// Удаление пользователя: базовое разрешение 'delete_user' и тонкая настройка 'canDeleteUser'
router.delete('/:id', checkAccess('user_delete'), userController.deleteUser);

module.exports = router;
