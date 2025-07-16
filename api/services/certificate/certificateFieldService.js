const db = require('../../config/db');

exports.list = async ({ search, searchField, dateFrom, dateTo, page = 1, limit = 10 }) => {
  const where = [];
  const params = [];

  if (search && searchField) {
    if (searchField === 'certificate_name') {
      where.push('c.name LIKE ?');
    } else {
      where.push(`cf.\`${searchField}\` LIKE ?`);
    }
    params.push(`%${search}%`);
  }
  if (dateFrom) {
    where.push('cf.date_creation >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('cf.date_creation <= ?');
    params.push(`${dateTo} 23:59:59`);
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt 
       FROM certificate_field cf 
  LEFT JOIN certificate c ON cf.certificate_id = c.id
       ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT cf.id,
            cf.field_name,
            cf.field_type,
            cf.date_creation,
            cf.data_status,
            c.name AS certificate_name
       FROM certificate_field cf
  LEFT JOIN certificate c ON cf.certificate_id = c.id
       ${whereSQL}
       ORDER BY cf.date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return {
    total,
    rows: rows.map((r, i) => ({ no: offset + i + 1, ...r }))
  };
};

exports.getById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, certificate_id, field_name, field_type, date_creation, data_status
       FROM certificate_field
      WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.create = async ({ certificate_id, field_name, field_type }) => {
  const [res] = await db.execute(
    `INSERT INTO certificate_field
       (certificate_id, field_name, field_type, date_creation, data_status)
     VALUES (?, ?, ?, NOW(), 'active')`,
    [certificate_id, field_name, field_type]
  );
  return { id: res.insertId, certificate_id, field_name, field_type };
};

exports.update = async (id, { certificate_id, field_name, field_type, data_status }) => {
  await db.execute(
    `UPDATE certificate_field
        SET certificate_id = COALESCE(?, certificate_id),
            field_name     = COALESCE(?, field_name),
            field_type     = COALESCE(?, field_type),
            data_status    = COALESCE(?, data_status)
      WHERE id = ?`,
    [certificate_id, field_name, field_type, data_status, id]
  );
};

exports.delete = async (id) => {
  await db.execute(
    `DELETE FROM certificate_field WHERE id = ?`,
    [id]
  );
};
