/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("users").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("users", (t) => {
        t.increments();
        t.string("bioid");
        t.timestamps();
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
