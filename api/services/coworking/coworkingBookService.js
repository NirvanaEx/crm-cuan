const db = require('../../config/db');

async function listBookings(
  { search, searchField, dateFrom, dateTo, status, page = 1, limit = 10, userId },
  extraWhere = ''
) {
  const where = [];
  const params = [];

  if (userId !== undefined) { where.push('b.user_id = ?'); params.push(userId); }

  if (status === 'active') {
    where.push(`b.status = 'approved' AND b.date_end >= NOW()`);
  } else if (status === 'pending') {
    where.push(`b.status = 'pending' AND b.date_start > NOW()`);
  } else if (status === 'history') {
    where.push(`(
      b.status IN ('canceled','rejected')
      OR b.date_end < NOW()
      OR (b.status = 'pending'  AND b.date_start <= NOW())
      OR (b.status = 'approved' AND b.date_end   < NOW())
    )`);
  }

  if (search && searchField) {
    if (searchField === 'room') {
      where.push('r.room LIKE ?');
    } else {
      where.push(`b.\`${searchField}\` LIKE ?`);
    }
    params.push(`%${search}%`);
  }

  if (dateFrom) { where.push('b.date_creation >= ?'); params.push(dateFrom); }
  if (dateTo)   { where.push('b.date_creation <= ?'); params.push(dateTo + ' 23:59:59'); }
  if (extraWhere) where.push(extraWhere);

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ cnt: total }]] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM coworking_book b
  LEFT JOIN coworking r ON r.id = b.coworking_id
     ${whereSQL}`,
    params
  );

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT
       b.id,
       b.coworking_id,
       r.room       AS room,
       b.user_id,
       b.purpose,
       b.date_start,
       b.date_end,
       b.status,
       b.date_creation
     FROM coworking_book b
LEFT JOIN coworking r ON r.id = b.coworking_id
     ${whereSQL}
     ORDER BY b.date_creation DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    total,
    rows: rows.map((r, i) => ({ no: offset + i + 1, ...r }))
  };
}

exports.listPendingAll = (opts) => listBookings({ ...opts, status: 'pending' });
exports.listActiveAll  = (opts) => listBookings({ ...opts, status: 'active' });
exports.listHistoryAll = (opts) => listBookings({ ...opts, status: 'history' });

exports.listPendingOwn = (opts) => listBookings({ ...opts, status: 'pending', userId: opts.userId });
exports.listActiveOwn  = (opts) => listBookings({ ...opts, status: 'active',  userId: opts.userId });
exports.listHistoryOwn = (opts) => listBookings({ ...opts, status: 'history', userId: opts.userId });

exports.getBookingById = async (id) => {
  const [rows] = await db.execute(
    `SELECT
       id, coworking_id, user_id, purpose,
       date_start, date_end, status, date_creation
     FROM coworking_book
     WHERE id = ?`, [id]
  );
  return rows[0];
};

exports.createBooking = async ({ coworking_id, user_id, purpose, date_start, date_end }) => {
  const [result] = await db.execute(
    `INSERT INTO coworking_book
       (coworking_id, user_id, purpose,
        date_start, date_end, status, date_creation)
     VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
    [coworking_id, user_id, purpose, date_start, date_end]
  );
  return { id: result.insertId };
};

exports.updateStatusAll = async (id, status) => {
  const valid = ['pending','approved','canceled','rejected'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  const [res] = await db.execute(
    `UPDATE coworking_book SET status = ? WHERE id = ?`, [status, id]
  );
  return res.affectedRows > 0;
};

exports.updateStatusOwn = async (id, userId, status) => {
  if (status !== 'canceled') throw new Error('Forbidden: you can only cancel your own booking');
  const [res] = await db.execute(
    `UPDATE coworking_book SET status = ? WHERE id = ? AND user_id = ?`,
    [status, id, userId]
  );
  return res.affectedRows > 0;
};
