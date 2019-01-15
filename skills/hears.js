const { Skill } = require('../models/schema');
const { UniqueViolationError } = require('objection-db-errors');

const hears = slackController => {
  slackController.hears(
    'hello',
    ['direct_message', 'direct_mention', 'app_mention'],
    (bot, message) => {
      bot.reply(message, 'Hello world');
    }
  );
  slackController.hears(
    '',
    ['direct_message', 'direct_mention', 'app_mention'],
    (bot, message) => {
      if (message.text.includes(['_'])) {
        const skill = message.text.substring(
          message.text.indexOf('_') + 1,
          message.text.lastIndexOf('_')
        );
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
      }
    }
  );
};

module.exports = hears;
