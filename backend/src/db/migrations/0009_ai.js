/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('flashcards', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.text('front').notNullable();
    t.text('back').notNullable();
  });

  await knex.schema.createTable('quiz_questions', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.text('question').notNullable();
    t.specificType('options', 'text[]').notNullable();
    t.integer('answer_index').notNullable();
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('quiz_questions');
  await knex.schema.dropTableIfExists('flashcards');
}
