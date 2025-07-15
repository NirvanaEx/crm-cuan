// services/certificate/certificateRequestService.js
const db = require('../../config/db');

exports.listRequests = async ({
  status, search, searchField, dateFrom, dateTo,
  page = 1, limit = 10
}) => {
  const where = [], params = [];

  // статус
  if (status === 'pending') {
    where.push('req.status = ?'); params.push('pending');
  } else if (status === 'history') {
    where.push('req.status <> ?'); params.push('pending');
  }

  // поиск по ФИО
  if (search && searchField) {
    if (['surname','name','patronym','tab_num'].includes(searchField)) {
      where.push(`ui.${searchField} LIKE ?`);
      params.push(`%${search}%`);
    }
  }
  // диапазон дат
  if (dateFrom) {
    where.push('req.date_creation >= ?'); params.push(dateFrom);
  }
  if (dateTo) {
    where.push('req.date_creation <= ?'); params.push(`${dateTo} 23:59:59`);
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ cnt }]] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM certificate_request req
  LEFT JOIN user_info ui ON req.user_id = ui.user_id
  LEFT JOIN certificate cert ON req.certificate_id = cert.id
       ${whereSQL}`,
    params
  );
  const total = cnt;

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT req.id,
            ui.surname,
            ui.name,
            ui.patronym,
            ui.tab_num,
            cert.name    AS certificate_name,
            req.date_creation,
            req.status
       FROM certificate_request req
  LEFT JOIN user_info ui ON req.user_id = ui.user_id
  LEFT JOIN certificate cert ON req.certificate_id = cert.id
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

exports.getRequestById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, user_id, certificate_id, status, date_creation
       FROM certificate_request WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createRequest = async ({ user_id, certificate_id }) => {
  const [result] = await db.execute(
    `INSERT INTO certificate_request
      (user_id, certificate_id, status, date_creation)
     VALUES (?, ?, 'pending', NOW())`,
    [user_id, certificate_id]
  );
  return { id: result.insertId, user_id, certificate_id };
};

exports.updateRequestStatus = async (id, status) => {
  await db.execute(
    `UPDATE certificate_request SET status = ? WHERE id = ?`,
    [status, id]
  );
  return true;
};

exports.deleteRequest = async (id) => {
  await db.execute(`DELETE FROM certificate_request WHERE id = ?`, [id]);
  return true;
};
