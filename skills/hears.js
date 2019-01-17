const { Skill } = require('../models/schema');
const { UniqueViolationError } = require('objection-db-errors');


const extractSkills = (messageString) => {
  var skillPattern = /_[^@_]+_/g;
  var matches = messageString.match(skillPattern);

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
  var skills = extractSkills(message.text);

  skills.forEach(skill => {
    Skill.query()
      .insert({ name: skill })
      .then(
        res => {
          bot.reply(message, `${skill} was added as a new skill!`);
        },
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

  slackController.hears('', ['direct_message', 'direct_mention', 'app_mention'], handler);
};

module.exports = hears;
module.exports.extractSkills = extractSkills;
