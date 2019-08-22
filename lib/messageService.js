const extractMentionedPeople = (messageString) => {
  const mentionPattern = /<@[A-Za-z0-9]+>/g;
  const matches = messageString.match(mentionPattern);

  if (!matches) {
    return [];
  }

  const mentionnedPeople = new Set();

  matches.map(match => {
    mentionnedPeople.add(match.replace(/<|@|>/g, ''));
  });

  return Array.from(mentionnedPeople);
};

const extractSkills = (messageString) => {
  const skillPattern = /_[^@_]+_/g;
  const matches = messageString.match(skillPattern);

  if (matches == null) {
    return [];
  }

  const skills = new Set();

  matches.map(match => {
    skills.add(match.replace(/_/g, '').trim());
  });

  return Array.from(skills);
};

module.exports = { extractMentionedPeople, extractSkills };
