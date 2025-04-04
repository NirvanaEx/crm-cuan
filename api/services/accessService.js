// services/accessService.js
const db = require('../config/db');

exports.getAccessList = async () => {
  const [rows] = await db.execute(
    `SELECT a.id, a.name, a.date_creation, at.language_id, at.description
     FROM access a
     LEFT JOIN access_translation at ON a.id = at.access_id
     WHERE a.data_status = 'active'
     ORDER BY a.name ASC`
  );
  const accessMap = {};
  rows.forEach(row => {
    if (!accessMap[row.id]) {
      accessMap[row.id] = {
        id: row.id,
        name: row.name,
        date_creation: row.date_creation,
        translations: []
      };
    }
    if (row.language_id) {
      accessMap[row.id].translations.push({
        language_id: row.language_id,
        description: row.description
      });
    }
  });
  // Преобразовать объект в массив и выполнить сортировку по name
  return Object.values(accessMap).sort((a, b) => a.name.localeCompare(b.name));
};


exports.getAccessById = async (id) => {
  const [rows] = await db.execute(
    `SELECT a.id, a.name, a.date_creation, at.language_id, at.description
     FROM access a
     LEFT JOIN access_translation at ON a.id = at.access_id
     WHERE a.id = ? AND a.data_status = 'active'`,
    [id]
  );
  if (!rows.length) return null;
  const access = {
    id: rows[0].id,
    name: rows[0].name,
    date_creation: rows[0].date_creation,
    translations: []
  };
  rows.forEach(row => {
    if (row.language_id) {
      access.translations.push({
        language_id: row.language_id,
        description: row.description
      });
    }
  });
  return access;
};

exports.createAccess = async (name, translations) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "INSERT INTO access (name, date_creation, data_status) VALUES (?, NOW(), 'active')",
      [name]
    );
    const accessId = result.insertId;
    for (const trans of translations) {
      await connection.execute(
        "INSERT INTO access_translation (access_id, language_id, description, date_creation) VALUES (?, ?, ?, NOW())",
        [accessId, trans.language_id, trans.description]
      );
    }
    await connection.commit();
    return { id: accessId, name, translations };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.updateAccess = async (id, name, translations) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "UPDATE access SET name = ? WHERE id = ? AND data_status = 'active'",
      [name, id]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }
    for (const trans of translations) {
      const [resultTrans] = await connection.execute(
        "UPDATE access_translation SET description = ? WHERE access_id = ? AND language_id = ?",
        [trans.description, id, trans.language_id]
      );
      if (resultTrans.affectedRows === 0) {
        await connection.execute(
          "INSERT INTO access_translation (access_id, language_id, description, date_creation) VALUES (?, ?, ?, NOW())",
          [id, trans.language_id, trans.description]
        );
      }
    }
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

exports.deleteAccess = async (id) => {
  const [result] = await db.execute(
    "UPDATE access SET data_status = 'deleted' WHERE id = ? AND data_status = 'active'",
    [id]
  );
  return result.affectedRows > 0;
};
