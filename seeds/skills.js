exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('skills')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('skills').insert([
        { id: 1, colName: 'python' },
        { id: 2, colName: 'django' },
        { id: 3, colName: 'javascript' }
      ]);
    });
};
