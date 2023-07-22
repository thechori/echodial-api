require("dotenv").config();

const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log("starting conference call...");

// A `Conference` inits when a phone call is made to it
// When it is init'd, the first person is placed on hold (and hears a song)
// The `Conference` begins when the second person joins

// client.calls
//   .create({
//     twiml: `
//       <Response>
//         <Say>Welcome to the party!</Say>
//         <Conference>My test conference</Conference>
//         <Dial>+18326595548</Dial>
//       </Response>
//     `,
//     to: "+18326460869",
//     from: "+12812068992",
//   })
//   .then((call) => console.log(call.sid));

client
  .conferences("ryansfirsttestconference1")
  .participants.create({
    label: "customer",
    earlyMedia: true,
    beep: "onEnter",
    statusCallback: "https://myapp.com/events",
    statusCallbackEvent: ["ringing"],
    record: true,
    from: "+12812068992",
    to: "+18326460869",
  })
  .then((participant) => console.log(participant.callSid));
