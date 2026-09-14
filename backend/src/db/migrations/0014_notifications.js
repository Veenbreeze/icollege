/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('notifications', (t) => {
    t.increments('id').primary();
    t.integer('recipient_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('actor_id').references('id').inTable('users').onDelete('CASCADE');
    t.string('type').notNullable(); // like | comment | share | new_post | new_reel | new_story
    t.string('target_type').notNullable(); // post | reel | story | comment
    t.integer('target_id').notNullable();
    t.boolean('read').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['recipient_id', 'read']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('notifications');
}
