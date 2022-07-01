/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("collectives").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("collectives", (table) => {
        table.increments();
        table.string("title");
        table.string("description");
        table.bigint("creator");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
