import type { Knex } from "knex";

const knexfile = require("../db/knexfile");

// prefix database file path to support single knex db config file
Object.keys(knexfile).forEach((env) => {
  if (knexfile[env].connection.filename)
    knexfile[env].connection.filename =
      "db/" + knexfile[env].connection.filename;
});

const db: Knex = require("knex")(knexfile[process.env.NODE_ENV]);

export interface QueryOptions {
  validate: boolean; // validate input data for errors
}

export const defaultQueryOptions: QueryOptions = {
  validate: true,
};

export { db };
