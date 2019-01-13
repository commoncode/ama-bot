const express = require('express');
const bodyParser = require('body-parser');

const server = (slackController) => {
  const app = express();
  const port = process.env.PORT;

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.listen(port, function () {
    console.log('Bot is listening on port ' + port);
  });

  // import all the pre-defined routes.
  const normalizedPath = require('path').join(__dirname, '/routes');
  require('fs').readdirSync(normalizedPath).forEach(file => {
    require('./routes/' + file)(app, slackController);
  });

  slackController.webserver = app;
};

module.exports = server;
