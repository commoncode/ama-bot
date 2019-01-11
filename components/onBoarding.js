const onBoardingHandler = (controller) => {
  controller.on('onboard', (bot) => {
    bot.startPrivateConversation({ user: bot.config.createdBy }, (err,convo) => {

      if (err) {
        console.error(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      }
    });
  });
}

module.exports = onBoardingHandler;
