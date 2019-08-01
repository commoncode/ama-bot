# Ama bot

## Getting started

Clone this repository using Git:

```bash
$ git clone git@github.com:commoncode/ama-bot.git
```

Install dependencies:

```bash
$ npm install
```

## Local development

### Ngrok setup

To install ngrok, you can use most os packages managers or use `npm`:

```bash
$ npm install ngrok -g
```

_**Recommended:** Sign up for a free plan [here](https://dashboard.ngrok.com/user/signup) so that sessions don't expire every 8 hours. Follow the ngrok documents to add the authtoken to your local environment._

Expose local server to public internet:

```bash
$ ngrok http 3000
```

If all goes well you should see `Session Status` is `online`, and two `Forwarding` URLs (one http and the other https).

Copy down the HTTPS address given (something similar to `https://9a9e60e1.ngrok.io`).

On Linux systems `npm` can sometimes fail to install `ngrok` properly. If this is the case, either install it through the software package manager, or install it using the following commands:

```bash
$ yarn global add ngrok
$ sudo unzip ~/.ngrok/*.zip -d /usr/local/bin/
$ rm -r ~/.ngrok
```

There is an [open ticket](https://commoncode.atlassian.net/browse/CCP-179) to look into this.

### Slack App setup

Get yourself added to the list of collaborators on the AMA bot app. You will need to get one of the existing collaborators to help you with this.

Copy the example.env file and rename it `.env`. Set the following variables:

```bash
SLACK_CLIENT_ID=xxxx
SLACK_CLIENT_SECRET=xxxx
SLACK_CLIENT_SIGNING_SECRET=xxxx
PORT=3000
```

In a new terminal go to the root directory of the project and run:

```bash
$ npm run dev
```

This should run normally and show:

```bash
Bot is listening on port 3000
```

Create a [new app](https://api.slack.com/apps?new_app=1). If unsure of what fields to fill in, copy the [AMA settings](https://api.slack.com/apps/AF5F0BXA4), but replace `https://cc-ama-bot-dev.herokuapp.com` with the address you just copied from `ngrok`.

Work your way through all the tabs on the left under the **Features** tab header, except for `Install App`. Also, in the `OAuth Tokens & Redirect URLs` tab, do not click on `Install App to Workspace`. If still unsure, take a look at one of the [other test bots](https://api.slack.com/apps/AKX14UWDR) (you'll need to be added as a collaborator to get access to this bot).

**Note:** If you ever restart ngrok, you will need to re-add the new address everywhere in your bot's online settings. This will be the case every time you, for example, restart you laptop.

**Note:** the slash command in the `Slash Commands` tab has to be exactly `/ama`, as this is currently a hardcoded value.

In your .env file, fill out the following fields, leaving all others blank for now. `xxxx` value should be replaced with the corresponding info from the `Basic Information` tab of your app's page:

```bash
SLACK_CLIENT_ID=xxxx
SLACK_CLIENT_SECRET=xxxx
SLACK_CLIENT_SIGNING_SECRET=xxxx
```

Now restart your server (_NOT_ the `ngrok` service). You should again see the output of:

```bash
Bot is listening on port 3000
```

## Database

This project uses

- [postgresql](https://www.postgresql.org/docs/10/app-psql.html)
- [knex.j](https://knexjs.org/) (js SQL query builder)
- [objection.js](http://vincit.github.io/objection.js/) (ORM)

The production database is hosted and managed by heroku as an 'addon'. It is currently using Postgres 10.6.

For local development make sure that Postgres is installed on your machine, then create a database called `ama_test`:

```bash
$ sudo -i -u postgres
$ psql
$ CREATE DATABASE ama_test;
```

Create a user with the priviledge to write in the database, and then make that user a superuser (replace all values between <> with desired username and password):

```
$ CREATE USER <username> WITH ENCRYPTED PASSWORD '<password>';
$ GRANT ALL PRIVILEGES ON DATABASE ama_test TO <username>;
$ ALTER USER <username> WITH SUPERUSER;
```

Add the database url to your `.env` file:

```
DATABASE_URL=postgres://<username>:<password>@localhost:5432/ama_test
```

### Running Migrations

To create a new migration, run `knex migrate:make create_MYTABLE` from the root of the project. Knex will create a new timestamped js file in the migrations folder where you can complete the `exports.up` functions. Note that the migrations are not automatically generated from the schema; you will still need to create them by hand.

To run migrations you'll need to set a number of variables in the `.env` file. These correspond directly to sections of the `DATABASE_URL` variable. Fill in the following variables in your `.env` file, replacing the values in <> with the same values used in the previous section:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=<username>
DB_NAME=ama_test
DB_PASSWORD=<password>
```

There is an [open ticket](https://commoncode.atlassian.net/browse/CCP-180) to look into if this can be simplified.

Run `knex migrate:latest` from the terminal to run all migrations that haven't yet been run.

**Note:** If you get an error saying that `knex` is not a recognised command, you may need to run the following before trying the migrate command again:

```bash
$ sudo npm install -g knex
```

There is an [open ticket](https://commoncode.atlassian.net/browse/CCP-179) to look into this.

As defined in the Heroku Procfile, all latest migrations should be run before each release. Notably the deploy process on heroku does not run a rollback so for each schema change a new migration needs to be made.

### Add your bot to workspace

This project uses [Botkit](https://botkit.ai/docs/readme-slack.html) to connect server to Slack bot, go to `{ngrok-url}/login` (where `{ngrok-url}` is the URL copied from the `ngrok` server in the `Slack App setup` section of this document), and click the **Authorize** button. This will connect the bot to the Slack channel, although the web page will be left to hang (there is an [open ticket](https://commoncode.atlassian.net/browse/CCP-178) to look into this). However, you _should_ get a couple of Slack messages telling you that your new bot has now joined the Slack channel. This process authorizes the bot server and stores workspace information on the server.

Create a channel for testing your bot (or join an existing channel), and invite the bot to the channel. If you type `@bot-name hello`, it should reply with a help text on how to use the bot.

# Infrastructure

## Deployment

AMA-bot Heroku PAAS to host and resource the application. Its run under a Pipeline:

https://dashboard.heroku.com/pipelines/e878c65d-db2d-4e7d-8640-0b3a0b3b4109

Which if needed anyone can be added as a contributor to gain access to deploy branches to develop and test on.

Currently the application only has one distribution step operational called 'staging'. This runs the server application as a Heroku 'dyno' using the `Procfile` in the projects root to define behavior. This application is located at:

https://cc-ama-bot-dev.herokuapp.com/

This is the domain needed to be configured in the Event Subscription of the Slack App Configuration.

This `staging` pipeline step automatically deploys the `develop` branch of the repo from github and can manually be triggered to deploy any branch by a contributor at the bottom of the applications deploy menu on Heroku.

The `staging` application also has a postgres database 'addon' which can be accessed by the `dyno` process using the environment variable `DATABASE_URL`.

NOTE: As per [CCP-178](https://commoncode.atlassian.net/browse/CCP-178) an error message will be shown when the app has been auhenticated, but this does not stop it from being deployed.

### Manual Authentication

Currently due to storing the authentication credentials in ephemeral storage each time the app is deployed it needs to be re-authenticated by a slack user logging in here:

https://cc-ama-bot-dev.herokuapp.com/login

This is to be fixed by: [CCP-142](https://commoncode.atlassian.net/browse/CCP-142)

## CircleCI

CircleCI is setup to install application dependencies run tests and linting. It's setup through the Common Code organisation on Github and is configured in the normal location:

.circleci/config.yml
