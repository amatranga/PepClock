
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('profiles', function(table) {
      table.integer('two_factor_enabled').notNullable().defaultTo(0);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('profiles', function(table) {
      table.dropColumn('two_factor_enabled')
    })
  ])
};
