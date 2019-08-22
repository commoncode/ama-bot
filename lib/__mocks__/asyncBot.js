const mockAsyncBot = {
  api: {
    users: {
      info: jest.fn(),
    },
  },
};

module.exports = jest.fn(() => mockAsyncBot);
