const { transaction } = require('objection');
const { Skill, Message, Point } = require('../models/schema');
const personService = require('../lib/personService');
const genAsyncBot = require('../lib/asyncBot');
const {
  extractMentionedPeople,
  extractSkills,
} = require('../lib/messageService');
const { LEARNING_KEY, MAIN_HELP_TEXT } = require('../static');

const hears = slackController => {
  slackController.hears(
    LEARNING_KEY,
    ['ambient', 'direct_mention', 'mention'],
    learningHandler
  );
  slackController.hears('', ['direct_mention', 'mention'], helpHandler);
};

const learningHandler = async (bot, message) => {
  // send off an acknowledged reply to prevent multiple events from being fired
  bot.replyAcknowledge();

  // learnerObject contains slackId and name
  // teacherObjects is array of objects, each containing slackId and name
  const {
    learnerObject,
    skills,
    teacherObjects,
  } = await extractMessageContents(bot, message);

  if (skills.length && learnerObject) {
    try {
      await transaction(Point.knex(), async trx => {
        const messageRecord = await Message.query(trx).insertAndFetch({
          text: message.event.text,
          datetime: message.event.ts,
          slack_event_id: message.event_id,
        });

        const learnerRecord = await personService.findOrInsertPerson(
          learnerObject.id,
          learnerObject.name,
          trx
        );

        // messages without teachers named are still valid
        const teachersRecords = [];
        if (teacherObjects.length) {
          for (const teacher of teacherObjects) {
            teachersRecords.push(
              await personService.findOrInsertPerson(
                teacher.id,
                teacher.teacherName,
                trx
              )
            );
          }
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

          // Insert teaching points, will not insert anything if teachersRecords is empty
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
      return;
    }
    bot.reply(
      message,
      constructConfirmationMessage(learnerObject, teacherObjects, skills)
    );
  }
};

const helpHandler = (bot, message) => {
  bot.whisper(message, MAIN_HELP_TEXT);
};

const constructConfirmationMessage = (
  learnerObject,
  teacherObjects,
  skills
) => {
  const skillStr = `for _${skills.join(', ')}_`;
  let teacherStr = '';
  if (teacherObjects.length) {
    teacherStr = `and *${teacherObjects.map(x => x.teacherName).join(', ')}* ${
      teacherObjects.length > 1 ? 'each ' : ''
    }earned 1 teaching point `;
  }

  return `*${
    learnerObject.name
  }* earned 1 learning point ${teacherStr}${skillStr}`;
};

const extractMessageContents = async (bot, message) => {
  const asyncBot = genAsyncBot(bot);

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  const skills = extractSkills(messageContent);
  const teachers = extractMentionedPeople(messageContent);

  const teacherObjects = [];
  for (const teacherId of teachers) {
    const { user: teacherInfoSlack } = await asyncBot.api.users.info({
      user: teacherId,
    });
    teacherObjects.push({ id: teacherId, teacherName: teacherInfoSlack.name });
  }

  const learnerSlackId = message.user;
  const { user: learnerInfoSlack } = await asyncBot.api.users.info({
    user: learnerSlackId,
  });
  const { name: learnerName } = learnerInfoSlack;

  return {
    learnerObject: { id: learnerSlackId, name: learnerName },
    skills,
    teacherObjects,
  };
};

module.exports = hears;
