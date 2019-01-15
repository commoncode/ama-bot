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

Install ngrok globally:

```bash
npm install ngrok -g
```

Expose local server to public internet:

```bash
ngrok http 3000
```

If all goes well you should see `Tunnel States` is `online`, and Forwarding url.

### Slack App setup

Go to https://api.slack.com/apps?new_app=1 and create a new app.

Copy Client ID, Client Secret and Signing Secret into `.env` at the root directory:

```
SLACK_CLIENT_ID=xxxxxxx
SLACK_CLIENT_SECRET=xxxxxxx
SLACK_CLIENT_SIGNING_SECRET=xxxxxxx
```

Click on the "Bot Users" tab, and click "Add a Bot User" button, specify a name for your bot, 
and enable the option for "Always Show My Bot as Online", then click save.

Click on the "OAuth & Permissions" tab in your Slack's app setting page, and under "Redirect URLs", add https://{ngrok-url}/oauth, then click save.

Click on the "Interactive Components" tab, under "Request URL", add https://{ngrok-url}/slack/receive, then click save.

Click on the "Event Subscriptions" tab, and switch on "Enable Events", under "Request URL", add https://{ngrok-url}/slack/receive. 
Once finish typing, Slack will verify that this endpoint is properly configured, you must have your localhost running and exposed to public internet to make this work.

Once verified, click "Add Bot User Event", and use the dropdown to search and select following events:

- `message.channels`
- `message.groups`
- `message.im`
- `message.mpim`

### Add your bot to workspace

This project uses [Botkit](https://botkit.ai/docs/readme-slack.html) to connect server to Slack bot, 
go to http://{ngrok-url}/login, and click **Authorize** button, then server will be connected to slack 
if there is no error message in console, this process authorizes the server and stores workspace information on server.

You only need to run this process for first time set up or deploy this project, or if local storage is removed 
(e.g. `.db_bot` on root directory is deleted).

Create a channel for testing your bot, and invite the bot to the channel.

Type "@bot-name hello", it should reply "Hello world".

## Infrastructure

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

The `staging` application also has a postgres database 'add on' which can be accessed by the `dyno` process using the 
environment variable `DATABASE_URL`. It is currently using Postgres 10.6.

## Database

This project uses 

- [postgresql](https://www.postgresql.org/docs/10/app-psql.html)
- [knex.j](https://knexjs.org/) (js SQL query builder)
- [objection.js](http://vincit.github.io/objection.js/) (ORM)

### Running Migrations

To create a new migration, run `knex migration:make create_MYTABLE` from the root of the project. Knex will create a new timestamped js file in the migrations folder where you can complete the `exports.up` functions.

Run `knex migrate:latest` from the terminal to run all migrations that haven't yet been run. 

As defined in the Heroku Procfile, all latest migrations should be run before each release. 

## CircleCI

CircleCI is setup to install application dependencies run tests and linting.
It's setup through the Common Code organisation on Github and is configured in the 
normal location:

.circleci/config.yml

