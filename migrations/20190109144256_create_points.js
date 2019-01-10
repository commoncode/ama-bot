exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('points', table => {
      table.increments('id').primary();
      table.binary('teach');
      table.integer('message_id').references('messages.id');
      table.integer('skill_id').references('skills.id');
      table.integer('person_id').references('people.id');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('points')]);
};
