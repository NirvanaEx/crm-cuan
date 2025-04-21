// Подключает конфиг БД
const db = require('../config/db');

/* ------------------------------------------------------------------ */
/*  1. Кусок контрактов для страницы (users + contracts)              */
/* ------------------------------------------------------------------ */
exports.getContractsChunk = async ({ page = 1, perPage = 20 }) => {
  /* 1‑a  id‑шники нужных пользователей */
  const [userRows] = await db.execute(
    `SELECT DISTINCT u.id
       FROM employment_contract_history ech
       JOIN user u ON u.id = ech.user_id
      WHERE ech.data_status = 'active'
      ORDER BY u.login
      LIMIT ? OFFSET ?`,
    [perPage, (page - 1) * perPage]
  );
  if (!userRows.length) return { contracts: [], totalUsers: 0 };

  const userIds = userRows.map(r => r.id);

  /* 1‑b  контракты этих пользователей */
  const [contracts] = await db.execute(
    `SELECT
        ech.id,
        ech.user_id,
        u.login                          AS user_login,
        CONCAT_WS(' ', ui.surname, ui.name, ui.patronym) AS full_name,
        ech.position_id,
        ep.name                          AS position_name,
        ech.work_ratio,
        ech.date_start,
        ech.date_end,
        ech.date_creation
     FROM employment_contract_history ech
     JOIN user            u  ON u.id       = ech.user_id
     JOIN user_info       ui ON ui.user_id = u.id
     JOIN employment_position ep ON ep.id  = ech.position_id
     WHERE ech.data_status = 'active'
       AND ech.user_id IN (${userIds.map(() => '?').join(',')})
     ORDER BY u.login, ech.date_start DESC`,
    userIds
  );

  /* 1‑c  общее количество уникальных пользователей */
  const [tot] = await db.execute(
    `SELECT COUNT(DISTINCT user_id) AS total
       FROM employment_contract_history
      WHERE data_status = 'active'`
  );

  return { contracts, totalUsers: tot[0].total };
};

/* ------------------------------------------------------------------ */
/*  2. Контракты одного пользователя                                  */
/* ------------------------------------------------------------------ */
exports.getContractsByUserId = async userId => {
  const [rows] = await db.execute(
    `SELECT ech.*,
            ep.name AS position_name
       FROM employment_contract_history ech
       JOIN employment_position ep ON ep.id = ech.position_id
      WHERE ech.user_id = ?
        AND ech.data_status = 'active'
      ORDER BY ech.date_start DESC`,
    [userId]
  );
  return rows;
};

/* ------------------------------------------------------------------ */
/*  3. CRUD                                                            */
/* ------------------------------------------------------------------ */
exports.createContract = async (userId, positionId, workRatio, dateStart, dateEnd) => {
  const [res] = await db.execute(
    `INSERT INTO employment_contract_history
       (user_id, position_id, work_ratio, date_start, date_end, date_creation, data_status)
     VALUES (?, ?, ?, ?, ?, NOW(), 'active')`,
    [userId, positionId, workRatio, dateStart, dateEnd]
  );
  return { id: res.insertId };
};

exports.updateContract = async (id, { positionId, workRatio, dateStart, dateEnd }) => {
  const [res] = await db.execute(
    `UPDATE employment_contract_history
        SET position_id = COALESCE(?, position_id),
            work_ratio  = COALESCE(?, work_ratio),
            date_start  = COALESCE(?, date_start),
            date_end    = COALESCE(?, date_end)
      WHERE id = ? AND data_status = 'active'`,
    [positionId, workRatio, dateStart, dateEnd, id]
  );
  return res.affectedRows > 0;
};

exports.deleteContract = async id => {
  const [res] = await db.execute(
    `UPDATE employment_contract_history
        SET data_status = 'deleted'
      WHERE id = ? AND data_status = 'active'`,
    [id]
  );
  return res.affectedRows > 0;
};
