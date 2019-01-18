const Knex = require('knex');
const connection = require('../knexfile');
const { Model } = require('objection');

const knexConnection = Knex(connection);

Model.knex(knexConnection);

class Person extends Model {
  static get tableName () {
    return 'people';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['username', 'slack_id'],

      properties: {
        id: { type: 'integer' },
        slack_id: { type: 'string' },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        slack_id: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings () {
    return {
      points: {
        relation: Model.HasManyRelation,
        modelClass: Point,
        join: {
          from: 'people.id',
          to: 'points.person_id',
        },
      },
    };
  }
}

class Skill extends Model {
  static get tableName () {
    return 'skills';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings () {
    return {
      points: {
        relation: Model.HasManyRelation,
        modelClass: Point,
        join: {
          from: 'skills.id',
          to: 'points.skill_id',
        },
      },
    };
  }
}

class Point extends Model {
  static get tableName () {
    return 'points';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: [
        'teach',
        'message_id',
        'skill_id',
        'person_id',
      ],

      properties: {
        id: { type: 'integer' },
        teach: { type: 'boolean' },
        message_id: { type: ['integer'] },
        skill_id: { type: ['integer'] },
        person_id: { type: ['integer'] },
      },
    };
  }

  static get relationMappings () {
    return {
      messages: {
        relation: Model.BelongsToOneRelation,
        modelClass: Message,
        join: {
          from: 'points.message_id',
          to: 'messages.id',
        },
      },
      skills: {
        relation: Model.BelongsToOneRelation,
        modelClass: Skill,
        join: {
          from: 'points.skill_id',
          to: 'skills.id',
        },
      },
      people: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: 'points.person_id',
          to: 'people.id',
        },
      },
    };
  }
}

class Message extends Model {
  static get tableName () {
    return 'messages';
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['text', 'datetime'],

      properties: {
        id: { type: 'integer' },
        text: { type: 'string', minLength: 1, maxLength: 255 },
        datetime: { type: 'datetime' },
      },
    };
  }

  static get relationMappings () {
    return {
      points: {
        relation: Model.HasManyRelation,
        modelClass: Point,
        join: {
          from: 'message.id',
          to: 'points.message_id',
        },
      },
    };
  }
}

module.exports = { Person, Skill, Point, Message };
