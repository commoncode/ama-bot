
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('botkit_user', table => {
      table
        .string('id')
        .primary();
      table
        .string('access_token')
        .notNullable();
      table
        .string('scopes')
        .notNullable();
      table
        .string('team_id')
        .notNullable();
      table
        .string('user_name')
        .notNullable();
    }),
    knex.schema.createTable('botkit_team', table => {
      table
        .string('id')
        .primary();
      table
        .string('createdby')
        .notNullable();
      table
        .string('url')
        .notNullable();
      table
        .string('name')
        .notNullable();
      table
        .string('token')
        .notNullable();
      table
        .string('bot')
        .notNullable();
    }),
    knex.schema.createTable('botkit_channel', table => {
      table
        .string('id')
        .primary();
      table
        .text('text')
        .notNullable();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('botkit_user'),
    knex.schema.dropTableIfExists('botkit_team'),
    knex.schema.dropTableIfExists('botkit_channel'),
  ]);
};
