require("dotenv").config();

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

console.log("making call to myself and then 3-way kevin");

// Goal is to have 3 Conferences going that I can switch between as an Agent

client.calls
  .create({
    twiml: `
      <Response>
        <Say>Hey! It's Victor. Can you hear me okay?</Say>
        <Dial>+18328638635</Dial>
      </Response>
    `,
    from: "+12812068992",
    to: "+18326460869",
  })
  .then((call) => console.log(call.sid));

// client.calls
//   .create({
//     twiml: `
//       <Response>
//         <Say>Hey! It's Victor. Can you hear me okay?</Say>
//         <Dial>+18326595548</Dial>
//       </Response>
//     `,
//     to: "+18326460869",
//     from: "+12812068992",
//   })
//   .then((call) => console.log(call.sid));
