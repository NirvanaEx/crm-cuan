const db = require('../../config/db');

exports.listRooms = async ({ search, searchField, dateFrom, dateTo, page = 1, limit = 10 }) => {
  const where = [];
  const params = [];

  // Поисковый фильтр
  if (search && searchField) {
    where.push(`\`${searchField}\` LIKE ?`);
    params.push(`%${search}%`);
  }

  // Диапазон дат
  if (dateFrom) {
    where.push('date_creation >= ?');
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push('date_creation <= ?');
    params.push(dateTo + ' 23:59:59');
  }

  // Только не удалённые
  where.push("data_status != 'deleted'");

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  // Сколько всего
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM hotel_room ${whereSQL}`,
    params
  );
  const total = countRows[0].cnt;

  // Постранично
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT id, num, data_status, date_creation
       FROM hotel_room
       ${whereSQL}
       ORDER BY date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  return { total, rows };
};


exports.getRoomById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, num, date_creation, data_status
       FROM hotel_room
      WHERE id = ?`,
    [id]
  );
  return rows[0];
};

exports.createRoom = async ({ num }) => {
  const [result] = await db.execute(
    `INSERT INTO hotel_room
       (num, date_creation, data_status)
     VALUES (?, NOW(), 'active')`,
    [num]
  );
  return { id: result.insertId, num };
};

exports.updateRoom = async (id, { num, data_status }) => {
  await db.execute(
    `UPDATE hotel_room
       SET num         = COALESCE(?, num),
           data_status = COALESCE(?, data_status)
     WHERE id = ?`,
    [num, data_status, id]
  );
  return true;
};

exports.deleteRoom = async (id) => {
  await db.execute(
    `UPDATE hotel_room
       SET data_status = 'deleted'
     WHERE id = ?`,
    [id]
  );
  return true;
};
