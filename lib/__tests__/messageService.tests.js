const { extractSkills, extractMentionedPeople } = require('../messageService');

describe('Extracting skills from messages', () => {

  test('returns the single match in a sentence', () =>
    expect(extractSkills('some _skill_ is here')).toEqual(['skill']));

  test('returns multiple match in a sentence', () =>
    expect(
      extractSkills('some _skill_ is here and some _other skill_ is here')
    ).toEqual(['skill', 'other skill']));

  test('no skill returned when only single underscore', () =>
    expect(extractSkills('some _skill is here')).toEqual([]));

  test('remove white space around skills', () =>
    expect(extractSkills('some _skill _is_ here')).toEqual(['skill']));

  test('remove white space around multiple skills', () =>
    expect(
      extractSkills('some _skill _is here_       what     _ is happening')
    ).toEqual(['skill', 'what']));

  test('behavior is consistent for missed underscores', () =>
    expect(
      extractSkills('some skill _is here_       what     _ is happening')
    ).toEqual(['is here']));

  test('many skills still works okay', () =>
    expect(
      extractSkills(
        'blah is _great do_ honey _things other junk_ crazy words _words_ _words_ are nice'
      )
    ).toEqual(['great do', 'things other junk', 'words', 'words']));
});

describe('Extracting people from messages', () => {

  test('single match in a sentence', () =>
    expect(
      extractMentionedPeople('My name is <@TEST123>.')
    ).toEqual(['TEST123']));

  test('multiple matches in a sentence', () =>
    expect(
      extractMentionedPeople('We are <@TEST123> and <@TEST456>.')
    ).toEqual(['TEST123', 'TEST456']));

  test('no matches in a sentence', () =>
    expect(
      extractMentionedPeople('Nope, no one here.')
    ).toEqual([]));

  test('@name is not matched', () =>
    expect(
      extractMentionedPeople('@test should not match')
    ).toEqual([]));

  test('two names next to each other match', () =>
    expect(
      extractMentionedPeople('<@TEST123><@TEST345>')
    ).toEqual(['TEST123', 'TEST345']));

  // Ticket opened to change this: https://commoncode.atlassian.net/browse/CCP-182
  test('repeated names are counted multiple times', () => {
    expect(
      extractMentionedPeople('<@TEST123> <@TEST123>')
    ).toEqual(['TEST123', 'TEST123']);
  });

});
