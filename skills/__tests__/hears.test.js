const { helpHandler, extractMessageContents } = require('../hears');
const { MAIN_HELP_TEXT } = require('../../static');
const genAsyncBot = require('../../lib/asyncBot');
const { teacher1, teacher2 } = require('../__fixtures__/teachers');

jest.mock('../../lib/asyncBot');

const TEST_USER_ID = 'TEST_USER';
const TEST_USER_NAME = 'TEST_USER_NAME';
const LEARNER_OBJECT = { id: TEST_USER_ID, name: TEST_USER_NAME };

const mockBot = { whisper: jest.fn() };
const asyncBot = genAsyncBot();

afterEach(() => jest.clearAllMocks());

const getMessage = text => ({
  event: { text },
  user: TEST_USER_ID,
});

describe('Test the helpHandler', () => {
  test('helpHandler whispers the given message', () => {
    const messageObject = { messageInfo: 'stuff' };

    helpHandler(mockBot, messageObject);

    expect(mockBot.whisper.mock.calls.length).toBe(1);
    expect(mockBot.whisper.mock.calls[0][0]).toBe(messageObject);
    expect(mockBot.whisper.mock.calls[0][1]).toBe(MAIN_HELP_TEXT);
  });
});

describe('Test extractMessageContent', () => {
  test('no skill or teacher mentioned', async () => {
    const message = getMessage('Message with no teacher and no skill');
    asyncBot.api.users.info.mockResolvedValue({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: [],
    });
  });

  test('one skill and no teacher mentioned', async () => {
    const message = getMessage('Message with no teacher and one _skill_');
    asyncBot.api.users.info.mockResolvedValue({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: ['skill'],
    });
  });

  test('two skills and no teacher mentioned', async () => {
    const message = getMessage('Message with no teacher and _two_ _skills_');
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: ['two', 'skills'],
    });
  });

  test('no skill and one teacher mentioned', async () => {
    const message = getMessage(`Message with no skill and <@${teacher1.id}>`);
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: teacher1.name } });
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [{ id: teacher1.id, teacherName: teacher1.name }],
      skills: [],
    });
  });

  test('no skill and two teachers mentioned', async () => {
    const message = getMessage(`Message with no skill and <@${teacher1.id}> and <@${teacher2.id}>`);
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: teacher1.name } });
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: teacher2.name } });
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [
        { id: teacher1.id, teacherName: teacher1.name },
        { id: teacher2.id, teacherName: teacher2.name },
      ],
      skills: [],
    });
  });

  test('two skills and two teachers mentioned', async () => {
    const message = getMessage(`Message with _two_ _skills_ and <@${teacher1.id}> and <@${teacher2.id}>`);
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: teacher1.name } });
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: teacher2.name } });
    asyncBot.api.users.info.mockResolvedValueOnce({ user: { name: TEST_USER_NAME } });

    const result = await extractMessageContents(mockBot, message);

    expect(result).toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [
        { id: teacher1.id, teacherName: teacher1.name },
        { id: teacher2.id, teacherName: teacher2.name },
      ],
      skills: ['two', 'skills'],
    });
  });
});
