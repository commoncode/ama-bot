const { Skill, Message, Point } = require('../models/schema');
const personService = require('../lib/personService');
const genAsyncBot = require('../lib/asyncBot');

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


const handler = async (bot, message) => {
  const asyncBot = genAsyncBot(bot);

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  const skills = extractSkills(messageContent);

  const learnerSlackId = message.user;
  const { user: learnerInfoSlack } = await asyncBot.api.users.info({ user: learnerSlackId });
  const { name: learnerName } = learnerInfoSlack;

  if (skills.length && learnerName) {
    try {
      const messageRecord = await Message.query().insertAndFetch({
        text: message.event.text,
        datetime: new Date().toISOString(),
      });

      const learnerRecord = await personService.findOrInsertPerson(learnerSlackId, learnerName);

      skills.forEach(async skill => {
        let skillRecord = await Skill.query().findOne({ name: skill });
        if (!skillRecord) {
          skillRecord = await Skill.query().insertAndFetch({ name: skill });
          bot.reply(message, `${skill} was added as a new skill!`);
        }

        // Insert learning point.
        await Point.query().insert({
          message_id: messageRecord.id,
          skill_id: skillRecord.id,
          teach: false,
          person_id: learnerRecord.id,
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
};


const hears = slackController => {
  slackController.hears(LEARNING_KEY, ['ambient', 'direct_mention', 'mention'], handler);
};


module.exports = hears;
module.exports.extractSkills = extractSkills;
