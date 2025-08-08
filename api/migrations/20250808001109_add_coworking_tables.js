/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  if (!(await knex.schema.hasTable('coworking'))) {
    await knex.schema.createTable('coworking', (table) => {
      table.increments('id').primary(); // INT UNSIGNED
      table.string('room', 100).notNullable();
      table.timestamp('date_creation').defaultTo(knex.fn.now());
      table.enu('data_status', ['active', 'deleted', 'paused']).defaultTo('active');
    });
  }

  if (!(await knex.schema.hasTable('coworking_book'))) {
    await knex.schema.createTable('coworking_book', (table) => {
      table.increments('id').primary();
      table.integer('coworking_id').unsigned().notNullable()
           .references('id').inTable('coworking').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable()
           .references('id').inTable('user').onDelete('CASCADE');
      table.text('purpose').nullable();
      table.dateTime('date_start').notNullable();
      table.dateTime('date_end').notNullable();
      table.enu('status', ['pending', 'approved', 'canceled', 'rejected']).defaultTo('pending');
      table.timestamp('date_creation').defaultTo(knex.fn.now());
    });
  }
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('coworking_book');
  await knex.schema.dropTableIfExists('coworking');
};