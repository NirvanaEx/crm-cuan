const db = require('../config/db');

exports.getUserSettings = async (userId) => {
  const [rows] = await db.execute(
    "SELECT * FROM user_setting WHERE user_id = ?",
    [userId]
  );
  return rows.length ? rows[0] : null;
};

exports.updateUserSettings = async (userId, data) => {
  const { selected_language_id } = data;
  const [result] = await db.execute(
    "UPDATE user_setting SET selected_language_id = ? WHERE user_id = ?",
    [selected_language_id, userId]
  );
  return result.affectedRows > 0;
};
