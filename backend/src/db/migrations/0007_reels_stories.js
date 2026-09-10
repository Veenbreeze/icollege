/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('stories', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('media_url');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable();
  });

  await knex.schema.createTable('story_views', (t) => {
    t.integer('story_id').notNullable().references('id').inTable('stories').onDelete('CASCADE');
    t.integer('viewer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('viewed_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['story_id', 'viewer_id']);
  });

  await knex.schema.createTable('reels', (t) => {
    t.increments('id').primary();
    t.integer('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('chamber_id').references('id').inTable('chambers').onDelete('SET NULL');
    t.text('caption');
    t.string('media_url');
    t.string('music_label');
    t.string('bg_color');
    t.string('emoji');
    t.integer('shares_count').notNullable().defaultTo(0);
    t.timestamps(true, true);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('reels');
  await knex.schema.dropTableIfExists('story_views');
  await knex.schema.dropTableIfExists('stories');
}
