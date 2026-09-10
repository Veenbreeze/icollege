/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('documents', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('doc_type').notNullable(); // pdf | image | doc
    t.string('category').notNullable().defaultTo('all');
    t.integer('size_bytes').notNullable();
    t.string('mime_type');
    t.string('storage_path').notNullable();
    t.integer('course_id').references('id').inTable('courses').onDelete('SET NULL');
    t.timestamps(true, true);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('documents');
}
