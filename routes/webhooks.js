const webhookRoutes = (webserver, slackController) => {
  webserver.post('/slack/receive', (req, res) => {
    res.status(200);
    slackController.handleWebhookPayload(req, res);
  });
};

module.exports = webhookRoutes;
