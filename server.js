const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.load();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.listen(port, function () {
  console.log('Bot is listening on port ' + port);
});
