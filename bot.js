const dotenv = require('dotenv');
const botkit = require('botkit');
const server = require('./server');
const userRegistration = require('./components/userRegistration');
const onBoarding = require('./components/onBoarding');

dotenv.load();

if (
  !process.env.SLACK_CLIENT_ID ||
  !process.env.SLACK_CLIENT_SECRET ||
  !process.env.SLACK_CLIENT_SIGNING_SECRET ||
  !process.env.PORT
) {
  process.exit(1);
}

const botOptions = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot'],
};

if (process.env.DB_URL) {
  // TODO: config postgres storage.
  // botOptions.storage = postgresStorage;
} else {
  // Store user data in a simple JSON format.
  botOptions.json_file_store = '.db_bot/';
}

// Create the Botkit controller, which controls all instances of the bot.
const slackController = botkit.slackbot(botOptions);

slackController.startTicking();

// Set up express server.
server(slackController);

// Set up bot components.
userRegistration(slackController);
onBoarding(slackController);

// Load in skills.
const normalizedPath = require('path').join(__dirname, '/skills');
require('fs').readdirSync(normalizedPath).forEach(file => {
  require('./skills/' + file)(slackController);
});
