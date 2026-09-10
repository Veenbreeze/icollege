/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('opportunity_saves', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    t.timestamp('saved_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['user_id', 'opportunity_id']);
  });

  await knex.schema.createTable('opportunity_applications', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('opportunity_id').notNullable().references('id').inTable('opportunities').onDelete('CASCADE');
    t.timestamp('applied_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['user_id', 'opportunity_id']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('opportunity_applications');
  await knex.schema.dropTableIfExists('opportunity_saves');
}
