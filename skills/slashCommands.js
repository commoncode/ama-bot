const { MAIN_HELP_TEXT } = require('../static');

const slashCommands = slackController => {
  slackController.on('slash_command', function (bot, req) {
    switch (req.command) {
      case '/ama-phoebe':
        bot.replyAcknowledge();
        switch (req.text) {
          case 'leaderboard':
            bot.whisper(req, 'Leaderboard TBA');
            break;
          case 'help':
          default:
            bot.whisper(req, MAIN_HELP_TEXT);
            break;
        }
        break;
      default:
        bot.replyAcknowledge();
    }
  });
};

module.exports = slashCommands;
