const { transaction } = require('objection');
const moment = require('moment');
const { Skill, Message, Point } = require('../models/schema');
const personService = require('../lib/personService');
const genAsyncBot = require('../lib/asyncBot');
const {
  extractMentionedPeople,
  extractSkills,
} = require('../lib/messageService');
const { LEARNING_KEY, MAIN_HELP_TEXT } = require('../static');

const learningHandler = async (bot, message) => {
  const asyncBot = genAsyncBot(bot);

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  const skills = extractSkills(messageContent);
  const teachers = extractMentionedPeople(messageContent);

  const learnerSlackId = message.user;
  const { user: learnerInfoSlack } = await asyncBot.api.users.info({
    user: learnerSlackId,
  });
  const { name: learnerName } = learnerInfoSlack;

  if (skills.length && learnerName && teachers.length) {
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

        const teachersRecords = [];
        for (const teacher of teachers) {
          const { user: teacherInfoSlack } = await asyncBot.api.users.info({
            user: teacher,
          });
          const { name: teacherName } = teacherInfoSlack;

          teachersRecords.push(
            await personService.findOrInsertPerson(teacher, teacherName, trx)
          );
        }

        for (const skill of skills) {
          let skillRecord = await Skill.query(trx).findOne({ name: skill });
          if (!skillRecord) {
            skillRecord = await Skill.query(trx).insertAndFetch({
              name: skill,
            });
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
