/**
 * Academic notifications — notice/lecture alerts + device push tokens.
 * Kept separate from the social `notifications` table (0014): different schema
 * (content-based title/body vs actor→target references) and different purpose.
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  // A user's registered push tokens (one row per device). Upserted on token.
  await knex.schema.createTable('device_tokens', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token').notNullable().unique();
    t.string('platform').notNullable().defaultTo('unknown'); // ios | android | web
    t.timestamps(true, true);
  });

  // Academic notification feed (notice published, lecture cancelled/moved).
  await knex.schema.createTable('academic_notifications', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('body');
    t.string('type').notNullable().defaultTo('general'); // notice | lecture | general
    t.boolean('read').notNullable().defaultTo(false);
    t.string('deep_link');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['user_id', 'read']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('academic_notifications');
  await knex.schema.dropTableIfExists('device_tokens');
}
