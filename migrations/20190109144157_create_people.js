exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('people', table => {
      table.increments('id').primary();
      table
        .string('username')
        .unique()
        .notNullable();
      table
        .string('slack_id')
        .unique()
        .notNullable();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTableIfExists('people')]);
};
