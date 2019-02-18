const extractMentionedPeople = (messageString) => {
  const mentionPattern = /<@[A-Za-z0-9]+>/g;
  const matches = messageString.match(mentionPattern);

  if (!matches) {
    return [];
  }

  const mentionedPeople = matches.map(match => match.replace(/<|@|>/g, ''));

  return mentionedPeople;
};

const extractSkills = (messageString) => {
  const skillPattern = /_[^@_]+_/g;
  const matches = messageString.match(skillPattern);

  if (matches == null) {
    return [];
  }

  let skills = [];

  matches.forEach(match => {
    let skill = match.replace(/_/g, '').trim();
    skills.push(skill);
  });

  return skills;
};

module.exports = { extractMentionedPeople, extractSkills };
