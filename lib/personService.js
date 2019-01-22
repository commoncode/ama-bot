const { Person } = require('../models/schema');

class PersonService {
  /**
   * Find or create a person by Slack id.
   * @param {object} bot - instance of slack bot.
   * @param {string} userSlackId - slack id of the new person.
   * @returns {Person} found or created person.
  */
  async findOrInsertPerson (userSlackId, username) {
    let person = await Person.query().findOne({ slack_id: userSlackId });
    if (!person) {
      person = await Person.query().insertAndFetch({ slack_id: userSlackId, username });
    }

    return person;
  }
}

module.exports = new PersonService();
