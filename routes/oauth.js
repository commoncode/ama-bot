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
      console.info('BENTEST: oauth started')
      if (error) {
        console.info('BENTEST: error 1')
        console.error('Error confirming oauth: ', error);
      } else {
        console.info('BENTEST: testing token...')
        slackApi.api.auth.test({ token: auth.access_token }, (error, identity) => {

          console.info('BENTEST: in token test')
          if (error) {
            console.info('BENTEST: error 2')
            console.error('Error confirming oauth: ', error);
          }

          auth.identity = identity;
          console.info('BENTEST: oauth successful')
          slackController.trigger('oauth:success', [auth]);
          console.info('BENTEST: oauth success trigger sent')

          // TODO: create a 'login_success.html' page and redirect to it.
        });
      }
    });
  });
};

module.exports = authRoutes;
