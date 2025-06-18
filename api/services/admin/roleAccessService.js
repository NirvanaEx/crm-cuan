const db = require('../../config/db');

exports.getAccessForRole = async (roleId) => {
    const [rows] = await db.execute(
        `SELECT a.id AS access_id, a.name, a.date_creation
           FROM role_access ra
           JOIN access a ON ra.access_id = a.id
          WHERE ra.role_id = ?`,
        [roleId]
    );
    return rows;
};

exports.addAccessToRole = async (roleId, accessId) => {
    const [result] = await db.execute(
        'INSERT INTO role_access (role_id, access_id, date_creation) VALUES (?, ?, NOW())',
        [roleId, accessId]
    );
    return result.affectedRows > 0;
};

exports.removeAccessFromRole = async (roleId, accessId) => {
    const [result] = await db.execute(
        'DELETE FROM role_access WHERE role_id = ? AND access_id = ?',
        [roleId, accessId]
    );
    return result.affectedRows > 0;
};
