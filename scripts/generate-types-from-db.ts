import dotenv from "dotenv";
import { knex } from "knex";
import { updateTypes } from "knex-types";

dotenv.config();
const { NODE_ENV } = process.env;

if (!NODE_ENV) throw "No env found";

const knexFile = require("../knexfile.ts")["default"][NODE_ENV];
const db = knex(knexFile);

updateTypes(db, { output: "./src/types/index.ts" }).catch((err: any) => {
  console.error(err);
  process.exit(1);
});
