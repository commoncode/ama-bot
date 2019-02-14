const moment = require('moment');
const { raw } = require('objection');
const { Message, Person } = require('../models/schema');
const { MAIN_HELP_TEXT } = require('../static');

const slashCommands = slackController => {
  slackController.on('slash_command', function (bot, req) {
    switch (req.command) {
      case '/ama-phoebe':
        bot.replyAcknowledge();
        switch (req.text) {
          case 'leaderboard':
            leaderboardHandler(bot, req);
            break;
          case 'help':
          default:
            bot.whisper(req, MAIN_HELP_TEXT);
            break;
        }
        break;
      default:
        bot.replyAcknowledge();
    }
  });
};

const leaderboardHandler = async (bot, req) => {
  const oldestValidDate = moment().subtract(7, 'days');

  // select learning points for the last week
  const res = await Message.query()
    .select('people.username', raw('COUNT(points.person_id)'))
    .from('messages')
    .where('messages.datetime', '>=', oldestValidDate.format())
    .joinRelation('points')
    .join('people', 'points.person_id', 'people.id')
    .where('points.teach', false)
    .groupBy('people.username')
    .orderBy('count');

  const uniqueSortedPoints = [...new Set(res.map(row => row.count))];

  const firstPlace = res.filter(row => row.count === uniqueSortedPoints[0]);
  const secondPlace =
    uniqueSortedPoints.length >= 2 &&
    res.filter(row => row.count === uniqueSortedPoints[1]);
  const thirdPlace =
    uniqueSortedPoints.length >= 3 &&
    res.filter(row => row.count === uniqueSortedPoints[2]);

  let message = `*:tada: Congratulations :tada: to our best learners this week*:

  *${firstPlace[0].username}* learned *${uniqueSortedPoints[0]}* things`;

  if (secondPlace) {
    message += `*${secondPlace.map(obj => obj.username).join(',')}* learned *${
      uniqueSortedPoints[1]
    }* things`;
  }
  if (thirdPlace) {
    message += `*${thirdPlace.map(obj => obj.username).join(',')}* learned *${
      uniqueSortedPoints[2]
    }* things`;
  }

  bot.replyPrivateDelayed(req, message);
};

module.exports = slashCommands;
