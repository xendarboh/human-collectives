/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("polls").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("polls", (t) => {
        t.increments();
        t.string("title");
        t.string("body");
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
