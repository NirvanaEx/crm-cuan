// services/auth/registrationService.js

const db = require('../../config/db');
const bcrypt = require('bcrypt');

/**
 *  Custom Error for validation failures.
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.isValidation = true;
  }
}

/**
 *  Validates registration data:
 *   - login: lowercase, starts with letter, then letters or digits
 *   - no existing pending request for same login/tab_num
 *   - password: min 8 chars
 *   - tab_num: alphanumeric
 *   - unique in user and user_info tables
 */
async function validateRegistration({ login, password, tab_num }) {
  // 1. Login format
  if (!/^[a-z][a-z0-9]+$/.test(login)) {
    throw new ValidationError(
      'Login must start with a letter and contain only lowercase letters and digits'
    );
  }

  // 2. Prevent spam: pending request for same login?
  const [pendingLogin] = await db.execute(
    `SELECT id FROM user_registration_request
       WHERE login = ? AND status = 'pending'`,
    [login]
  );
  if (pendingLogin.length) {
    throw new ValidationError('There is already a pending request for this login');
  }

  // 3. Prevent spam: pending request for same tab_num?
  const [pendingTab] = await db.execute(
    `SELECT id FROM user_registration_request
       WHERE tab_num = ? AND status = 'pending'`,
    [tab_num]
  );
  if (pendingTab.length) {
    throw new ValidationError('There is already a pending request for this tab number');
  }

  // 4. Login uniqueness in users
  const [userLogin] = await db.execute(
    'SELECT id FROM `user` WHERE login = ?',
    [login]
  );
  if (userLogin.length) {
    throw new ValidationError('Login already taken');
  }

  // 5. Password length
  if (typeof password !== 'string' || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  // 6. tab_num format
  if (!/^[A-Za-z0-9]+$/.test(tab_num)) {
    throw new ValidationError('Tab number must be alphanumeric');
  }

  // 7. tab_num uniqueness in user_info
  const [infoTab] = await db.execute(
    'SELECT id FROM user_info WHERE tab_num = ?',
    [tab_num]
  );
  if (infoTab.length) {
    throw new ValidationError('Tab number already assigned to a user');
  }
}

/**
 *  Creates a new registration request.
 *  - Runs validation.
 *  - Hashes password.
 *  - Inserts into user_registration_request with status = 'pending'.
 */
exports.createRequest = async ({
  login,
  password,
  surname,
  name,
  patronym,
  tab_num,
  phone
}) => {
  // Run all validations
  await validateRegistration({ login, password, tab_num });

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into user_registration_request
  const [result] = await db.execute(
    `INSERT INTO user_registration_request
      (login, password, surname, name, patronym, tab_num, phone, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      login,
      hashedPassword,
      surname,
      name,
      patronym || null,
      tab_num,
      phone || null
    ]
  );

  return {
    id: result.insertId,
    login,
    status: 'pending'
  };
};

// Export custom error so controller can detect it
exports.ValidationError = ValidationError;
