exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('skills')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('skills').insert([
        { id: 1, name: 'python' },
        { id: 2, name: 'django' },
        { id: 3, name: 'javascript' },
      ]);
    });
};
