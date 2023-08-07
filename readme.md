# L34ds

This is a project

## Notes

- Kept getting errors about my numbers not belonging to me, but this was BS. It was simply due to the fact that I was using the Test SID and Test Auth Token...
- I got (2) text messages when scheduling via a Messaging Service SID -- there were (2) phone numbers inside of this Sender Pool and I believe this is what caused it. I removed one of the phone numbers and I'm expecting that I should only get 1 SMS now. Will validate this later.
- Twilio `twiml.dial` allowsfor `dial.client` and `dial.number` (different TwiML nouns) for different use cases
- Database timeouts at the API layer (when testing locally) usually mean that you're connected to a WIFI network that does not allow the connection to be established securely and is blocking it -- using my phone's WIFI network fixes the problem
