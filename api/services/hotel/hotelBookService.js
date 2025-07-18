// services/hotel/hotelBookService.js
const db = require('../../config/db');

async function listBookings(
  { search, searchField, dateFrom, dateTo, status, page = 1, limit = 10, userId },
  extraWhere = ''
) {
  const where = [];
  const params = [];

  if (userId !== undefined) {
    where.push('b.user_id = ?');
    params.push(userId);
  }

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
    if (searchField === 'room_num') {
      where.push('r.num LIKE ?');
    } else {
      where.push(`b.\`${searchField}\` LIKE ?`);
    }
    params.push(`%${search}%`);
  }

  if (dateFrom) {
    where.push('b.date_creation >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('b.date_creation <= ?');
    params.push(dateTo + ' 23:59:59');
  }

  if (extraWhere) {
    where.push(extraWhere);
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [[{ cnt: total }]] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM hotel_book b
  LEFT JOIN hotel_room r ON r.id = b.room_id
     ${whereSQL}`,
    params
  );

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT
       b.id,
       b.room_id,
       r.num         AS room_num,
       b.phone,
       b.purpose,
       b.date_start,
       b.date_end,
       b.status,
       b.door_code,
       b.date_creation
     FROM hotel_book b
LEFT JOIN hotel_room r ON r.id = b.room_id
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

exports.listPendingAll = opts  => listBookings({ ...opts, status: 'pending' });
exports.listActiveAll  = opts  => listBookings({ ...opts, status: 'active' });
exports.listHistoryAll = opts  => listBookings({ ...opts, status: 'history' });

exports.listPendingOwn = opts  => listBookings({ ...opts, status: 'pending', userId: opts.userId });
exports.listActiveOwn  = opts  => listBookings({ ...opts, status: 'active',  userId: opts.userId });
exports.listHistoryOwn = opts  => listBookings({ ...opts, status: 'history', userId: opts.userId });

exports.getBookingById = async id => {
  const [rows] = await db.execute(
    `SELECT
       id, room_id, user_id, phone, purpose,
       date_start, date_end, status, door_code, date_creation
     FROM hotel_book
     WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createBooking = async ({ room_id, user_id, phone, purpose, date_start, date_end }) => {
  const [result] = await db.execute(
    `INSERT INTO hotel_book
       (room_id, user_id, phone, purpose,
        date_start, date_end, status, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [room_id, user_id, phone, purpose, date_start, date_end]
  );
  return { id: result.insertId };
};

exports.updateStatusAll = async (id, status, door_code) => {
  const valid = ['pending','approved','canceled','rejected'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  const [res] = await db.execute(
    `UPDATE hotel_book
        SET status = ?, door_code = COALESCE(?, door_code)
      WHERE id = ?`,
    [status, door_code, id]
  );
  return res.affectedRows > 0;
};

exports.updateStatusOwn = async (id, userId, status) => {
  if (status !== 'canceled') {
    throw new Error('Forbidden: you can only cancel your own booking');
  }
  const [res] = await db.execute(
    `UPDATE hotel_book
        SET status = ?
      WHERE id = ? AND user_id = ?`,
    [status, id, userId]
  );
  return res.affectedRows > 0;
};
