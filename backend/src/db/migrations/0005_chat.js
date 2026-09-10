/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('chat_threads', (t) => {
    t.increments('id').primary();
    t.boolean('is_group').notNullable().defaultTo(false);
    t.string('name');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('chat_thread_members', (t) => {
    t.integer('thread_id').notNullable().references('id').inTable('chat_threads').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('last_read_at');
    t.primary(['thread_id', 'user_id']);
  });

  await knex.schema.createTable('chat_messages', (t) => {
    t.increments('id').primary();
    t.integer('thread_id').notNullable().references('id').inTable('chat_threads').onDelete('CASCADE');
    t.integer('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('body').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('chat_messages');
  await knex.schema.dropTableIfExists('chat_thread_members');
  await knex.schema.dropTableIfExists('chat_threads');
}
