const { extractSkills } = require('../messageService');

test('test returns the single match in a sentence', () =>
  expect(extractSkills('some _skill_ is here')).toEqual(['skill']));

test('test returns multiple match in a sentence', () =>
  expect(
    extractSkills('some _skill_ is here and some _other skill_ is here')
  ).toEqual(['skill', 'other skill']));

test('test no skill returned when only single underscore', () =>
  expect(extractSkills('some _skill is here')).toEqual([]));

test('test remove white space around skills', () =>
  expect(extractSkills('some _skill _is_ here')).toEqual(['skill']));

test('test remove white space around multiple skills', () =>
  expect(
    extractSkills('some _skill _is here_       what     _ is happening')
  ).toEqual(['skill', 'what']));

test('test behavior is consistent for missed underscores', () =>
  expect(
    extractSkills('some skill _is here_       what     _ is happening')
  ).toEqual(['is here']));

test('test many skills still works okay', () =>
  expect(
    extractSkills(
      'blah is _great do_ honey _things other junk_ crazy words _words_ _words_ are nice'
    )
  ).toEqual(['great do', 'things other junk', 'words', 'words']));