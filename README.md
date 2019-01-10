# Ama bot

## Getting started

Clone this repository using Git:

```bash
git clone git@github.com:commoncode/ama-bot.git
```

Install dependencies:

```bash
npm install
npm run dev
```

Add `.env` file in the project root directory.

Launch the server by typing:

```bash
npm run dev
```

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