const dotenv = require("dotenv");
const knex = require("knex");

dotenv.config();

const pg = knex({
  client: "pg",
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
});

export default pg;
