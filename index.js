const dotenv = require('dotenv');
const server = require('./server');

dotenv.load(); // Doesn't override already set environment variables

if (
  !process.env.SLACK_CLIENT_ID ||
  !process.env.SLACK_CLIENT_SECRET ||
  !process.env.SLACK_CLIENT_SIGNING_SECRET ||
  !process.env.PORT ||
  !process.env.DATABASE_URL
) {
  console.error('Empty or unset Environment Variables');
  process.exit(1);
}

const slackController = require('./bot');
server(slackController);

require('./components/userRegistration');
require('./components/skills');
