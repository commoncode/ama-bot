const { transaction } = require('objection');
const { Skill, Message, Point } = require('../models/schema');
const personService = require('../lib/personService');
const genAsyncBot = require('../lib/asyncBot');
const { extractMentionedPeople } = require('../lib/message');

const LEARNING_KEY = ':tanabata_tree:';


const extractSkills = (messageString) => {
  const skillPattern = /_[^@_]+_/g;
  const matches = messageString.match(skillPattern);

  if (matches == null) {
    return [];
  }

  let skills = [];

  matches.forEach(match => {
    let skill = match.replace(/_/g, '').trim();
    skills.push(skill);
  });

  return skills;
};

const leaderBoardHandler = (bot, message) => {
};

const handler = async (bot, message) => {
  const asyncBot = genAsyncBot(bot);

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  const skills = extractSkills(messageContent);

  const teachers = extractMentionedPeople(messageContent);

  const learnerSlackId = message.user;
  const { user: learnerInfoSlack } = await asyncBot.api.users.info({ user: learnerSlackId });
  const { name: learnerName } = learnerInfoSlack;

  if (skills.length && learnerName && teachers.length) {
    try {
      await transaction(Point.knex(), async trx => {
        const messageRecord = await Message.query(trx).insertAndFetch({
          text: message.event.text,
          datetime: new Date().toISOString(),
        });

        const learnerRecord = await personService.findOrInsertPerson(learnerSlackId, learnerName, trx);

        const teachersRecords = [];
        for (const teacher of teachers) {

          const { user: teacherInfoSlack } = await asyncBot.api.users.info({ user: teacher });
          const { name: teacherName } = teacherInfoSlack;

          teachersRecords.push(await personService.findOrInsertPerson(teacher, teacherName, trx));
        };

        for (const skill of skills) {
          let skillRecord = await Skill.query(trx).findOne({ name: skill });
          if (!skillRecord) {
            skillRecord = await Skill.query(trx).insertAndFetch({ name: skill });
            bot.reply(message, `${skill} was added as a new skill!`);
          }

          const basePoint = {
            message_id: messageRecord.id,
            skill_id: skillRecord.id,
          };

          // Insert learning point.
          await Point.query(trx).insert({
            ...basePoint,
            teach: false,
            person_id: learnerRecord.id,
          });

          // Insert teaching points.
          for (const teacherRecord of teachersRecords) {
            await Point.query(trx).insert({
              ...basePoint,
              teach: true,
              person_id: teacherRecord.id,
            });
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
};


const hears = slackController => {
  slackController.hears(LEARNING_KEY, ['ambient', 'direct_mention', 'mention'], handler);
  slackController.on('slash_command', (bot, message) => {
    const commandHandlers = {
      '/leaderboard': leaderBoardHandler,
    };

    commandHandlers[message.command](bot, message);
  });
};


module.exports = hears;
module.exports.extractSkills = extractSkills;
