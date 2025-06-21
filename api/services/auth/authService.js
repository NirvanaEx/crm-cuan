// authService.js
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sessionService = require('../admin/sessionService');

exports.getUserFromToken = async (token) => {
    // Проверяем наличие активного токена
    const [tokenRows] = await db.execute(
        'SELECT * FROM user_token WHERE token = ? AND token_status = "active" AND date_expired > NOW()',
        [token]
    );
    if (!tokenRows.length) {
        return null;
    }
    const tokenData = tokenRows[0];

    // Получаем данные пользователя (соединяем таблицы user и user_info)
    const [userRows] = await db.execute(
        `SELECT u.id, u.login, u.date_creation, ui.surname, ui.name, ui.patronym, ui.phone
         FROM \`user\` u
         LEFT JOIN user_info ui ON u.id = ui.user_id
         WHERE u.id = ?`,
        [tokenData.user_id]
    );
    if (!userRows.length) {
        return null;
    }
    const userData = userRows[0];

    // Проверка последнего статуса пользователя
    const [statusRows] = await db.execute(
        `SELECT status
         FROM user_status_history
         WHERE user_id = ?
         ORDER BY date_creation DESC
         LIMIT 1`,
        [tokenData.user_id]
    );
    if (statusRows.length && statusRows[0].status !== 'active') {
        return null;
    }

    // Получаем роли пользователя
    const [roleRows] = await db.execute(
        `SELECT r.id, r.name
         FROM users_role ur
         JOIN role r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [tokenData.user_id]
    );
    userData.roles = roleRows;

    // Получаем permissions (access.name) по ролям
    const roleIds = roleRows.map(r => r.id);
    let permissions = [];
    if (roleIds.length) {
        const placeholders = roleIds.map(() => '?').join(',');
        const [accessRows] = await db.execute(
            `SELECT DISTINCT a.name
             FROM role_access ra
             JOIN access a ON ra.access_id = a.id
             WHERE ra.role_id IN (${placeholders})`,
            roleIds
        );
        permissions = accessRows.map(a => a.name);
    }
    userData.permissions = permissions;

    // Получаем настройки пользователя (например, выбранный язык)
    const [settingRows] = await db.execute(
        "SELECT selected_language_id FROM user_setting WHERE user_id = ?",
        [tokenData.user_id]
    );
    userData.selected_language_id = settingRows.length ? settingRows[0].selected_language_id : null;

    return userData;
};


exports.login = async (login, password, device, ipAddress) => {
    const [rows] = await db.execute(
        'SELECT * FROM `user` WHERE login = ?',
        [login]
    );
    if (!rows.length) {
        return null;
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return null;
    }
    const token = crypto.randomBytes(32).toString('hex');
    const dateExpired = new Date(Date.now() + 3600 * 1000);
    const [result] = await db.execute(
        'INSERT INTO user_token (user_id, token, date_expired, token_status) VALUES (?, ?, ?, ?)',
        [user.id, token, dateExpired, 'active']
    );
    // Если device или ipAddress отсутствуют, передаём null вместо undefined
    const safeDevice = device !== undefined ? device : null;
    const safeIpAddress = ipAddress !== undefined ? ipAddress : null;
    await sessionService.createSession(result.insertId, safeDevice, safeIpAddress);
    return token;
};


exports.logout = async (token) => {
    const [result] = await db.execute(
        'UPDATE user_token SET token_status = ? WHERE token = ?',
        ['revoked', token]
    );
    return result.affectedRows > 0;
};
