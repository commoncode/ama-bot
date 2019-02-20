const webhookRoutes = (webserver, slackController) => {
  webserver.post('/slack/receive', (req, res) => {
    console.log('here');
    res.status(200);
    slackController.handleWebhookPayload(req, res);
  });
};

module.exports = webhookRoutes;
