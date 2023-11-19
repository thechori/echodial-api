# EchoDial API

Node.js Express backend for the EchoDial product

## Requirements

- Node.js v20.5.0+
- npm v9.8.0+
- ngrok v3.3.1+

## Getting Started

1. Create the `.env` file at the root, obtain contents from [Ryan Teodoro](ryan@echodial.com)
1. Install dependencies (`npm install`)
1. Install husky to support pre-commit hooks (`./node_modules/.bin/husky install`)
1. Run app (`npm run dev`)
1. Visit at `http://localhost:3001` (unless you've changed the `PORT` variable in the `.env` file)

## Development

All features and bugs should live within git branches and pushed to the remote origin. Once these changes are ready for review, a PR (Pull Request) should be opened and reviewed by an admin. Once this code is reviewed and approved, it can be merged into `main` and tested in production.

## Deployment

This deployment is managed by DigitalOcean Apps. When code is merged into the `main` branch, the CI/CD pipeline will handle the building of the application and deployment to the site.

_TODO: Update docs once multiple environments are setup_

## Important

- When testing the dialer locally, you must use `ngrok` (see [website here](https://ngrok.com/)) to proxy requests from the Twilio Webhook to your localhost

  - See instructions [here](https://echodial.com) for details on how to do this
    - _TODO: Create doc for this_

- Database migrations are used to update the Postgres schema via knex. When these are completed, be sure to also run the npm script (`npm run generate-types:dev`) in order to properly update the generates types within the app (output will be at `src/types/index.ts`)

## Notes

- Kept getting errors about my numbers not belonging to me, but this was BS. It was simply due to the fact that I was using the Test SID and Test Auth Token (needed to be using the live SID and live Auth Token)
- I got (2) text messages when scheduling via a Messaging Service SID -- there were (2) phone numbers inside of this Sender Pool and I believe this is what caused it
- Twilio `twiml.dial` allows for `dial.client` and `dial.number` (different TwiML nouns) for different use cases
- Database timeouts at the API layer (when testing locally) usually mean that you're connected to a WIFI network that does not allow the connection to be established securely and is blocking it -- using my phone's WIFI network fixes the problem
- To create a new migration file: `knex migrate:make {name}`
- To run migrations (to latest): `knex migrate:latest --env [ENV]`
- We must drop foreign keys before we alter them -- this was the case in the migration for updating the `.onDelete` action for the different columns. Simply altering the columns resulted in an error, but running `table.dropForeign("user_id")` first allowed this action to continue
- Found out knex does not actually support the timestamps functionality for `updated_at` ... so we have to do this manually. See `src/routes/leads.ts` within the PUT handler
- Pre-commit hooks sometimes fail -- this seems to happen when prettier runs and finds more changes and they need to be added to the staging area. If this step fails, simply run `git add .` and then run the commit again, and it should work
- `NODE_ENV` is currently set to `DEV` in Digital Ocean because the `tsc` package was not installed in the `devDependencies` -- will fix this later by moving `tsc` into `dependencies` and changing the env to `production`
