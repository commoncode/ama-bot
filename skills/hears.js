const { transaction } = require('objection');
const moment = require('moment');
const { Skill, Message, Point } = require('../models/schema');
const personService = require('../lib/personService');
const genAsyncBot = require('../lib/asyncBot');
const { LEARNING_KEY, MAIN_HELP_TEXT } = require('../static');

const extractSkills = messageString => {
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

const learningHandler = async (bot, message) => {
  const asyncBot = genAsyncBot(bot);

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  const skills = extractSkills(messageContent);

  const learnerSlackId = message.user;
  const { user: learnerInfoSlack } = await asyncBot.api.users.info({
    user: learnerSlackId,
  });
  const { name: learnerName } = learnerInfoSlack;

  if (skills.length && learnerName) {
    try {
      await transaction(Point.knex(), async trx => {
        const messageRecord = await Message.query(trx).insertAndFetch({
          text: message.event.text,
          datetime: moment().format(),
        });

        const learnerRecord = await personService.findOrInsertPerson(
          learnerSlackId,
          learnerName,
          trx
        );

        for (const skill of skills) {
          let skillRecord = await Skill.query(trx).findOne({ name: skill });
          if (!skillRecord) {
            skillRecord = await Skill.query(trx).insertAndFetch({
              name: skill,
            });
            bot.reply(message, `${skill} was added as a new skill!`);
          }

          // Insert learning point.
          await Point.query(trx).insert({
            message_id: messageRecord.id,
            skill_id: skillRecord.id,
            teach: false,
            person_id: learnerRecord.id,
          });
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
};

const helpHandler = (bot, message) => {
  bot.whisper(message, MAIN_HELP_TEXT);
};

const hears = slackController => {
  slackController.hears(
    LEARNING_KEY,
    ['ambient', 'direct_mention', 'mention'],
    learningHandler
  );
  slackController.hears('', ['direct_mention', 'mention'], helpHandler);
};

module.exports = hears;
module.exports.extractSkills = extractSkills;
