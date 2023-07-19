"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var twilio_1 = __importDefault(require("../lib/twilio"));
var numbers_1 = __importDefault(require("../config/numbers"));
function sendText(toNumber) {
    twilio_1.default.messages
        .create({
        body: "Hello! This is Ryan. I've been told that you're interested in some mortgage protection or final expense insurance. Is that correct?",
        to: toNumber,
        from: numbers_1.default.barker,
    })
        .then(function (message) { return console.log(message.sid); });
}
exports.default = sendText;
// WORKS!
// client.calls
// .create({
//   url: "http://demo.twilio.com/docs/voice.xml",
//   to: "+18326460869",
//   // from: "+12813178765",
//   from: "+12812068992",
// })
// .then((call) => console.log(call.sid));
//# sourceMappingURL=contact-leads.js.map