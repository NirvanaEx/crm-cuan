const db = require('../../config/db');

exports.list = async ({ status, page = 1, limit = 10, search, searchField, dateFrom, dateTo }) => {
  const where = [], params = [];

  // статус
  if (status === 'pending') {
    where.push('req.status = ?');
    params.push('pending');
  } else if (status === 'history') {
    where.push('req.status <> ?');
    params.push('pending');
  }

  // поиск по пользователю
  if (search && searchField === 'surname') {
    where.push('ui.surname LIKE ?');
    params.push(`%${search}%`);
  }

  // по дате
  if (dateFrom) { where.push('req.date_creation >= ?'); params.push(dateFrom); }
  if (dateTo)   { where.push('req.date_creation <= ?'); params.push(`${dateTo} 23:59:59`); }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM certificate_request req
  LEFT JOIN user_info ui ON req.user_id = ui.user_id
  LEFT JOIN certificate c ON req.certificate_id = c.id
       ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT req.id,
            ui.surname, ui.name, ui.patronym, ui.tab_num,
            c.name AS certificate_name,
            req.date_creation,
            req.status
       FROM certificate_request req
  LEFT JOIN user_info ui ON req.user_id = ui.user_id
  LEFT JOIN certificate c ON req.certificate_id = c.id
       ${whereSQL}
       ORDER BY req.date_creation DESC
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
    `SELECT id, user_id, certificate_id, status, date_creation
       FROM certificate_request WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.create = async ({ user_id, certificate_id }) => {
  const [res] = await db.execute(
    `INSERT INTO certificate_request
       (user_id, certificate_id, status, date_creation)
     VALUES (?, ?, 'pending', NOW())`,
    [user_id, certificate_id]
  );
  return { id: res.insertId, user_id, certificate_id };
};

exports.updateStatus = async (id, status) => {
  await db.execute(
    `UPDATE certificate_request SET status = ? WHERE id = ?`,
    [status, id]
  );
};

exports.fillDataAndApprove = async (request_id, dataArray) => {
  // dataArray = [{ certificate_field_id, value }, ...]
  for (const { certificate_field_id, value } of dataArray) {
    await db.execute(
      `INSERT INTO certificate_data
         (certificate_request_id, certificate_field_id, value, date_creation, data_status)
       VALUES (?, ?, ?, NOW(), 'active')`,
      [request_id, certificate_field_id, value]
    );
  }
  await exports.updateStatus(request_id, 'approved');
};
