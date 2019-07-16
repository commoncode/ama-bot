const webhookRoutes = (webserver, slackController) => {
  webserver.post('/slack/receive', (req, res) => {
    console.log('Received request:');
    console.log(req.body);
    console.log('Received request headers:');
    console.log(req.headers);
    res.status(200);
    slackController.handleWebhookPayload(req, res);
  });
};

module.exports = webhookRoutes;
