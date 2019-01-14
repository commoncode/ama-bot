exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('people', table => {
      table.increments('id').primary();
      table.string('username');
      table.integer('teach_score');
      table.integer('learn_score');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTable('people')]);
};
