const dotenv = require('dotenv');
const botkit = require('botkit');
const botkitStoragePostgres = require('botkit-storage-pg');
const { transaction } = require('objection');
const server = require('./server');
const userRegistration = require('./components/userRegistration');
const onBoarding = require('./components/onBoarding');
const { BotkitTeam } = require('./models/schema');

dotenv.load(); // Doesn't override already set environment variables

if (
  !process.env.SLACK_CLIENT_ID ||
  !process.env.SLACK_CLIENT_SECRET ||
  !process.env.SLACK_CLIENT_SIGNING_SECRET ||
  !process.env.PORT
) {
  console.error('Empty or unset Environment Variables');
  process.exit(1);
}

const botOptions = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['commands', 'bot'],
};

if (
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD
) {
  transaction(BotkitTeam.knex(), async trx => {
    // `botkit-storage-pg` try to insert the same team record when the app is being reinstalled,
    // so need to clear BotkitTeam table before install the app.
    await BotkitTeam.query(trx).delete();

    // Set up custom Postgres storage system to store workspaces, channels and users data.
    botOptions.storage = botkitStoragePostgres({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  });
} else {
  // Store workspaces, channels and users data in a simple JSON format.
  botOptions.json_file_store = '.db_bot/';
}

// Create the Botkit controller, which controls all instances of the bot.
const slackController = botkit.slackbot(botOptions);

slackController.startTicking();

// Set up express server.
server(slackController);

userRegistration(slackController);
onBoarding(slackController);

// Load in skills.
require('./skills/hears')(slackController);
require('./skills/slashCommands')(slackController);
