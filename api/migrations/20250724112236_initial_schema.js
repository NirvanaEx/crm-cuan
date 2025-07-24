// migrations/20250724112236_initial_schema.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1) Lookup-таблицы без FK
  if (!(await knex.schema.hasTable('language'))) {
    await knex.schema.createTable('language', table => {
      table.increments('id');
      table.string('code', 10).notNullable();
      table.string('name', 100).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('access'))) {
    await knex.schema.createTable('access', table => {
      table.increments('id');
      table.string('name', 50).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('certificate'))) {
    await knex.schema.createTable('certificate', table => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('role'))) {
    await knex.schema.createTable('role', table => {
      table.increments('id');
      table.string('name', 50).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('user'))) {
    await knex.schema.createTable('user', table => {
      table.increments('id');
      table.string('login', 100).notNullable().unique();
      table.string('password', 255).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('car_category'))) {
    await knex.schema.createTable('car_category', table => {
      table.increments('id');
      table.string('name', 255).notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('hotel_room'))) {
    await knex.schema.createTable('hotel_room', table => {
      table.increments('id');
      table.string('num', 50).notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted','paused']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('file'))) {
    await knex.schema.createTable('file', table => {
      table.increments('id');
      table.string('file_path', 255).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('message'))) {
    await knex.schema.createTable('message', table => {
      table.increments('id');
      table.text('message_text').notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  // 2) Таблицы с внешними ключами
  if (!(await knex.schema.hasTable('message_file'))) {
    await knex.schema.createTable('message_file', table => {
      table.increments('id');
      table.integer('file_id').unsigned().notNullable().references('id').inTable('file');
      table.integer('message_id').unsigned().notNullable().references('id').inTable('message');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('message_send'))) {
    await knex.schema.createTable('message_send', table => {
      table.increments('id');
      table.integer('user_id_sender').unsigned().notNullable().references('id').inTable('user');
      table.integer('user_id_reciver').unsigned().notNullable().references('id').inTable('user');
      table.integer('message_id').unsigned().notNullable().references('id').inTable('message');
      table.boolean('is_read').defaultTo(false);
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('log'))) {
    await knex.schema.createTable('log', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.string('action_name', 100).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  // 3) Certificate-детали
  if (!(await knex.schema.hasTable('certificate_field'))) {
    await knex.schema.createTable('certificate_field', table => {
      table.increments('id');
      table.integer('certificate_id').unsigned().notNullable().references('id').inTable('certificate');
      table.string('field_name', 255).notNullable();
      table.string('field_type', 50).notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('certificate_request'))) {
    await knex.schema.createTable('certificate_request', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.integer('certificate_id').unsigned().notNullable().references('id').inTable('certificate');
      table.enu('status', ['pending','approved','rejected','canceled']).notNullable().defaultTo('pending');
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('certificate_data'))) {
    await knex.schema.createTable('certificate_data', table => {
      table.increments('id');
      table.integer('certificate_request_id').unsigned().notNullable().references('id').inTable('certificate_request');
      table.integer('certificate_field_id').unsigned().notNullable().references('id').inTable('certificate_field');
      table.text('value').notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  // 4) Локализация и права
  if (!(await knex.schema.hasTable('access_translation'))) {
    await knex.schema.createTable('access_translation', table => {
      table.increments('id');
      table.integer('access_id').unsigned().notNullable().references('id').inTable('access');
      table.integer('language_id').unsigned().notNullable().references('id').inTable('language');
      table.text('description').nullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('role_access'))) {
    await knex.schema.createTable('role_access', table => {
      table.increments('id');
      table.integer('role_id').unsigned().notNullable().references('id').inTable('role');
      table.integer('access_id').unsigned().notNullable().references('id').inTable('access');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('role_translation'))) {
    await knex.schema.createTable('role_translation', table => {
      table.increments('id');
      table.integer('role_id').unsigned().notNullable().references('id').inTable('role');
      table.integer('language_id').unsigned().notNullable().references('id').inTable('language');
      table.text('description').nullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  // 5) Пользователи и роли
  if (!(await knex.schema.hasTable('users_role'))) {
    await knex.schema.createTable('users_role', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.integer('role_id').unsigned().notNullable().references('id').inTable('role');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('user_info'))) {
    await knex.schema.createTable('user_info', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.string('surname', 100).notNullable();
      table.string('name', 100).notNullable();
      table.string('patronym', 100).nullable();
      table.string('tab_num', 50).nullable();
      table.string('phone', 20).nullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('user_registration_request'))) {
    await knex.schema.createTable('user_registration_request', table => {
      table.increments('id');
      table.string('login', 255).notNullable();
      table.string('password', 255).notNullable();
      table.string('surname', 255).notNullable();
      table.string('name', 255).notNullable();
      table.string('patronym', 255).nullable();
      table.string('tab_num', 50).nullable();
      table.string('phone', 30).nullable();
      table.enu('status', ['pending','approved','rejected']).notNullable().defaultTo('pending');
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('user_token'))) {
    await knex.schema.createTable('user_token', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.string('token', 255).notNullable();
      table.dateTime('date_expired').notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
      table.enu('token_status', ['active','revoked']).defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('user_session'))) {
    await knex.schema.createTable('user_session', table => {
      table.increments('id');
      table.integer('user_token_id').unsigned().notNullable().references('id').inTable('user_token');
      table.text('device').nullable();
      table.string('ip_address', 45).nullable();
      table.timestamp('date_last_active').defaultTo(knex.fn.now());
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('user_setting'))) {
    await knex.schema.createTable('user_setting', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.integer('selected_language_id').unsigned().nullable().references('id').inTable('language');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('user_status_history'))) {
    await knex.schema.createTable('user_status_history', table => {
      table.increments('id');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.enu('status', ['active','banned','deleted']).defaultTo('active');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }

  // 6) Транспорт и гостиницы
  if (!(await knex.schema.hasTable('car'))) {
    await knex.schema.createTable('car', table => {
      table.increments('id');
      table.integer('car_category_id').unsigned().notNullable().references('id').inTable('car_category');
      table.string('model', 255).notNullable();
      table.string('number', 100).notNullable();
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('car_book'))) {
    await knex.schema.createTable('car_book', table => {
      table.increments('id');
      table.integer('car_id').unsigned().notNullable().references('id').inTable('car');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.string('phone_number', 20).notNullable();
      table.string('purpose', 255).notNullable();
      table.text('route').notNullable();
      table.dateTime('date_start').notNullable();
      table.dateTime('date_expired').notNullable();
      table.enu('status', ['pending','approved','canceled','rejected']).notNullable().defaultTo('pending');
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
    });
  }

  if (!(await knex.schema.hasTable('hotel_photo'))) {
    await knex.schema.createTable('hotel_photo', table => {
      table.increments('id');
      table.integer('hotel_room_id').unsigned().notNullable().references('id').inTable('hotel_room');
      table.string('path', 500).notNullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
      table.enu('data_status', ['active','deleted']).notNullable().defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('hotel_book'))) {
    await knex.schema.createTable('hotel_book', table => {
      table.increments('id');
      table.integer('room_id').unsigned().notNullable().references('id').inTable('hotel_room');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('user');
      table.string('phone', 30).notNullable();
      table.string('purpose', 255).nullable();
      table.dateTime('date_start').notNullable();
      table.dateTime('date_end').notNullable();
      table.enu('status', ['pending','approved','canceled','rejected']).notNullable().defaultTo('pending');
      table.string('door_code', 10).nullable();
      table.timestamp('date_creation').notNullable().defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const tables = [
    'hotel_book','hotel_photo','car_book','car',
    'user_status_history','user_setting','user_session','user_token','user_registration_request','user_info','users_role',
    'role_translation','role_access','access_translation',
    'certificate_data','certificate_request','certificate_field',
    'log','message_send','message_file','message',
    'file','hotel_room','car_category','user','role','certificate','access','language'
  ];
  for (const name of tables) {
    await knex.schema.dropTableIfExists(name);
  }
};
