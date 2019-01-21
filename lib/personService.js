const { Person } = require('../models/schema');

class PersonService {
  /**
   * Create a new person.
   * @param {object} bot - instance of slack bot.
   * @param {string} userSlackId - slack id of the new person.
   * @returns {Promise} request of creating new person query.
  */
  createPerson (bot, userSlackId) {
    const promise = (resolve, reject) => {
      // Get Slack user info through Botkit.
      bot.api.users.info({ user: userSlackId }, async (err, res) => {
        if (err) {
          return reject(err);
        }
        const personRecord = Person.query().insertAndFetch({ slack_id: userSlackId, username: res.user.name });
        resolve(personRecord);
      });
    };

    return new Promise(promise);
  }

  /**
   * Find or create a person by Slack id.
   * @param {object} bot - instance of slack bot.
   * @param {string} userSlackId - slack id of the new person.
   * @returns {Person} found or created person.
  */
  async findOrInsertPerson (bot, userSlackId) {
    let person = await Person.query().findOne({ slack_id: userSlackId });
    if (!person) {
      person = await this.createPerson(bot, userSlackId);
    }

    return person;
  }
}

module.exports = new PersonService();
