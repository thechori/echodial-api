"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var knex = require("knex");
dotenv.config();
var pg = knex({
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
exports.default = pg;
//# sourceMappingURL=index.js.map