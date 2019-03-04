exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.string('slack_event_id');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('messages', table => {
      table.dropColumn('slack_event_id');
    }),
  ]);
};
