const { Person } = require('../models/schema');

class PersonService {
  /**
   * Find or create a person by Slack id.
   * @param {object} bot - instance of slack bot.
   * @param {string} userSlackId - slack id of the new person.
   * @returns {Person} found or created person.
  */
  async findOrInsertPerson (userSlackId, username, transaction = null) {
    let person = await Person.query(transaction).findOne({ slack_id: userSlackId });
    if (!person) {
      person = await Person.query(transaction).insertAndFetch({ slack_id: userSlackId, username });
    }

    return person;
  }
}

module.exports = new PersonService();
