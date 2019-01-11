const hears =  (slackController) => {
  slackController.hears('hello', ['direct_message', 'direct_mention'], (bot, message) => {
    bot.reply(message, "Hello world");
  });
};

module.exports = hears;
