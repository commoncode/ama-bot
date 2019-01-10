exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('people')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('people').insert([
        { id: 1, username: 'phoebe' },
        { id: 2, username: 'sarah' },
        { id: 3, username: 'chen' }
      ]);
    });
};
