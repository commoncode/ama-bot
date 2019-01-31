const slackController = require('../bot');

const handler = (payload) => {

  if (!payload.identity.team_id) {
    console.error('Error: received an oauth response without a team id');
  }
  slackController.storage.teams.get(payload.identity.team_id, (err, team) => {
    if (err) {
      console.error('Error: could not load team from storage system: ', payload.identity.team_id, err);
    }

    const isNewTeam = !team;
    if (!team) {
      team = {
        id: payload.identity.team_id,
        createdBy: payload.identity.user_id,
        url: payload.identity.url,
        name: payload.identity.team,
      };
    }

    team.bot = {
      token: payload.bot.bot_access_token,
      user_id: payload.bot.bot_user_id,
      createdBy: payload.identity.user_id,
      app_token: payload.access_token,
    };

    const testBot = slackController.spawn(team.bot);

    testBot.api.auth.test({}, (err, botAuth) => {
      if (err) {
        console.error('Error: could not authenticate bot user', err);
      } else {
        team.bot.name = botAuth.user;

        // add in info that is expected by Botkit
        testBot.identity = botAuth;

        testBot.identity.id = botAuth.user_id;
        testBot.identity.name = botAuth.user;

        testBot.team_info = team;

        slackController.storage.teams.save(team, (err) => {
          if (err) {
            console.error('Error: could not save team record:', err);
          } else {
            if (isNewTeam) {
              slackController.trigger('create_team', [testBot, team]);
            } else {
              slackController.trigger('update_team', [testBot, team]);
            }
          }
        });
      }
    });
  });

  slackController.on('onboard', (bot) => {
    bot.startPrivateConversation({ user: bot.config.createdBy }, (err, convo) => {

      if (err) {
        console.error(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      }
    });
  });
  slackController.on('create_team', (bot, team) => {

    // Trigger an event that will establish an RTM connection for this bot
    slackController.trigger('rtm:start', [bot.config]);

    // Trigger an event that will cause this team to receive onboarding messages
    slackController.trigger('onboard', [bot, team]);
  });


  slackController.on('update_team', (bot) => {

    // Trigger an event that will establish an RTM connection for this bot
    slackController.trigger('rtm:start', [bot]);
  });



};

slackController.on('oauth:success', handler);
