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


const pushSkill = (skill) => {
  Skill.query()
    .insert({ name: skill })
    .then(
      res => {
        return `${skill} was added as a new skill!`;
      },
      err => {
        if (!(err instanceof UniqueViolationError)) {
          return `${skill} is already a skill`;
        }
        console.error(err);
        return `Unable to add ${skill} as a skill :(`;
      }
    );
};


const handler = (bot, message) => {
  var skills = extractSkills(message.text);

  skills.forEach(skill => {
    var replyMessage = pushSkill(skill);
    bot.reply(message, replyMessage);
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
