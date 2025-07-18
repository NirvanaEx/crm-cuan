// services/car/carBookService.js
const db = require('../../config/db');

/**
 * Базовый list-функционал: если передан userId — фильтруем по нему.
 */
async function listByStatuses(
  statuses,
  { page = 1, limit = 10, search, searchField, dateFrom, dateTo, userId },
  extraWhere = ''
) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  if (typeof userId !== 'undefined') {
    where.push(`cb.user_id = ?`);
    params.push(userId);
  }
  if (statuses.length) {
    const placeholders = statuses.map(() => '?').join(',');
    where.push(`cb.status IN (${placeholders})`);
    params.push(...statuses);
  }
  if (dateFrom) {
    where.push(`cb.date_creation >= ?`);
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push(`cb.date_creation <= ?`);
    params.push(dateTo);
  }
  if (search && searchField) {
    const term = `%${search.toLowerCase()}%`;
    if (['phone_number','purpose','route'].includes(searchField)) {
      where.push(`LOWER(cb.${searchField}) LIKE ?`);
      params.push(term);
    } else if (searchField === 'car') {
      where.push(`LOWER(CONCAT(c.model,' ',c.number)) LIKE ?`);
      params.push(term);
    } else if (searchField === 'user') {
      where.push(`LOWER(CONCAT(ui.surname,' ',ui.name,' ',ui.patronym)) LIKE ?`);
      params.push(term);
    }
  }
  if (extraWhere) where.push(extraWhere);

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total
       FROM car_book cb
       JOIN car c           ON c.id           = cb.car_id
       JOIN car_category cat ON cat.id        = c.car_category_id
       JOIN user_info ui    ON ui.user_id     = cb.user_id
     ${whereSQL}`,
    params
  );

  const [rows] = await db.execute(
    `SELECT
       cb.id, cb.car_id, cb.user_id, cb.phone_number,
       cb.purpose, cb.route,
       cb.date_start, cb.date_expired, cb.status, cb.date_creation,
       c.model, c.number, cat.name AS category_name,
       ui.surname, ui.name, ui.patronym
     FROM car_book cb
     JOIN car c           ON c.id           = cb.car_id
     JOIN car_category cat ON cat.id        = c.car_category_id
     JOIN user_info ui    ON ui.user_id     = cb.user_id
     ${whereSQL}
     ORDER BY cb.date_creation DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

exports.listPending = opts => listByStatuses(['pending'], opts);
exports.listActive  = opts => listByStatuses(['approved'], opts, `cb.date_expired >= NOW()`);
exports.listHistory = opts => listByStatuses([], opts,
  `(cb.status IN ('canceled','rejected') OR cb.date_expired < NOW())`
);

exports.createBooking = async ({ car_id, user_id, phone_number, purpose, route, date_start, date_expired }) => {
  const [result] = await db.execute(
    `INSERT INTO car_book
       (car_id, user_id, phone_number, purpose, route,
        date_start, date_expired, status, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [car_id, user_id, phone_number, purpose, route, date_start, date_expired]
  );
  return { id: result.insertId };
};

exports.updateStatusAll = async (id, status) => {
  const valid = ['pending','approved','canceled','rejected'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  const [res] = await db.execute(
    `UPDATE car_book SET status = ? WHERE id = ?`,
    [status, id]
  );
  return res.affectedRows > 0;
};

exports.updateStatusOwn = async (id, userId, status) => {
  if (status !== 'canceled') {
    throw new Error('Forbidden: you can only cancel your own booking');
  }
  const [res] = await db.execute(
    `UPDATE car_book SET status = ? WHERE id = ? AND user_id = ?`,
    [status, id, userId]
  );
  return res.affectedRows > 0;
};
