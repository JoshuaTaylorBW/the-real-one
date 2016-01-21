
exports.up = function(knex, Promise) {
  return knex.schema.createTable('neighborhoods', function(table){
    table.increments();
    table.string('name');
    table.text('epicenter');
  })
};

exports.down = function(knex, Promise) {
return knex.schema.dropTable('posts');
};
