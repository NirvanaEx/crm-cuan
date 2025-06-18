// services/car/carCategoryService.js
const db = require('../../config/db');

exports.listCategories = async () => {
  // Returns all categories with status 'active'
  const [rows] = await db.execute(
    'SELECT id, name, date_creation, data_status FROM car_category WHERE data_status = "active"'
  );
  return rows;
};

exports.getCategoryById = async (id) => {
  // Returns single category by its id
  const [rows] = await db.execute(
    'SELECT id, name, date_creation, data_status FROM car_category WHERE id = ?',
    [id]
  );
  return rows[0];
};

exports.createCategory = async ({ name }) => {
  // Inserts a new category
  const [result] = await db.execute(
    'INSERT INTO car_category (name, date_creation, data_status) VALUES (?, NOW(), "active")',
    [name]
  );
  return { id: result.insertId, name };
};

exports.updateCategory = async (id, { name, data_status }) => {
  // Updates name and/or status of category
  await db.execute(
    'UPDATE car_category SET name = COALESCE(?, name), data_status = COALESCE(?, data_status) WHERE id = ?',
    [name, data_status, id]
  );
  return true;
};

exports.deleteCategory = async (id) => {
  // Marks category as deleted
  await db.execute(
    'UPDATE car_category SET data_status = "deleted" WHERE id = ?',
    [id]
  );
  return true;
};
