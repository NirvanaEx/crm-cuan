const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const checkAccess = require('../middlewares/checkAccess');

// Маршруты для работы с пользователями с проверкой доступа

// Создание пользователя с ролью: базовое разрешение 'create_user' и тонкая настройка 'canCreateUser'
router.post('/with-role', checkAccess('create_user', 'canCreateUser'), userController.createUserWithRole);

// Получение списка пользователей: базовое разрешение 'read_user'
router.get('/', checkAccess('read_user'), userController.getUsers);

// Получение пользователя по id: базовое разрешение 'read_user'
router.get('/:id', checkAccess('read_user'), userController.getUserById);

// Обновление пользователя: базовое разрешение 'update_user' и тонкая настройка 'canUpdateUser'
router.put('/:id', checkAccess('update_user', 'canUpdateUser'), userController.updateUser);

// Обновление статуса пользователя: базовое разрешение 'read_user_status' и тонкая настройка 'canUpdateStatus'
router.put('/:id/status', checkAccess('read_user_status', 'canUpdateStatus'), userController.updateUserStatus);

// Удаление пользователя: базовое разрешение 'delete_user' и тонкая настройка 'canDeleteUser'
router.delete('/:id', checkAccess('delete_user', 'canDeleteUser'), userController.deleteUser);

module.exports = router;
