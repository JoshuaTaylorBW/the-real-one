
exports.up = function(knex, Promise) {
  return knex.schema.table('restaurants', function(table){
    table.text('street1');
    table.text('street2');
    table.text('city');
    table.text('zip');
    table.integer('neighborhood_id');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('restaurants', function(table){
    table.dropColumn('street1');
    table.dropColumn('street2');
    table.dropColumn('city');
    table.dropColumn('zip');
    table.dropColumn('neighborhood_id');
  })
};
