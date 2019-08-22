const { extractSkills, extractMentionedPeople } = require('../messageService');

describe('#extractSkills', () => {

  test('it returns a single match in a sentence', () =>
    expect(extractSkills('some _skill_ is here')).toEqual(['skill']));

  test('it returns multiple match in a sentence', () =>
    expect(
      extractSkills('some _skill_ is here and some _other skill_ is here')
    ).toEqual(['skill', 'other skill']));

  test('no skill returned when only single underscore', () =>
    expect(extractSkills('some _skill is here')).toEqual([]));

  test('it removes white space around skills', () =>
    expect(extractSkills('some _skill _is_ here')).toEqual(['skill']));

  test('it removes white space around multiple skills', () =>
    expect(
      extractSkills('some _skill _is here_       what     _ is happening')
    ).toEqual(['skill', 'what']));

  test('behavior is consistent for missed underscores', () =>
    expect(
      extractSkills('some skill _is here_       what     _ is happening')
    ).toEqual(['is here']));

  test('it removes a skill if it appears more than once', () =>
    expect(
      extractSkills(
        'blah is _great do_ honey _things other junk_ crazy words _words_ _words_ are nice'
      )
    ).toEqual(['great do', 'things other junk', 'words']));
});

describe('#extractMentionnedPeople', () => {

  test('it returns a single match in a sentence', () =>
    expect(
      extractMentionedPeople('My name is <@TEST123>.')
    ).toEqual(['TEST123']));

  test('it returns multiple matches in a sentence', () =>
    expect(
      extractMentionedPeople('We are <@TEST123> and <@TEST456>.')
    ).toEqual(['TEST123', 'TEST456']));

  test('it returns an empty array when no matches in a sentence', () =>
    expect(
      extractMentionedPeople('Nope, no one here.')
    ).toEqual([]));

  test('@name is not matched', () =>
    expect(
      extractMentionedPeople('@test should not match')
    ).toEqual([]));

  test('it returns two names next to each other', () =>
    expect(
      extractMentionedPeople('<@TEST123><@TEST345>')
    ).toEqual(['TEST123', 'TEST345']));

  test('it removes multiple occurences for the same name', () => {
    expect(
      extractMentionedPeople('<@TEST123> <@TEST123>')
    ).toEqual(['TEST123']);
  });

});
