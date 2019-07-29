const { helpHandler, extractMessageContents } = require('../hears');
const { MAIN_HELP_TEXT } = require('../../static');

jest.mock('../../lib/asyncBot');

const TEST_USER_NAME = 'TEST USER'

const mockBot = new (jest.fn())();
mockBot.whisper = jest.fn();

// These all get passed to asyncBot in extractMessageContents
mockBot.api = jest.fn()
mockBot.api.users = jest.fn()
mockBot.api.users.info = jest.fn(() =>
  Promise.resolve({ user: { name: TEST_USER_NAME } })
);

describe('Test the helpHandler', () => {
  test('helpHandler whispers the given message', () => {
    const messageObject = { messageInfo: 'stuff' }
    helpHandler(mockBot, messageObject);
    expect(mockBot.whisper.mock.calls.length).toBe(1);
    expect(mockBot.whisper.mock.calls[0][0]).toBe(messageObject);
    expect(mockBot.whisper.mock.calls[0][1]).toBe(MAIN_HELP_TEXT);
  });
});

describe('Test extractMessageContent', () => {
  test('extract learner only', () => {
    const message = {
      event: { text: 'Message with no teacher and no skill' },
      user: 'test_user',
    };
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: { id: 'test_user', name: TEST_USER_NAME },
      teacherObjects: [],
      skills: [],
    });
  });
});