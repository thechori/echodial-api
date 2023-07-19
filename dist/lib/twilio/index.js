"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var accountSid = process.env.TWILIO_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
var client = require("twilio")(accountSid, authToken);
exports.default = client;
//# sourceMappingURL=index.js.map