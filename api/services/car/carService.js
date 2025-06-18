// services/carService.js
const db = require('../../config/db');

// Returns list of all cars (including their category names)
exports.listCars = async () => {
  const [rows] = await db.execute(
    `SELECT c.id, c.car_category_id, cat.name AS category_name,
            c.model, c.number, c.data_status, c.date_creation
     FROM car c
     LEFT JOIN car_category cat ON c.car_category_id = cat.id
     WHERE c.data_status <> 'deleted'`
  );
  return rows;
};

exports.listAvailable = async (date_start, date_expired) => {
  const params = [];
  let where = 'c.data_status = "active"';

  // Если обе даты переданы, фильтруем по занятости
  if (date_start && date_expired) {
    where += ` AND c.id NOT IN (
      SELECT cb.car_id
      FROM car_book cb
      WHERE cb.status IN ('pending','approved')
        AND NOT (cb.date_expired < ? OR cb.date_start > ?)
    )`;
    params.push(date_start, date_expired);
  }

  const [rows] = await db.execute(
    `SELECT
       c.id,
       c.car_category_id,
       cat.name AS category_name,  /* добавлено */
       c.model,
       c.number,
       c.data_status
     FROM car c
     JOIN car_category cat ON cat.id = c.car_category_id  /* добавлено */
     WHERE ${where}`,
    params
  );

  return rows;
};

// Returns one car by id
exports.getCarById = async (id) => {
  const [rows] = await db.execute(
    `SELECT c.id, c.car_category_id, cat.name AS category_name,
            c.model, c.number, c.data_status, c.date_creation
     FROM car c
     LEFT JOIN car_category cat ON c.car_category_id = cat.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0];
};

// Creates a new car model
exports.createCar = async ({ car_category_id, model, number }) => {
  // Optionally verify that category exists
  const [cats] = await db.execute(
    'SELECT id FROM car_category WHERE id = ? AND data_status = "active"',
    [car_category_id]
  );
  if (cats.length === 0) {
    throw new Error('Invalid car_category_id');
  }

  const [result] = await db.execute(
    `INSERT INTO car
       (car_category_id, model, number, data_status, date_creation)
     VALUES (?, ?, ?, 'active', NOW())`,
    [car_category_id, model, number]
  );
  return { id: result.insertId };
};

// Updates an existing car model
exports.updateCar = async (id, { car_category_id, model, number, data_status }) => {
  // Optionally verify that category exists
  if (car_category_id) {
    const [cats] = await db.execute(
      'SELECT id FROM car_category WHERE id = ? AND data_status = "active"',
      [car_category_id]
    );
    if (cats.length === 0) {
      throw new Error('Invalid car_category_id');
    }
  }

  // Update only provided fields
  await db.execute(
    `UPDATE car
       SET car_category_id = COALESCE(?, car_category_id),
           model           = COALESCE(?, model),
           number          = COALESCE(?, number),
           data_status     = COALESCE(?, data_status)
     WHERE id = ?`,
    [car_category_id, model, number, data_status, id]
  );
  return true;
};

// Soft-deletes a car (sets data_status = 'deleted')
exports.deleteCar = async (id) => {
  const [res] = await db.execute(
    'UPDATE car SET data_status = "deleted" WHERE id = ?',
    [id]
  );
  return res.affectedRows > 0;
};
