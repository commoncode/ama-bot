const extractMentionedPeople = (messageString) => {
  const mentionPattern = /<@[A-Za-z0-9]+>/g;
  const matches = messageString.match(mentionPattern);

  if (!matches) {
    return [];
  }

  const mentionedPeople = matches.map(match => match.replace(/<|@|>/g, ''));

  return mentionedPeople;
};

module.exports = { extractMentionedPeople };
