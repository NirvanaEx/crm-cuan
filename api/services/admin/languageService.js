const db = require('../../config/db');

exports.getAllLanguages = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM language WHERE data_status = 'active'"
  );
  return rows;
};

exports.getLanguageById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM language WHERE id = ? AND data_status = 'active'",
    [id]
  );
  return rows[0];
};

exports.createLanguage = async (data) => {
  const { code, name } = data;
  const [result] = await db.execute(
    "INSERT INTO language (code, name, date_creation, data_status) VALUES (?, ?, NOW(), 'active')",
    [code, name]
  );
  return { id: result.insertId, code, name };
};

exports.updateLanguage = async (id, data) => {
  const { code, name } = data;
  const [result] = await db.execute(
    "UPDATE language SET code = ?, name = ? WHERE id = ? AND data_status = 'active'",
    [code, name, id]
  );
  return result.affectedRows > 0;
};

exports.deleteLanguage = async (id) => {
  // Мягкое удаление: обновление data_status на 'deleted'
  const [result] = await db.execute(
    "UPDATE language SET data_status = 'deleted' WHERE id = ? AND data_status = 'active'",
    [id]
  );
  return result.affectedRows > 0;
};
