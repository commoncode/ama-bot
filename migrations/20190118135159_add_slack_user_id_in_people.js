
exports.up = function (knex, Promise) {
  return knex.schema.table('people', table => {
    table.string('slack_id').notNullable().unique();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('people', table => {
    table.dropColumn('slack_id');
  });
};
