exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('points', table => {
      table.increments('id').primary();
      table.boolean('teach').notNullable();
      table
        .integer('message_id')
        .references('messages.id')
        .notNullable();
      table
        .integer('skill_id')
        .references('skills.id')
        .notNullable();
      table
        .integer('person_id')
        .references('people.id')
        .notNullable();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTableIfExists('points')]);
};
