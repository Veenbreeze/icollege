/** @param {import('knex').Knex} knex */
export async function up(knex) {
  // A user's registered push tokens (one row per device). Upserted on token.
  await knex.schema.createTable('device_tokens', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token').notNullable().unique();
    t.string('platform').notNullable().defaultTo('unknown'); // ios | android | web
    t.timestamps(true, true);
  });

  // In-app notification feed. The rule engine inserts one row per recipient;
  // an Expo push is attempted best-effort alongside (see notificationService).
  await knex.schema.createTable('notifications', (t) => {
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
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('device_tokens');
}
