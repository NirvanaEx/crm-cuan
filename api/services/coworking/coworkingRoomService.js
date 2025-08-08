const db = require('../../config/db');

exports.listRooms = async ({ search, searchField, dateFrom, dateTo, page = 1, limit = 10 }) => {
  const where = [];
  const params = [];

  if (search && searchField) {
    where.push(`\`${searchField}\` LIKE ?`);
    params.push(`%${search}%`);
  }
  if (dateFrom) { where.push('date_creation >= ?'); params.push(dateFrom); }
  if (dateTo)   { where.push('date_creation <= ?'); params.push(dateTo + ' 23:59:59'); }

  where.push("data_status != 'deleted'");

  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM coworking ${whereSQL}`, params
  );
  const total = countRows[0].cnt;

  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT id, room, data_status, date_creation
       FROM coworking
       ${whereSQL}
       ORDER BY date_creation DESC
       LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return { total, rows };
};

exports.getRoomById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, room, date_creation, data_status
       FROM coworking
      WHERE id = ?`, [id]
  );
  return rows[0];
};

exports.createRoom = async ({ room }) => {
  const [result] = await db.execute(
    `INSERT INTO coworking (room, date_creation, data_status)
     VALUES (?, NOW(), 'active')`, [room]
  );
  return { id: result.insertId, room };
};

exports.updateRoom = async (id, { room, data_status }) => {
  await db.execute(
    `UPDATE coworking
        SET room        = COALESCE(?, room),
            data_status = COALESCE(?, data_status)
      WHERE id = ?`,
    [room, data_status, id]
  );
  return true;
};

exports.deleteRoom = async (id) => {
  await db.execute(
    `UPDATE coworking SET data_status = 'deleted' WHERE id = ?`, [id]
  );
  return true;
};

// Доступные коворкинги на период (аналог hotel.available)
exports.listAvailableCoworkings = async ({ date_start, date_end }) => {
  const [rows] = await db.execute(
    `SELECT id, room, data_status, date_creation
       FROM coworking
      WHERE data_status = 'active'
        AND id NOT IN (
          SELECT coworking_id
            FROM coworking_book
           WHERE status IN ('pending','approved')
             AND NOT (
               date_end   < ?     -- полностью до начала
               OR date_start > ?  -- полностью после конца
             )
        )`,
    [date_start, date_end]
  );
  return rows;
};
