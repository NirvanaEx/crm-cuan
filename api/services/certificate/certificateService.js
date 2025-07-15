// services/certificate/certificateService.js
const db = require('../../config/db');

exports.listCertificates = async ({
  search, searchField, dateFrom, dateTo, page = 1, limit = 10
}) => {
  const where = [], params = [];
  if (search && searchField) {
    where.push(`${searchField} LIKE ?`);
    params.push(`%${search}%`);
  }
  if (dateFrom) {
    where.push('date_creation >= ?'); params.push(dateFrom);
  }
  if (dateTo) {
    where.push('date_creation <= ?'); params.push(`${dateTo} 23:59:59`);
  }
  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ cnt }]] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM certificate ${whereSQL}`, params
  );
  const total = cnt;

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT id, name, date_creation, date_status
       FROM certificate
       ${whereSQL}
       ORDER BY date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return {
    total,
    rows: rows.map((r, i) => ({ no: offset + i + 1, ...r }))
  };
};

exports.getCertificateById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, name, date_creation, date_status
       FROM certificate WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createCertificate = async ({ name }) => {
  const [result] = await db.execute(
    `INSERT INTO certificate (name, date_creation, date_status)
      VALUES (?, NOW(), 'active')`,
    [name]
  );
  return { id: result.insertId, name };
};

exports.updateCertificate = async (id, { name, date_status }) => {
  await db.execute(
    `UPDATE certificate
        SET name        = COALESCE(?, name),
            date_status = COALESCE(?, date_status)
      WHERE id = ?`,
    [name, date_status, id]
  );
  return true;
};

exports.deleteCertificate = async (id) => {
  await db.execute(`DELETE FROM certificate WHERE id = ?`, [id]);
  return true;
};
