/**
 * Multi-tenant foundation (C1).
 *
 * Adds the university → campus → department → programme hierarchy and attaches
 * a `university_id` to the tenant-owned tables that carry the most sensitive
 * cross-institution data (roster + academics). Columns are added NULLABLE and
 * backfilled to a default "iCollege University" so existing data and the running
 * app keep working; a later migration can enforce NOT NULL once every write path
 * sets them. Social content (chambers/posts/reels) is intentionally national and
 * is scoped separately in the social-layer phases.
 *
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('universities', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('slug').notNullable().unique();
    t.string('short_name');
    t.specificType('email_domains', 'text[]').notNullable().defaultTo('{}'); // verified signup domains
    t.string('country').defaultTo('Tanzania');
    t.string('color_key').defaultTo('primary');
    t.string('logo_url');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('campuses', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('location');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('departments', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('code');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('programmes', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.string('name').notNullable();
    t.string('code');
    t.integer('duration_years').defaultTo(4);
    t.timestamps(true, true);
  });

  // --- tenant columns on roster + academic tables (nullable, backfilled below) ---
  await knex.schema.alterTable('users', (t) => {
    t.integer('university_id').references('id').inTable('universities').onDelete('SET NULL').index();
    t.integer('campus_id').references('id').inTable('campuses').onDelete('SET NULL');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('programme_id').references('id').inTable('programmes').onDelete('SET NULL');
  });

  await knex.schema.alterTable('courses', (t) => {
    t.integer('university_id').references('id').inTable('universities').onDelete('CASCADE').index();
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
  });

  await knex.schema.alterTable('notices', (t) => {
    t.integer('university_id').references('id').inTable('universities').onDelete('CASCADE').index();
    t.string('scope').notNullable().defaultTo('university'); // national | university | department | course
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('course_id').references('id').inTable('courses').onDelete('SET NULL');
  });

  // --- backfill: existing single tenant ---
  const [uni] = await knex('universities')
    .insert({
      name: 'iCollege University',
      slug: 'icollege-university',
      short_name: 'ICU',
      email_domains: ['icu.ac.tz', 'student.icu.ac.tz'],
      country: 'Tanzania',
      color_key: 'primary',
    })
    .returning('id');
  const universityId = uni.id;

  await knex('users').update({ university_id: universityId });
  await knex('courses').update({ university_id: universityId });
  await knex('notices').update({ university_id: universityId, scope: 'university' });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.alterTable('notices', (t) => {
    t.dropColumn('university_id');
    t.dropColumn('scope');
    t.dropColumn('department_id');
    t.dropColumn('course_id');
  });
  await knex.schema.alterTable('courses', (t) => {
    t.dropColumn('university_id');
    t.dropColumn('department_id');
  });
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('university_id');
    t.dropColumn('campus_id');
    t.dropColumn('department_id');
    t.dropColumn('programme_id');
  });
  await knex.schema.dropTableIfExists('programmes');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('campuses');
  await knex.schema.dropTableIfExists('universities');
}
