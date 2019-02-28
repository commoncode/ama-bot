exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema
      .raw('CREATE EXTENSION IF NOT EXISTS CITEXT')
      .alterTable('skills', table => {
        table.specificType('name', 'CITEXT').alter();
      }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('skills', table => {
      table.string('name').alter();
    }),
  ]);
};
