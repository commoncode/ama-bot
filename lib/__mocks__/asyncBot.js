// Allow tests to set return function as required
const genAsyncBot = bot => ({
  api: {
    users: {
      info: bot.asyncBotReturn || jest.fn(),
    },
  },
});

module.exports = genAsyncBot;
