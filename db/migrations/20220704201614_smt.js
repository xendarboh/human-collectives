/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("smt").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("smt", (table) => {
        table.increments();
        table.string("type");
        table.bigint("key");
        table.string("root");
        table.text("nodes");
        table.unique(["type", "key"]);
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
