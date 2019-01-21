exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('skills', table => {
      table.increments('id').primary();
      table
        .string('name')
        .unique()
        .notNullable();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTableIfExists('skills')]);
};
