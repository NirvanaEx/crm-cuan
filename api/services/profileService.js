const db = require('../config/db');
const bcrypt = require('bcrypt');

// Функция получения данных профиля пользователя по его ID
exports.getProfile = async (userId) => {
  const [rows] = await db.execute(
    `SELECT u.id, u.login, u.avatar_url, u.date_creation, ui.surname, ui.name, ui.patronym, ui.phone
     FROM \`user\` u
     LEFT JOIN user_info ui ON u.id = ui.user_id
     WHERE u.id = ?`,
    [userId]
  );
  return rows.length ? rows[0] : null;
};

// Функция обновления данных профиля пользователя
exports.updateProfile = async (userId, data) => {
  const { surname, name, patronym, phone } = data;
  const [result] = await db.execute(
    'UPDATE user_info SET surname = ?, name = ?, patronym = ?, phone = ? WHERE user_id = ?',
    [surname, name, patronym, phone, userId]
  );
  return result.affectedRows > 0;
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
    // Получаем текущий хэш пароля пользователя
    const [rows] = await db.execute(
      'SELECT password FROM `user` WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      throw new Error('Пользователь не найден');
    }
    const currentHashedPassword = rows[0].password;
    
    // Сравниваем старый пароль с хэшированным
    const isValid = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isValid) {
      throw new Error('Неверный старый пароль');
    }
    
    // Хэшируем новый пароль
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновляем пароль в базе данных
    const [result] = await db.execute(
      'UPDATE `user` SET password = ? WHERE id = ?',
      [newHashedPassword, userId]
    );
    return result.affectedRows > 0;
  };
