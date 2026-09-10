/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.string('username').unique();
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('username');
  });
}
