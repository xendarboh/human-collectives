/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "better-sqlite3",
    connection: {
      filename: "dev.sqlite3",
    },
    useNullAsDefault: true,
  },

  test: {
    client: "better-sqlite3",
    connection: {
      filename: "test.sqlite3",
    },
    useNullAsDefault: true,
  },

  // production: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password",
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: "knex_migrations",
  //   },
  //   useNullAsDefault: true,
  // },
};
