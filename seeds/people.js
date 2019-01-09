exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('people')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('people').insert([
        { id: 1, colName: 'phoebe' },
        { id: 2, colName: 'sarah' },
        { id: 3, colName: 'chen' }
      ]);
    });
};
