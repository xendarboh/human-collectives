/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("members").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("members", (table) => {
        table.bigint("userId");
        table.bigint("collectiveId");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.unique(["userId", "collectiveId"]);
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
