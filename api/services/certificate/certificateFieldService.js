const db = require('../../config/db');

exports.listFields = async ({ search, searchField, dateFrom, dateTo, page = 1, limit = 10 }) => {
  const where = [];
  const params = [];

  if (search && searchField) {
    // поиск по имени сертификата или по полю
    if (searchField === 'certificate_name') {
      where.push('cert.name LIKE ?');
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

  // total
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM certificate_field cf
  LEFT JOIN certificate cert ON cf.certificate_id = cert.id
       ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  // data
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT cf.id,
            cf.certificate_id,
            cert.name      AS certificate_name,
            cf.field_name,
            cf.value,
            cf.date_creation
       FROM certificate_field cf
  LEFT JOIN certificate cert ON cf.certificate_id = cert.id
       ${whereSQL}
       ORDER BY cf.date_creation DESC
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

exports.getFieldById = async (id) => {
  const [rows] = await db.execute(
    `SELECT cf.id,
            cf.certificate_id,
            cf.field_name,
            cf.value,
            cf.date_creation
       FROM certificate_field cf
      WHERE cf.id = ?`,
    [id]
  );
  return rows[0];
};

exports.createField = async ({ certificate_id, field_name, value }) => {
  const [result] = await db.execute(
    `INSERT INTO certificate_field
      (certificate_id, field_name, value, date_creation, date_status)
     VALUES (?, ?, ?, NOW(), 'active')`,
    [certificate_id, field_name, value]
  );
  return {
    id: result.insertId,
    certificate_id,
    field_name,
    value
  };
};

exports.updateField = async (id, { certificate_id = null, field_name = null, value = null }) => {
  await db.execute(
    `UPDATE certificate_field
       SET certificate_id = COALESCE(?, certificate_id),
           field_name     = COALESCE(?, field_name),
           value          = COALESCE(?, value)
     WHERE id = ?`,
    [certificate_id, field_name, value, id]
  );
  return true;
};

exports.deleteField = async (id) => {
  await db.execute(
    `DELETE FROM certificate_field WHERE id = ?`,
    [id]
  );
  return true;
};
