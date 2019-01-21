const { Skill } = require('../models/schema');
const { UniqueViolationError } = require('objection-db-errors');


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


const handler = (bot, message) => {

  const messageContent = message.text.replace(LEARNING_KEY, ' ');
  var skills = extractSkills(messageContent);

  skills.forEach(skill => {
    Skill.query()
      .insert({ name: skill })
      .then(res => bot.reply(message, `${skill} was added as a new skill!`),
        err => {
          if (!(err instanceof UniqueViolationError)) {
            bot.reply(message, `Unable to add ${skill} as a skill :(`);
          }
          bot.reply(message, err);
        }
      );
  });
};


const hears = slackController => {

  slackController.hears(
    'hello',
    ['direct_message', 'direct_mention', 'app_mention'],
    (bot, message) => {
      bot.reply(message, 'Hello world');
    }
  );

  slackController.hears(LEARNING_KEY, ['ambient'], handler);
};


module.exports = hears;
module.exports.extractSkills = extractSkills;
