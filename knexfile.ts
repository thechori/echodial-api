import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    seeds: {
      directory: "./seeds",
    },
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || ""),
      database: process.env.DB_DATABASE,
      ssl: {
        ca: process.env.DB_CA_CERT,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "pg",
    seeds: {
      directory: "./seeds",
    },
    connection: {
      user: process.env.KNEX_PROD_DB_USER,
      password: process.env.KNEX_PROD_DB_PASSWORD,
      host: process.env.KNEX_PROD_DB_HOST,
      port: parseInt(process.env.KNEX_PROD_DB_PORT || ""),
      database: process.env.KNEX_PROD_DB_DATABASE,
      ssl: {
        ca: process.env.DB_CA_CERT,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

export default config;
