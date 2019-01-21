exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('messages', table => {
      table.increments('id').primary();
      table.string('text').notNullable();
      table.datetime('datetime').notNullable();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([knex.schema.dropTableIfExists('messages')]);
};
