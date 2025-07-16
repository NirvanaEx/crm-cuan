const db = require('../../config/db');

exports.listByRequest = async ({ request_id }) => {
  const [rows] = await db.execute(
    `SELECT certificate_field_id, value
       FROM certificate_data
      WHERE certificate_request_id = ?
        AND data_status = 'active'`,
    [request_id]
  );
  return rows;
};

exports.deleteByRequest = async (request_id) => {
  await db.execute(
    `DELETE FROM certificate_data
      WHERE certificate_request_id = ?`,
    [request_id]
  );
  return true;
};

exports.createBulk = async (entries) => {
  if (!entries.length) return [];
  // entries: [{ certificate_request_id, certificate_field_id, value }, …]
  const placeholders = entries.map(() => '(?, ?, ?, NOW(), ?)').join(',');
  const params = [];
  entries.forEach(e => {
    params.push(
      e.certificate_request_id,
      e.certificate_field_id,
      e.value,
      'active'
    );
  });
  const [result] = await db.execute(
    `INSERT INTO certificate_data
       (certificate_request_id, certificate_field_id, value, date_creation, data_status)
     VALUES ${placeholders}`,
    params
  );
  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows
  };
};
