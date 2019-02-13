const { MAIN_HELP_TEXT } = require('../static');

const slashCommands = slackController => {
  slackController.on('slash_command', function (bot, req) {
    switch (req.command) {
      case '/ama-phoebe':
        bot.replyAcknowledge();
        bot.whisper(req, MAIN_HELP_TEXT);
        break;
      default:
        bot.replyAcknowledge();
    }
  });
};

module.exports = slashCommands;
