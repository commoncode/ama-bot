const { helpHandler, extractMessageContents } = require('../hears');
const { MAIN_HELP_TEXT } = require('../../static');

jest.mock('../../lib/asyncBot');

const TEST_USER_ID = 'TEST_USER';
const TEST_USER_NAME = 'TEST_USER_NAME';
const LEARNER_OBJECT = { id: TEST_USER_ID, name: TEST_USER_NAME };

const TEACHER_1_ID = 'TEACHER1';
const TEACHER_1_NAME = 'TEACHER_1_NAME';
const TEACHER_2_ID = 'TEACHER2';
const TEACHER_2_NAME = 'TEACHER_2_NAME';

const mockBot = new (jest.fn())();
mockBot.whisper = jest.fn();

// These all get passed to asyncBot in extractMessageContents
mockBot.api = jest.fn();
mockBot.api.users = jest.fn();
mockBot.api.users.info = jest.fn(({ user }) => {
  let name;
  if (user === TEST_USER_ID) { name = TEST_USER_NAME; }
  if (user === TEACHER_1_ID) { name = TEACHER_1_NAME; }
  if (user === TEACHER_2_ID) { name = TEACHER_2_NAME; }
  return Promise.resolve({ user: { name } });
});

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
  test('no skill or teacher mentioned', () => {
    const message = getMessage('Message with no teacher and no skill');
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: [],
    });
  });

  test('one skill and no teacher mentioned', () => {
    const message = getMessage('Message with no teacher and one _skill_');
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: ['skill'],
    });
  });

  test('two skills and no teacher mentioned', () => {
    const message = getMessage('Message with no teacher and _two_ _skills_');
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [],
      skills: ['two', 'skills'],
    });
  });

  test('no skill and one teacher mentioned', () => {
    const message = getMessage(`Message with no skill and <@${TEACHER_1_ID}>`);
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [{ id: TEACHER_1_ID, teacherName: TEACHER_1_NAME }],
      skills: [],
    });
  });

  test('no skill and two teachers mentioned', () => {
    const message = getMessage(
      `Message with no skill and <@${TEACHER_1_ID}> and <@${TEACHER_2_ID}>`
    );
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [
        { id: TEACHER_1_ID, teacherName: TEACHER_1_NAME },
        { id: TEACHER_2_ID, teacherName: TEACHER_2_NAME },
      ],
      skills: [],
    });
  });

  test('two skills and two teachers mentioned', () => {
    const message = getMessage(
      `Message with _two_ _skills_ and <@${TEACHER_1_ID}> and <@${TEACHER_2_ID}>`
    );
    return expect(extractMessageContents(mockBot, message)).resolves.toMatchObject({
      learnerObject: LEARNER_OBJECT,
      teacherObjects: [
        { id: TEACHER_1_ID, teacherName: TEACHER_1_NAME },
        { id: TEACHER_2_ID, teacherName: TEACHER_2_NAME },
      ],
      skills: ['two', 'skills'],
    });
  });
});
