exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('messages', table => {
      table.increments('id').primary();
      table.string('text');
      table.datetime('datetime');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('messages')]);
};
