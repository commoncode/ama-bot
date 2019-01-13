const authRoutes = (webserver, slackController) => {
  webserver.get('/login', (req, res) => {
    res.redirect(slackController.getAuthorizeURL());
  });

  webserver.get('/oauth', (req) => {
    const { code } = req.query;
    const slackApi = slackController.spawn({});
    const opts = {
      client_id: slackController.config.clientId,
      client_secret: slackController.config.clientSecret,
      code: code,
    };

    slackApi.api.oauth.access(opts, (error, auth) => {
      if (error) {
        console.error('Error confirming oauth: ', error);
      } else {
        slackApi.api.auth.test({ token: auth.access_token }, (error, identity) => {

          if (error) {
            console.error('Error confirming oauth: ', error);
          }

          auth.identity = identity;
          slackController.trigger('oauth:success', [auth]);

          // TODO: create a 'login_success.html' page and redirect to it.
        });
      }
    });
  });
};

module.exports = authRoutes;
