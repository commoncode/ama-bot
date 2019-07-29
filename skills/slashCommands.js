const { raw } = require('objection');
const { Message } = require('../models/schema');
const { MAIN_HELP_TEXT } = require('../static');

const slashCommands = slackController => {
  slackController.on('slash_command', function (bot, req) {
    switch (req.command) {
      case '/ama':
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
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // select learning points for the last week
  const learnRes = await Message.query()
    .select('people.username', raw('COUNT(points.person_id)'))
    .from('messages')
    .where('messages.datetime', '>=', oneWeekAgo.toISOString())
    .joinRelation('points')
    .join('people', 'points.person_id', 'people.id')
    .where('points.teach', false)
    .groupBy('people.username')
    .orderBy('count');

  const teachRes = await Message.query()
    .select('people.username', raw('COUNT(points.person_id)'))
    .from('messages')
    .where('messages.datetime', '>=', oneWeekAgo.toISOString())
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
  if (res.length < 1) return 'Sorry, no points have been recorded yet.';

  const uniqueSortedPoints = [...new Set(res.map(row => row.count))].sort(
    (a, b) => b - a
  );

  const role = learn ? 'learners' : 'teachers';
  const scores = getScores(res, uniqueSortedPoints);
  const message = scores.reduce((accumulator, score) => {
    accumulator += getIndividualMessage(score, learn);
    return accumulator;
  }, `*:tada: Congratulations :tada: to our best ${role} this week*:\n\n`);

  return message;
};

const getScores = (res, uniqueSortedPoints) => {
  const topThreePoints = uniqueSortedPoints.slice(0, 3);
  const scores = topThreePoints.reduce((accumulator, numPoints) => {
    const people = res.filter(row => row.count === numPoints);
    const usernames = people.map(obj => obj.username).join(', ');
    accumulator.push({ position: accumulator.length, usernames, numPoints });
    return accumulator;
  }, []);

  return scores;
};

const getIndividualMessage = (scoreObject, learn) => {
  const { position, usernames, numPoints } = scoreObject;

  let message = '';
  if (position > 0) {
    message += ', ';
  }

  const activity = learn ? 'learned' : 'taught';
  const things = numPoints > 1 ? 'things' : 'thing';
  message += `*${usernames}* ${activity} *${numPoints}* ${things}`;

  return message;
};

module.exports = slashCommands;
