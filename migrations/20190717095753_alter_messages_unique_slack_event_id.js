exports.up = function (knex, Promise) {
  return Promise.all([
    knex('points')
      .whereNotIn('message_id',
        knex('messages')
          .groupBy('slack_event_id')
          .min('id')
      ).del(),
    knex('messages')
      .whereNotIn('id',
        knex('messages')
          .groupBy('slack_event_id')
          .min('id')
      ).del(),
    knex.schema.alterTable('messages', table => {
      table.unique('slack_event_id');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('messages', table => {
      table.dropUnique('slack_event_id');
    }),
  ]);
};
