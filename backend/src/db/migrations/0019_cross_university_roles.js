/**
 * platform_admin and employer are cross-university roles: a platform admin
 * oversees every institution, and an employer hires from any of them. The 0016
 * backfill set every user to the default university; this un-scopes those two
 * roles (university_id = NULL) so admin-console scoping treats them as global.
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex('users').whereIn('role', ['platform_admin', 'employer']).update({ university_id: null });
}

/** @param {import('knex').Knex} knex — irreversible data normalization; no-op down. */
export async function down() {}
