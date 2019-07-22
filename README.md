# Ama bot

## Getting started

Clone this repository using Git:

```bash
git clone git@github.com:commoncode/ama-bot.git
```

Install dependencies:

```bash
npm install
```

Add `.env` file in the project root directory.

Launch the server by typing:

```bash
npm run dev
```

## Local development

### Ngrok setup

Install ngrok, you can do that using most os packages managers or through npm:

```bash
npm install ngrok -g
```

_**Recommended:** Sign up for a free plan [here](https://dashboard.ngrok.com/user/signup) so that sessions don't expire every 8 hours. Follow the ngrok documents to add the authtoken to your local environment._

Expose local server to public internet:

```bash
ngrok http 3000
```

If all goes well you should see `Tunnel States` is `online`, and Forwarding url.

### Slack App setup

Create a [new app](https://api.slack.com/apps?new_app=1).

In your workspace create a `.env` file to use to set environment variables locally:

```
SLACK_CLIENT_ID=xxxxxxx
SLACK_CLIENT_SECRET=xxxxxxx
SLACK_CLIENT_SIGNING_SECRET=xxxxxxx
PORT=XXXX
DB_HOST=xxxx
DB_PORT=xxxx
DB_USER=xxxx
DB_NAME=xxxx
DB_PASSWORD=xxxx
```

An example file is given in `./example.env`. values for the variables can be found
on the main slack app management page.

Click on the "Bot Users" tab, and click "Add a Bot User" button, specify a name for
your bot, and enable the option for "Always Show My Bot as Online", then click save.

Click on the "OAuth & Permissions" tab in your Slack's app setting page, and under
"Redirect URLs", add `https://{ngrok-url}/oauth`, then click save.

In the same tab, under the "Scopes" header, select the following permissions, and
click save:

- chat:write:bot
- im:history
- bot
- commands

Click on the "Interactive Components" tab, under "Request URL",
add `https://{ngrok-url}/slack/receive`, then click save.

Click on the "Event Subscriptions" tab, and switch on "Enable Events",
under "Request URL", add `https://{ngrok-url}/slack/receive`. Once finish typing,
Slack will verify that this endpoint is properly configured, therefore you must have your localhost running and exposed to public internet to make this work, and have npm running as well.

Once verified, click "Add Bot User Event", and use the dropdown to search and select following events, then click save:

- `message.channels`
- `message.groups`
- `message.im`
- `message.mpim`

### Add slash command to Slack App

Click on "Slash Commands" tab, and click on "Create New Command" button,
add "/ama" under "Command", and add `https://{ngrok-url}/slack/receive` under "Request URL" and save.

Add `help` and `leaderboard` in the usage hint field as optional parameters to be passed in.

Note: the command has to be exactly "/ama", as this is currently a hardcoded value.

### Add your bot to workspace

This project uses [Botkit](https://botkit.ai/docs/readme-slack.html) to connect server to Slack bot,
go to `http://{ngrok-url}/login`, and click **Authorize** button, then server will be connected to slack
if there is no error message in console, this process authorizes the server and stores workspace information on server.

You only need to run this process for first time set up or deploy this project, or if local storage is removed
(e.g. `.db_bot` on root directory is deleted).

Create a channel for testing your bot, and invite the bot to the channel.

Type `@bot-name hello`, it should reply with a help text on how to use the bot.

# Infrastructure

## Deployment

AMA-bot Heroku PAAS to host and resource the application. Its run under a Pipeline:

https://dashboard.heroku.com/pipelines/e878c65d-db2d-4e7d-8640-0b3a0b3b4109

Which if needed anyone can be added as a contributor to gain access to deploy branches to develop and test on.

Currently the application only has one distribution step operational called 'staging'. This runs the server
application as a Heroku 'dyno' using the `Procfile` in the projects root to define behavior. This application is
located at:

https://cc-ama-bot-dev.herokuapp.com/

This is the domain needed to be configured in the Event Subscription of the Slack App Configuration.

This `staging` pipeline step automatically deploys the `develop` branch of the repo from github and can manually
be triggered to deploy any branch by a contributor at the bottom of the applications deploy menu on Heroku.

The `staging` application also has a postgres database 'addon' which can be accessed by the `dyno` process using the
environment variable `DATABASE_URL`.

NOTE: As per [CCP-178](https://commoncode.atlassian.net/browse/CCP-178) an error message will be shown when the app has been auhenticated, but this does not stop it from being deployed.

### Manual Authentication

Currently due to storing the authentication credentials in ephemeral storage each time the app is deployed it needs
to be re-authenticated by a slack user logging in here:

https://cc-ama-bot-dev.herokuapp.com/login

This is to be fixed by: [CCP-142](https://commoncode.atlassian.net/browse/CCP-142)

## Database

This project uses

- [postgresql](https://www.postgresql.org/docs/10/app-psql.html)
- [knex.j](https://knexjs.org/) (js SQL query builder)
- [objection.js](http://vincit.github.io/objection.js/) (ORM)

The production database is hosted and managed by heroku as an 'addon'. It is currently using Postgres 10.6.

For local development create a database `ama_test`. 
Create a user with the priviledge to write in the database, and then make that user a
superuser (replace all values between <> with desired username and password):

```
CREATE USER <username> WITH ENCRYPTED PASSWORD '<password>';
GRANT ALL PRIVILEGES ON DATABASE ama_test TO <username>;
ALTER USER <username> WITH SUPERUSER;
```

Add the database url to your `.env` file:

```
DATABASE_URL=postgres://<username>:<password>@localhost:5432/ama_test
```

### Running Migrations

To create a new migration, run `knex migrate:make create_MYTABLE` from the root of the project. 
Knex will create a new timestamped js file in the migrations folder where you can complete the `exports.up` functions.

Run `knex migrate:latest` from the terminal to run all migrations that haven't yet been run.

As defined in the Heroku Procfile, all latest migrations should be run before each release. Notably the deploy
process on heroku does not run a rollback so for each schema change a new migration needs to be made.

## CircleCI

CircleCI is setup to install application dependencies run tests and linting.
It's setup through the Common Code organisation on Github and is configured in the
normal location:

.circleci/config.yml
