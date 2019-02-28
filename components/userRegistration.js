const { transaction } = require('objection');
const { BotkitTeam } = require('../models/schema');

const userRegistration = (slackController) => {

  /* Handle event caused by a user logging in with oauth */
  slackController.on('oauth:success', (payload) => {

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

      testBot.api.auth.test({}, async (err, botAuth) => {
        if (err) {
          console.error('Error: could not authenticate bot user', err);
        } else {
          team.bot.name = botAuth.user;

          // add in info that is expected by Botkit
          testBot.identity = botAuth;

          testBot.identity.id = botAuth.user_id;
          testBot.identity.name = botAuth.user;

          testBot.team_info = team;

          if (!isNewTeam) {
            await transaction(BotkitTeam.knex(), async trx => {
              // `botkit-storage-pg` try to insert the same team record when the app is being reinstalled,
              // so need to remove existing record before save.
              await BotkitTeam.query(trx)
                .delete()
                .where({ id: payload.identity.team_id });
            });
          }

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

module.exports = userRegistration;
