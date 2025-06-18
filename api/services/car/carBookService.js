// services/car/carBookService.js
const db = require('../../config/db');

async function listByStatuses(
  statuses,
  { page = 1, limit = 10, search, searchField, dateFrom, dateTo },
  extraWhere = ''
) {
  const offset = (page - 1) * limit;
  const where = [];
  const params = [];

  // 1) базовый фильтр по статусам, если переданы
  if (statuses.length) {
    const inList = statuses.map(() => '?').join(',');
    where.push(`cb.status IN (${inList})`);
    params.push(...statuses);
  }

  // 2) дополнительно фильтруем по дате создания (если нужно)
  if (dateFrom) {
    where.push(`cb.date_creation >= ?`);
    params.push(dateFrom);
  }
  if (dateTo) {
    where.push(`cb.date_creation <= ?`);
    params.push(dateTo);
  }

  // 3) поиск по разным полям
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

  // 4) дополнительное условие (для Active/History)
  if (extraWhere) where.push(extraWhere);

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // 5) посчитать общее число
  const [[{ total }]] = await db.execute(
    `SELECT COUNT(*) AS total
       FROM car_book cb
       JOIN car c ON c.id = cb.car_id
       JOIN car_category cat ON cat.id = c.car_category_id
       JOIN user_info ui ON ui.user_id = cb.user_id
     ${whereSQL}`,
    params
  );

  // 6) получить саму страницу
  const [rows] = await db.execute(
    `SELECT
       cb.id, cb.car_id, cb.user_id, cb.phone_number,
       cb.purpose, cb.route,
       cb.date_start, cb.date_expired, cb.status, cb.date_creation,
       c.model, c.number, cat.name AS category_name,
       ui.surname, ui.name, ui.patronym
     FROM car_book cb
     JOIN car c ON c.id = cb.car_id
     JOIN car_category cat ON cat.id = c.car_category_id
     JOIN user_info ui ON ui.user_id = cb.user_id
     ${whereSQL}
     ORDER BY cb.date_creation DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows, total };
}

// Active: статус approved и ещё не истёк
exports.listActive = (opts) => listByStatuses(
  ['approved'],
  opts,
  `cb.date_expired >= NOW()`
);

// Pending: как было
exports.listPending = (opts) => listByStatuses(
  ['pending'],
  opts
);

// History: либо явно отменён/отклонён, либо истёк
exports.listHistory = (opts) => listByStatuses(
  [], // статусы мы учтём в extraWhere
  opts,
  `(cb.status IN ('canceled','rejected') OR cb.date_expired < NOW())`
);

exports.createBooking = async ({
  car_id, user_id, phone_number,
  purpose, route, date_start, date_expired
}) => {
  const [result] = await db.execute(
    `INSERT INTO car_book
       (car_id, user_id, phone_number, purpose, route,
        date_start, date_expired, status, date_creation)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [car_id, user_id, phone_number, purpose, route, date_start, date_expired]
  );
  return { id: result.insertId };
};

exports.updateStatus = async (id, status) => {
  const valid = ['pending','approved','canceled','rejected'];
  if (!valid.includes(status)) throw new Error('Invalid status');
  const [res] = await db.execute(
    `UPDATE car_book SET status = ? WHERE id = ?`,
    [status, id]
  );
  return res.affectedRows > 0;
};
