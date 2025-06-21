const db = require('../../config/db');
const bcrypt = require('bcrypt');

/**
 *  Creates a registration request in user_registration_request table.
 */
exports.createRequest = async ({
  login, password, surname, name,
  patronym, tab_num, phone
}) => {
  // Hashes password before insert
  const hashed = await bcrypt.hash(password, 10);

  // Inserts new request
  const [result] = await db.execute(
    `INSERT INTO user_registration_request
      (login, password, surname, name, patronym, tab_num, phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [login, hashed, surname, name, patronym || null, tab_num || null, phone || null]
  );

  // Returns minimal info
  return {
    id: result.insertId,
    login,
    status: 'pending'
  };
};
