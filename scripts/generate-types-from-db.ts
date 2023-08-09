const { knex } = require("knex");
const { updateTypes } = require("knex-types");
//
const db = knex(require("../knexfile"));

updateTypes(db, { output: "./src/types/index.ts" }).catch((err) => {
  console.error(err);
  process.exit(1);
});
