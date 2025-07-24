// knexfile.js
const path = require('path');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host     : '127.0.0.1',
      user     : 'root',
      password : '',
      database : 'guide'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations'
    },
    // при необходимости добавьте так же seeds:
    // seeds: { directory: path.join(__dirname, 'seeds') }
  },

  staging: {
    client: 'mysql2',
    connection: {
      host     : 'STAGING_HOST',
      user     : 'STAGING_USER',
      password : 'STAGING_PASS',
      database : 'STAGING_DB'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host     : 'PROD_HOST',
      user     : 'PROD_USER',
      password : 'PROD_PASS',
      database : 'PROD_DB'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations'
    }
  }
};
