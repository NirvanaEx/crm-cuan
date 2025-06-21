// services/admin/registrationAdminService.js

const db = require('../../config/db');

/**
 *  Builds WHERE clause based on filters.
 */
function buildFilters({ search, searchField, dateFrom, dateTo }) {
  const conditions = [];
  const params = [];

  // Text search
  if (search && searchField) {
    conditions.push(`${searchField} LIKE ?`);
    params.push(`%${search}%`);
  }

  // Date range filter
  if (dateFrom) {
    conditions.push(`date_creation >= ?`);
    params.push(dateFrom);
  }
  if (dateTo) {
    conditions.push(`date_creation <= ?`);
    params.push(dateTo);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return { where, params };
}

/**
 *  Returns paginated list of registration requests with total count.
 */
exports.listRequests = async ({
  page, limit, search, searchField, dateFrom, dateTo
}) => {
  const offset = (page - 1) * limit;
  const { where, params } = buildFilters({ search, searchField, dateFrom, dateTo });

  // Count total matching rows
  const countSql = `
    SELECT COUNT(*) AS total
      FROM user_registration_request
    ${where}
  `;
  const [countRows] = await db.execute(countSql, params);
  const total = countRows[0].total;

  // Fetch paginated rows
  const dataSql = `
    SELECT id, login, surname, name, patronym,
           tab_num, phone, status, date_creation
      FROM user_registration_request
    ${where}
    ORDER BY date_creation DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.execute(dataSql, [...params, limit, offset]);

  return { rows, total };
};

/**
 *  Returns a single request by ID.
 */
exports.findById = async (id) => {
  const [rows] = await db.execute(
    `SELECT id, login, surname, name, patronym,
            tab_num, phone, status, date_creation
       FROM user_registration_request
      WHERE id = ?`,
    [id]
  );
  return rows[0];
};

/**
 *  Approves or rejects a request.
 *  On approve: moves data into user tables, then updates status.
 *  On reject: updates status only.
 */
exports.processRequest = async (id, status) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lock and fetch the pending request
    const [rows] = await conn.execute(
      `SELECT * 
         FROM user_registration_request 
        WHERE id = ? AND status = 'pending'
        FOR UPDATE`,
      [id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return false;
    }

    const req = rows[0];

    if (status === 'approved') {
      // Inserts new user
      const [userRes] = await conn.execute(
        `INSERT INTO \`user\` (login, password) VALUES (?, ?)`,
        [req.login, req.password]
      );
      const userId = userRes.insertId;

      // Inserts user_info
      await conn.execute(
        `INSERT INTO user_info
           (user_id, surname, name, patronym, tab_num, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, req.surname, req.name, req.patronym, req.tab_num, req.phone]
      );

      // Fetches default 'user' role id
      const [[{ id: userRoleId }]] = await conn.execute(
        `SELECT id FROM role WHERE LOWER(name) = 'user' LIMIT 1`
      );

      // Assigns role and initial status
      await conn.execute(
        `INSERT INTO users_role (user_id, role_id) VALUES (?, ?)`,
        [userId, userRoleId]
      );
      await conn.execute(
        `INSERT INTO user_status_history (user_id, status) VALUES (?, 'active')`,
        [userId]
      );
    }

    // Updates request status
    await conn.execute(
      `UPDATE user_registration_request
          SET status = ?
        WHERE id = ?`,
      [status, id]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
