// api/services/certificate/certificateService.js
const db = require('../../config/db');

exports.listCertificates = async ({ search, searchField, dateFrom, dateTo, page = 1, limit = 10 }) => {
  const where = [];
  const params = [];

  if (search && searchField) {
    where.push(`\`${searchField}\` LIKE ?`);
    params.push(`%${search}%`);
  }
  if (dateFrom) {
    where.push('date_creation >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('date_creation <= ?');
    params.push(`${dateTo} 23:59:59`);
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  // total count
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM certificate ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  // paginated rows
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT id, name, date_creation, data_status
       FROM certificate
       ${whereSQL}
       ORDER BY date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return {
    total,
    rows: rows.map((r, i) => ({
      no: offset + i + 1,
      ...r
    }))
  };
};

exports.getCertificateById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, name, date_creation, data_status 
       FROM certificate 
      WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

exports.createCertificate = async ({ name }) => {
  const [result] = await db.execute(
    `INSERT INTO certificate (name, date_creation, data_status)
     VALUES (?, NOW(), 'active')`,
    [name]
  );
  return { id: result.insertId, name };
};

exports.updateCertificate = async (id, { name, data_status }) => {
  await db.execute(
    `UPDATE certificate
        SET name        = COALESCE(?, name),
            data_status = COALESCE(?, data_status)
      WHERE id = ?`,
    [name, data_status, id]
  );
};

exports.deleteCertificate = async (id) => {
  await db.execute(
    `DELETE FROM certificate WHERE id = ?`,
    [id]
  );
};
