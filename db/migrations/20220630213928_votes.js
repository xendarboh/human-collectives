/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("votes").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("votes", (table) => {
        table.increments();
        table.bigint("userId");
        table.bigint("choiceId");
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
