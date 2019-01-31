const botkit = require('botkit');

const botOptions = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot'],
};

// TODO: config postgres storage.
// botOptions.storage = postgresStorage;

// Store user data in a simple JSON format.
botOptions.json_file_store = '.db_bot/';

const slackController = botkit.slackbot(botOptions);
slackController.startTicking();
module.exports = slackController;
