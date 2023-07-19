"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var VoiceResponse = require("twilio").twiml.VoiceResponse;
//
var db = require("./lib/db");
var extractErrorMessage = require("./lib/error").extractErrorMessage;
var client = require("./lib/twilio");
var numbers = require("./config/numbers");
var app = express();
var port = 3001;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.get("/", function (req, res) {
    res.send("l34ds");
});
// v0
app.get("/authorize", function (req, res) {
    var authorization = req.headers.authorization;
    if (authorization === process.env.ADMIN_PASSWORD) {
        return res.status(200).send("Success");
    }
    return res.status(401).send("Incorrect password");
});
app.get("/lead", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leads;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db("development.lead")];
            case 1:
                leads = _a.sent();
                res.status(200).send(leads);
                return [2 /*return*/];
        }
    });
}); });
app.get("/lead/pretty", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var leads;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db("development.lead")
                    .join("development.person", "person_id", "person.id")
                    .join("development.campaign", "campaign_id", "campaign.id")
                    .select("development.lead.id", "development.lead.created_at", "development.lead.body as message", "development.person.phone as person_phone", "development.campaign.name as campaign_name")];
            case 1:
                leads = _a.sent();
                res.status(200).send(leads);
                return [2 /*return*/];
        }
    });
}); });
app.get("/person", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var persons, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db("development.person")];
            case 1:
                persons = _a.sent();
                return [2 /*return*/, res.status(200).send(persons)];
            case 2:
                e_1 = _a.sent();
                return [2 /*return*/, res.status(500).send(extractErrorMessage(e_1))];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/campaign", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var campaigns, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db("development.campaign")];
            case 1:
                campaigns = _a.sent();
                return [2 /*return*/, res.status(200).send(campaigns)];
            case 2:
                e_2 = _a.sent();
                return [2 /*return*/, res.status(500).send(extractErrorMessage(e_2))];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/campaign/pretty", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var campaigns, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db("development.campaign as c")
                        .join("development.twilio_phone_number as tpn", "twilio_phone_number_id", "tpn.id")
                        .select("c.id as id", "c.name", "c.description", "c.notes", "tpn.number", "tpn.friendly_name")];
            case 1:
                campaigns = _a.sent();
                return [2 /*return*/, res.status(200).send(campaigns)];
            case 2:
                e_3 = _a.sent();
                return [2 /*return*/, res.status(500).send(extractErrorMessage(e_3))];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/listing", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var listings, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db("development.listing")];
            case 1:
                listings = _a.sent();
                return [2 /*return*/, res.status(200).send(listings)];
            case 2:
                e_4 = _a.sent();
                return [2 /*return*/, res.status(500).send(extractErrorMessage(e_4))];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/listing/pretty", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var listings, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db("development.listing as l")
                        .join("development.campaign as c", "campaign_id", "c.id")
                        .select("l.id as id", "l.name", "l.description", "l.url", "c.name as campaign_name")];
            case 1:
                listings = _a.sent();
                return [2 /*return*/, res.status(200).send(listings)];
            case 2:
                e_5 = _a.sent();
                return [2 /*return*/, res.status(500).send(extractErrorMessage(e_5))];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/campaign/:campaign_id/lead/voice", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var campaign_id, _a, From, FromCity, FromState, FromZip, person, personId, newPerson, response, e_6, response;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                campaign_id = req.params.campaign_id;
                _a = req.body, From = _a.From, FromCity = _a.FromCity, FromState = _a.FromState, FromZip = _a.FromZip;
                console.log("req.body", req.body);
                console.log("req.params", req.params);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                return [4 /*yield*/, db("development.person")
                        .where({
                        phone: From,
                    })
                        .first()];
            case 2:
                person = _b.sent();
                personId = void 0;
                if (!!person) return [3 /*break*/, 4];
                return [4 /*yield*/, db("development.person")
                        .insert({
                        phone: From,
                        city: FromCity,
                        state: FromState,
                        zip: FromZip,
                    })
                        .returning("id")
                        .into("development.person")];
            case 3:
                newPerson = _b.sent();
                personId = newPerson[0].id;
                return [3 /*break*/, 5];
            case 4:
                personId = person.id;
                _b.label = 5;
            case 5: return [4 /*yield*/, db("development.lead").insert({
                    person_id: personId,
                    campaign_id: campaign_id,
                    body: null,
                })];
            case 6:
                _b.sent();
                response = new VoiceResponse();
                response.hangup();
                return [2 /*return*/, res.status(200).send(response.toString())];
            case 7:
                e_6 = _b.sent();
                response = new VoiceResponse();
                response.hangup();
                res.status(500).send(extractErrorMessage(e_6));
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// 1 = Mid-life crisis
// 2 = Soon-to-be parents
// 3 = Soon-to-be homeowners
app.post("/campaign/:campaign_id/lead", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var campaign_id, _a, Body, From, FromCity, FromState, FromZip, person, personId, newPerson, newLead, e_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                campaign_id = req.params.campaign_id;
                _a = req.body, Body = _a.Body, From = _a.From, FromCity = _a.FromCity, FromState = _a.FromState, FromZip = _a.FromZip;
                console.log("req.body", req.body);
                console.log("req.params", req.params);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                return [4 /*yield*/, db("development.person")
                        .where({
                        phone: From,
                    })
                        .first()];
            case 2:
                person = _b.sent();
                personId = void 0;
                if (!!person) return [3 /*break*/, 4];
                return [4 /*yield*/, db("development.person")
                        .insert({
                        phone: From,
                        city: FromCity,
                        state: FromState,
                        zip: FromZip,
                    })
                        .returning("id")
                        .into("development.person")];
            case 3:
                newPerson = _b.sent();
                personId = newPerson[0].id;
                return [3 /*break*/, 5];
            case 4:
                personId = person.id;
                _b.label = 5;
            case 5: return [4 /*yield*/, db("development.lead").insert({
                    person_id: personId,
                    campaign_id: campaign_id,
                    body: Body,
                })];
            case 6:
                newLead = _b.sent();
                return [2 /*return*/, res.status(200).send(newLead)];
            case 7:
                e_7 = _b.sent();
                res.status(500).send(extractErrorMessage(e_7));
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// HOT LEADS
app.post("/insurednow.app", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var campaign_id, _a, phone, email, firstName, lastName, dob, favoriteColor, person, personId, newPerson, newLead, e_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                campaign_id = 5;
                _a = req.body, phone = _a.phone, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, dob = _a.dob, favoriteColor = _a.favoriteColor;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                return [4 /*yield*/, db("development.person")
                        .where({
                        phone: phone,
                    })
                        .first()];
            case 2:
                person = _b.sent();
                personId = void 0;
                if (!!person) return [3 /*break*/, 4];
                return [4 /*yield*/, db("development.person")
                        .insert({
                        phone: phone,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        date_of_birth: dob,
                        favorite_color: favoriteColor,
                    })
                        .returning("id")
                        .into("development.person")];
            case 3:
                newPerson = _b.sent();
                personId = newPerson[0].id;
                return [3 /*break*/, 5];
            case 4:
                personId = person.id;
                _b.label = 5;
            case 5: return [4 /*yield*/, db("development.lead").insert({
                    person_id: personId,
                    campaign_id: campaign_id,
                    body: "(insurednow.app submission)",
                })];
            case 6:
                newLead = _b.sent();
                // Send text message
                client.messages
                    .create({
                    body: "Hello! This is Ryan with Insured Now. Thank you so much for inquiring about our modern insurance options. One of our specialists will be in touch with you shortly. Have a great day! 😊",
                    to: phone,
                    from: numbers.barker,
                })
                    .then(function (message) { return console.log(message.sid); });
                return [2 /*return*/, res.status(200).send(newLead)];
            case 7:
                e_8 = _b.sent();
                res.status(500).send(extractErrorMessage(e_8));
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("L34ds on port ".concat(port));
});
//# sourceMappingURL=index.js.map