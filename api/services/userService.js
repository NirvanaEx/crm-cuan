const mysql = require('mysql2/promise');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const isSuperadmin = (user) => {
    return user.roles && user.roles.some(r => r.name.toLowerCase() === 'superadmin');
};

const isAdmin = (user) => {
    return user.roles && user.roles.some(r => r.name.toLowerCase() === 'admin');
};

const getRoleNameById = async (roleId) => {
    const [rows] = await db.execute(
        'SELECT name FROM role WHERE id = ?',
        [roleId]
    );
    return rows.length ? rows[0].name.toLowerCase() : null;
};

exports.createUserWithRole = async (currentUser, { login, password, surname, name, patronym, phone, roleId }) => {
    if (!currentUser) {
        throw new Error('Пользователь не авторизован для создания пользователя');
    }
    const targetRole = await getRoleNameById(roleId);
    if (!targetRole) {
        throw new Error('Неверная роль');
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const hashedPassword = await bcrypt.hash(password, 10);
        const [resultUser] = await connection.execute(
            'INSERT INTO `user` (login, password) VALUES (?, ?)',
            [login, hashedPassword]
        );
        const userId = resultUser.insertId;
        await connection.execute(
            'INSERT INTO user_info (user_id, surname, name, patronym, phone) VALUES (?, ?, ?, ?, ?)',
            [userId, surname || '', name || '', patronym || '', phone || '']
        );
        await connection.execute(
            'INSERT INTO users_role (user_id, role_id) VALUES (?, ?)',
            [userId, roleId]
        );
        await connection.execute(
            'INSERT INTO user_status_history (user_id, status) VALUES (?, ?)',
            [userId, 'active']
        );
        await connection.commit();
        return { id: userId, login };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.getUsers = async (currentUser, search, searchField) => {
    let query = `
      SELECT
        u.id,
        u.login,
        u.date_creation,
        ui.surname,
        ui.name,
        ui.patronym,
        ui.phone,
        ur.role_id,
        r.name AS role_name,
        (
          SELECT COALESCE(
            (SELECT ush.status
             FROM user_status_history ush
             WHERE ush.user_id = u.id
             ORDER BY ush.date_creation DESC
             LIMIT 1),
            'active'
          )
        ) AS status
      FROM \`user\` u
      LEFT JOIN user_info ui ON u.id = ui.user_id
      LEFT JOIN users_role ur ON u.id = ur.user_id
      LEFT JOIN role r ON ur.role_id = r.id
    `;
    const conditions = [];
    const values = [];
    
    // Поиск по выбранному полю
    if (search && searchField) {
      if (searchField === 'fullName') {
        conditions.push("CONCAT_WS(' ', ui.surname, ui.name, ui.patronym) LIKE ?");
        values.push(`%${search}%`);
      } else if (searchField === 'role_name') {
        conditions.push("LOWER(r.name) LIKE ?");
        values.push(`%${search.toLowerCase()}%`);
      } else if (['login', 'phone'].includes(searchField)) {
        conditions.push(`${searchField} LIKE ?`);
        values.push(`%${search}%`);
      }
    }
    
    // Ограничения для администраторов
    if (isSuperadmin(currentUser)) {
      // Суперадмин видит всех
    } else if (isAdmin(currentUser)) {
      conditions.push("LOWER(r.name) <> 'superadmin'");
    } else {
      conditions.push(`(
        u.id NOT IN (
          SELECT DISTINCT user_id FROM user_status_history
        )
        OR u.id IN (
          SELECT ush.user_id
          FROM user_status_history ush
          WHERE ush.date_creation = (
            SELECT MAX(date_creation)
            FROM user_status_history
            WHERE user_id = ush.user_id
          )
          AND ush.status = 'active'
        )
      )`);
    }
    
    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }
    
    const [rows] = await db.execute(query, values);
    return rows;
  };

exports.getUserById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM `user` WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.getUserFullDetails = async (id) => {
    const [rows] = await db.execute(
        `SELECT
      u.id,
      u.login,
      u.date_creation,
      ui.surname,
      ui.name,
      ui.patronym,
      ui.phone,
      ur.role_id,
      r.name AS role_name,
      (
        SELECT COALESCE(
          (SELECT ush.status
           FROM user_status_history ush
           WHERE ush.user_id = u.id
           ORDER BY ush.date_creation DESC
           LIMIT 1),
          'active'
        )
      ) AS status
    FROM \`user\` u
    LEFT JOIN user_info ui ON u.id = ui.user_id
    LEFT JOIN users_role ur ON u.id = ur.user_id
    LEFT JOIN role r ON ur.role_id = r.id
    WHERE u.id = ?`,
        [id]
    );
    return rows[0];
};

exports.updateUserFull = async (currentUser, id, { login, password, surname, name, patronym, phone, roleId, status }) => {
    if (!currentUser) {
        throw new Error('Пользователь не авторизован для обновления');
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [targetRoleRows] = await connection.execute(
            `SELECT r.name AS role_name FROM users_role ur
             JOIN role r ON ur.role_id = r.id
             WHERE ur.user_id = ?`,
            [id]
        );
        const targetRole = targetRoleRows.length ? targetRoleRows[0].role_name.toLowerCase() : null;
        if (!targetRole) {
            await connection.rollback();
            return false;
        }
        const [oldUserRows] = await connection.execute(
            'SELECT login, password FROM `user` WHERE id = ?',
            [id]
        );
        if (oldUserRows.length === 0) {
            await connection.rollback();
            return false;
        }
        let finalPassword = oldUserRows[0].password;
        if (password && password.trim() !== '') {
            finalPassword = await bcrypt.hash(password, 10);
        }
        let finalLogin = oldUserRows[0].login;
        if (login && login.trim() !== '') {
            finalLogin = login;
        }
        await connection.execute(
            'UPDATE `user` SET login = ?, password = ? WHERE id = ?',
            [finalLogin, finalPassword, id]
        );
        await connection.execute(
            `UPDATE user_info
             SET surname = COALESCE(?, surname),
                 name = COALESCE(?, name),
                 patronym = COALESCE(?, patronym),
                 phone = COALESCE(?, phone)
             WHERE user_id = ?`,
            [surname, name, patronym, phone, id]
        );
        if (roleId !== undefined && roleId !== null && String(roleId).trim() !== '') {
            const newRole = await getRoleNameById(roleId);
            if (!newRole) {
                throw new Error('Неверная новая роль');
            }
            await connection.execute(
                'DELETE FROM users_role WHERE user_id = ?',
                [id]
            );
            await connection.execute(
                'INSERT INTO users_role (user_id, role_id) VALUES (?, ?)',
                [id, roleId]
            );
        }
        if (status !== undefined && status !== null && String(status).trim() !== '') {
            await connection.execute(
                'INSERT INTO user_status_history (user_id, status) VALUES (?, ?)',
                [id, status]
            );
        }
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.updateUserStatus = async (currentUser, id, status) => {
    if (!currentUser) {
        throw new Error('Пользователь не авторизован для обновления статуса');
    }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [targetRoleRows] = await connection.execute(
            `SELECT r.name AS role_name FROM users_role ur
             JOIN role r ON ur.role_id = r.id
             WHERE ur.user_id = ?`,
            [id]
        );
        const targetRole = targetRoleRows.length ? targetRoleRows[0].role_name.toLowerCase() : null;
        if (!targetRole) {
            await connection.rollback();
            return false;
        }
        const [rows] = await connection.execute(
            'SELECT id FROM `user` WHERE id = ?',
            [id]
        );
        if (rows.length === 0) {
            await connection.rollback();
            return false;
        }
        await connection.execute(
            'INSERT INTO user_status_history (user_id, status) VALUES (?, ?)',
            [id, status]
        );
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

exports.deleteUser = async (currentUser, id) => {
    if (!currentUser) {
        throw new Error('Пользователь не авторизован для удаления');
    }
    const [roleRows] = await db.execute(
        `SELECT r.name AS role_name FROM users_role ur
         JOIN role r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [id]
    );
    const targetRole = roleRows.length ? roleRows[0].role_name.toLowerCase() : null;
    if (!targetRole) {
        throw new Error('Пользователь не найден');
    }
    try {
        const [result] = await db.execute(
            'INSERT INTO user_status_history (user_id, status) VALUES (?, ?)',
            [id, 'deleted']
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};
