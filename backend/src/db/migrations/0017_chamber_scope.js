/**
 * Social-layer scoping (Phases 9/10).
 *
 * Chambers gain a visibility `scope`:
 *   - 'national'   → the cross-university social layer (technology, business, sports…)
 *   - 'university' → a community visible only within one university (university_id)
 *
 * Posts and reels inherit their chamber's scope (they live in a chamber), so no
 * extra column is needed on them. Existing chambers are general-interest and become
 * national. @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.alterTable('chambers', (t) => {
    t.string('scope').notNullable().defaultTo('national'); // national | university
    t.integer('university_id').references('id').inTable('universities').onDelete('CASCADE');
  });
  await knex('chambers').update({ scope: 'national' });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.alterTable('chambers', (t) => {
    t.dropColumn('scope');
    t.dropColumn('university_id');
  });
}
