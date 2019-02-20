const moment = require('moment');
const { raw } = require('objection');
const { Message } = require('../models/schema');
const { MAIN_HELP_TEXT } = require('../static');

const slashCommands = slackController => {
  slackController.on('slash_command', function (bot, req) {
    console.log('req.command :: ', req.command);
    switch (req.command) {
      case '/ama':
        bot.replyAcknowledge();
        switch (req.text) {
          case 'leaderboard':
            console.log('req.text:: ', req.text);
            leaderboardHandler(bot, req);
            break;
          case 'help':
          default:
            console.log('req.text:: ', req.text);
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
  const learnRes = await Message.query()
    .select('people.username', raw('COUNT(points.person_id)'))
    .from('messages')
    .where('messages.datetime', '>=', oldestValidDate.format())
    .joinRelation('points')
    .join('people', 'points.person_id', 'people.id')
    .where('points.teach', false)
    .groupBy('people.username')
    .orderBy('count');

  const teachRes = await Message.query()
    .select('people.username', raw('COUNT(points.person_id)'))
    .from('messages')
    .where('messages.datetime', '>=', oldestValidDate.format())
    .joinRelation('points')
    .join('people', 'points.person_id', 'people.id')
    .where('points.teach', true)
    .groupBy('people.username')
    .orderBy('count');

  const message = `${getMessageFromRes(learnRes, true)}
  
  ${getMessageFromRes(teachRes, false)}`;

  bot.replyPrivateDelayed(req, message);
};

const getMessageFromRes = (res, learn) => {
  if (res.length < 1) return '';

  const uniqueSortedPoints = [...new Set(res.map(row => row.count))];

  const firstPlace = res.filter(row => row.count === uniqueSortedPoints[0]);
  const secondPlace =
    uniqueSortedPoints.length >= 2 &&
    res.filter(row => row.count === uniqueSortedPoints[1]);
  const thirdPlace =
    uniqueSortedPoints.length >= 3 &&
    res.filter(row => row.count === uniqueSortedPoints[2]);

  let message = `*:tada: Congratulations :tada: to our best ${
    learn ? 'learners' : 'teachers'
  } this week*:

  *${firstPlace[0].username}* ${learn ? 'learned' : 'taught'} *${
  uniqueSortedPoints[0]
}* ${uniqueSortedPoints[0] === '1' ? 'thing' : 'things'}`;

  if (secondPlace) {
    message += `*${secondPlace.map(obj => obj.username).join(',')}* ${
      learn ? 'learned' : 'taught'
    } *${uniqueSortedPoints[1]}* ${
      uniqueSortedPoints[1] === '1' ? 'thing' : 'things'
    }`;
  }
  if (thirdPlace) {
    message += `*${thirdPlace.map(obj => obj.username).join(',')}* ${
      learn ? 'learned' : 'taught'
    } *${uniqueSortedPoints[2]}* ${
      uniqueSortedPoints[2] === '1' ? 'thing' : 'things'
    }`;
  }

  return message;
};

module.exports = slashCommands;
