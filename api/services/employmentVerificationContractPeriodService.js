const db = require('../config/db');

exports.getPeriods = async ({ requestId }) => {
  const [rows] = await db.execute(
    `SELECT
       evcp.id,
       evcp.contract_history_id,
       evcp.snapshot_date_start,
       evcp.snapshot_date_end,
       evcp.snapshot_work_ratio,
       ech.position_id,
       ep.name AS position_name
     FROM employment_verification_contract_period evcp
     JOIN employment_contract_history ech
       ON ech.id = evcp.contract_history_id
     JOIN employment_position ep
       ON ep.id = ech.position_id
     WHERE evcp.verification_request_id = ?
     ORDER BY evcp.id`,
    [requestId]
  );
  return rows;
};

exports.createPeriods = async ({ requestId, contractIds }) => {
  // Получает детали контрактов по списку ID
  const placeholders = contractIds.map(() => '?').join(',');
  const [contracts] = await db.execute(
    `SELECT id, work_ratio, date_start, date_end
       FROM employment_contract_history
      WHERE id IN (${placeholders})`,
    contractIds
  );

  if (!contracts.length) return [];

  // Вставляет snapshot-версии в таблицу
  const values = [];
  contracts.forEach(c => {
    values.push(
      requestId,     // verification_request_id
      c.id,          // contract_history_id
      c.date_start,  // snapshot_date_start
      c.date_end,    // snapshot_date_end
      c.work_ratio   // snapshot_work_ratio
    );
  });

  const rowsClause = contracts.map(() => '(?, ?, ?, ?, ?, NOW())').join(',');
  const sql = `
    INSERT INTO employment_verification_contract_period
      (verification_request_id, contract_history_id, snapshot_date_start, snapshot_date_end, snapshot_work_ratio, date_creation)
    VALUES ${rowsClause}
  `;

  const [result] = await db.execute(sql, values);

  // Возвращает вставленные ID и исходные данные
  return contracts.map((c, idx) => ({
    id:            result.insertId + idx,
    contractId:    c.id,
    snapshotStart: c.date_start,
    snapshotEnd:   c.date_end,
    snapshotRatio: c.work_ratio
  }));
};
