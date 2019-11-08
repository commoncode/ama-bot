const dotenv = require('dotenv');
const { Botkit } = require('botkit');
const { SlackAdapter } = require('botbuilder-adapter-slack');
const { MemoryStorage } = require('botbuilder');

const storage = new MemoryStorage();

// const botkitStoragePostgres = require('botkit-storage-pg');
// const server = require('./server');
// const userRegistration = require('./components/userRegistration');
// const onBoarding = require('./components/onBoarding');

dotenv.load(); // Doesn't override already set environment variables

if (
  !process.env.SLACK_CLIENT_ID ||
  !process.env.SLACK_CLIENT_SECRET ||
  !process.env.SLACK_CLIENT_SIGNING_SECRET ||
  !process.env.SLACK_TOKEN ||
  !process.env.PORT
) {
  console.error('Empty or unset Environment Variables');
  process.exit(1);
}

const slackOptions = {
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  botToken: process.env.BOT_TOKEN,
  clientId: process.env.SLACK_CLIENT_ID, // oauth client id
  clientSecret: process.env.SLACK_CLIENT_SECRET, // oauth client secret
  scopes: ['bot'], // oauth scopes requested
  redirectUri: process.env.REDIRECT_URI, // url to redirect post login defaults to `https://<mydomain>/install/auth`
  getTokenForTeam: async (teamId) => {
    const team = await storage.read([teamId]);
    if (team && team.bot_access_token) {
      return team.bot_access_token;
    } else {
      console.error('Team not found in tokenCache: ', teamId);
    }
  },
  getBotUserByTeam: async (teamId) => {
    const team = await storage.read([teamId]);
    if (team && team.bot_access_token) {
      return team.bot_access_token;
    } else {
      console.error('Team not found in tokenCache: ', teamId);
    }
  },
};

// Create Slack adapter for multi-team mode
const adapter = new SlackAdapter(slackOptions);

// Create the Botkit controller, which controls all instances of the bot.
const botController = new Botkit({ adapter, storage });

botController.webserver.get('/install', (req, res) => {
  console.log('I AM HERE');
  res.redirect(adapter.getInstallLink());
});

botController.webserver.get('/install/auth', async (req, res) => {
  try {
    const results = await botController.adapter.validateOauthCode(
      req.query.code
    );
    // store these values in a way they'll be retrievable with getBotUserByTeam and getTokenForTeam
    console.log('RESULTS:', results);

    storage.write({
      [results.team_id]: {
        bot_access_token: results.bot.bot_access_token,
        bot_user_id: results.bot.bot_user_id,
      },
    });
    res.send('Success! Bot installed.');
  } catch (err) {
    console.error('OAUTH ERROR:', err);
    res.status(401);
    res.send(err.message);
  }
});

botController.hears('hello', 'message', async (bot, message) => {
  console.log('MESSAGE', message);
});




// userRegistration(botController);
// onBoarding(botController);

// // Load in skills.
// const { hears } = require('./skills/hears');
// hears(botController);
// require('./skills/slashCommands')(botController);
