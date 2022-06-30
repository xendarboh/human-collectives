/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable("choice2poll").then((exists) => {
    if (!exists) {
      return knex.schema.createTable("choice2poll", (table) => {
        table.bigint("choiceId");
        table.bigint("pollId");
        table.unique(["choiceId", "pollId"]);
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
