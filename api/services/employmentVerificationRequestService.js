// services/employmentVerificationRequestService.js
const db = require('../config/db');

exports.getRequests = async ({ page = 1, perPage = 20 } = {}) => {
  const offset = (page - 1) * perPage;
  // Он выбирает заявки с нумерацией и считает общее количество
  const [items] = await db.execute(
    `
      SELECT
        ROW_NUMBER() OVER (ORDER BY evr.date_creation DESC) AS num,
        evr.id,
        u.login,
        CONCAT_WS(' ', ui.surname, ui.name, ui.patronym) AS full_name,
        DATE_FORMAT(evr.date_update,   '%Y-%m-%d %H:%i:%s') AS date_update,
        DATE_FORMAT(evr.date_creation, '%Y-%m-%d %H:%i:%s') AS date_creation,
        evr.status
      FROM employment_verification_request evr
      JOIN \`user\`      u  ON u.id       = evr.user_id
      JOIN user_info     ui ON ui.user_id = u.id
      ORDER BY evr.date_creation DESC
      LIMIT ? OFFSET ?
    `,
    [perPage, offset]
  );
  const [cnt] = await db.execute(
    'SELECT COUNT(*) AS total FROM employment_verification_request'
  );
  return { total: cnt[0].total, items };
};

exports.createRequest = async ({ userId }) => {
  // Он вставляет новую запись и сразу возвращает её
  const [result] = await db.execute(
    `
      INSERT INTO employment_verification_request
        (user_id, status, date_creation, date_update)
      VALUES (?, 'pending', NOW(), NOW())
    `,
    [userId]
  );
  const insertId = result.insertId;
  const [rows] = await db.execute(
    `
      SELECT
        id, user_id, status,
        DATE_FORMAT(date_creation, '%Y-%m-%d %H:%i:%s') AS date_creation,
        DATE_FORMAT(date_update,   '%Y-%m-%d %H:%i:%s') AS date_update
      FROM employment_verification_request
      WHERE id = ?
    `,
    [insertId]
  );
  return rows[0];
};

exports.updateStatus = async ({ id, status }) => {
  // Он обновляет статус и дату обновления
  const [result] = await db.execute(
    `
      UPDATE employment_verification_request
      SET status = ?, date_update = NOW()
      WHERE id = ?
    `,
    [status, id]
  );
  return result.affectedRows > 0;
};

exports.getByUser = async ({ userId }) => {
  // Он возвращает все заявки одного пользователя
  const [rows] = await db.execute(
    `
      SELECT
        id, user_id, status,
        DATE_FORMAT(date_creation, '%Y-%m-%d %H:%i:%s') AS date_creation,
        DATE_FORMAT(date_update,   '%Y-%m-%d %H:%i:%s') AS date_update
      FROM employment_verification_request
      WHERE user_id = ?
      ORDER BY date_creation DESC
    `,
    [userId]
  );
  return rows;
};
