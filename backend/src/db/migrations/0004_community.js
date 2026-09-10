/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('chambers', (t) => {
    t.increments('id').primary();
    t.string('slug').notNullable().unique();
    t.string('name').notNullable();
    t.string('tagline');
    t.text('description');
    t.string('theme_key');
    t.string('emoji');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('chamber_members', (t) => {
    t.integer('chamber_id').notNullable().references('id').inTable('chambers').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('role').notNullable().defaultTo('member');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['chamber_id', 'user_id']);
  });

  await knex.schema.createTable('posts', (t) => {
    t.increments('id').primary();
    t.integer('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('chamber_id').notNullable().references('id').inTable('chambers').onDelete('CASCADE');
    t.string('tag'); // question | news | opportunity | null
    t.string('title').notNullable();
    t.text('body');
    t.string('media_url');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('comments', (t) => {
    t.increments('id').primary();
    t.integer('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE');
    t.integer('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('body').notNullable();
    t.boolean('best').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('likes', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('target_type').notNullable(); // post | comment | reel
    t.integer('target_id').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['user_id', 'target_type', 'target_id']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('likes');
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('posts');
  await knex.schema.dropTableIfExists('chamber_members');
  await knex.schema.dropTableIfExists('chambers');
}
