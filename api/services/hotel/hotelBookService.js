// services/hotel/hotelBookService.js
const db = require('../../config/db');

exports.listBookings = async ({
  search, searchField, dateFrom, dateTo,
  status,    // теперь: "pending", "active" или "history"
  page = 1, limit = 10
}) => {
  const where = [], params = [];

  // 1) Фильтр по табу:
  if (status === 'active') {
    where.push(`b.status = 'approved' AND b.date_end >= NOW()`);
  } else if (status === 'pending') {
    where.push(`b.status = 'pending' AND b.date_start > NOW()`);
  } else if (status === 'history') {
    // все, что не active/pending: либо статус отменён/отвергнут,
    // либо дата окончания < NOW(),
    // либо pending с датой начала < NOW(),
    // либо approved с датой окончания < NOW()
    where.push(`(
      b.status IN ('canceled','rejected')
      OR b.date_end < NOW()
      OR (b.status = 'pending'  AND b.date_start <= NOW())
      OR (b.status = 'approved' AND b.date_end   < NOW())
    )`);
  }

  // 2) Поиск по полям
  if (search && searchField) {
    if (searchField === 'room_num') {
      where.push('r.num LIKE ?');
    } else {
      where.push(`b.\`${searchField}\` LIKE ?`);
    }
    params.push(`%${search}%`);
  }

  // 3) Фильтр по диапазону даты создания (опционально)
  if (dateFrom) {
    where.push('b.date_creation >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('b.date_creation <= ?');
    params.push(dateTo + ' 23:59:59');
  }

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  // считаем total
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt
       FROM hotel_book b
  LEFT JOIN hotel_room r ON b.room_id = r.id
       ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  // выбираем данные с пагинацией
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT b.id,
            b.room_id,
            r.num      AS room_num,
            b.phone,
            b.purpose,
            b.date_start,
            b.date_end,
            b.status,
            b.date_creation
       FROM hotel_book b
  LEFT JOIN hotel_room r ON b.room_id = r.id
       ${whereSQL}
       ORDER BY b.date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const withNo = rows.map((r, i) => ({
    no: offset + i + 1,
    ...r
  }));
  return { total, rows: withNo };
};

exports.getBookingById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, room_id, user_id, phone, purpose, date_start, date_end, status, date_creation
       FROM hotel_book
      WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createBooking = async ({ room_id, user_id, phone, purpose, date_start, date_end }) => {
  const [result] = await db.execute(
    `INSERT INTO hotel_book
       (room_id, user_id, phone, purpose, date_start, date_end, status, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [room_id, user_id, phone, purpose, date_start, date_end]
  );
  return {
    id: result.insertId,
    room_id, user_id, phone, purpose, date_start, date_end
  };
};

exports.updateBooking = async (id, { phone, purpose, date_start, date_end, status }) => {
  await db.execute(
    `UPDATE hotel_book
       SET phone      = COALESCE(?, phone),
           purpose    = COALESCE(?, purpose),
           date_start = COALESCE(?, date_start),
           date_end   = COALESCE(?, date_end),
           status     = COALESCE(?, status)
     WHERE id = ?`,
    [phone, purpose, date_start, date_end, status, id]
  );
  return true;
};

exports.deleteBooking = async (id) => {
  await db.execute(
    `DELETE FROM hotel_book
      WHERE id = ?`,
    [id]
  );
  return true;
};

exports.updateBookingStatus = async (id, status) => {
  await db.execute(
    'UPDATE hotel_book SET status = ? WHERE id = ?',
    [status, id]
  );
};