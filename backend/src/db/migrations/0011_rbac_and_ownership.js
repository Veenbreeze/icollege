/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('companies', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('slug').notNullable().unique();
    t.text('description');
    t.string('website');
    t.string('logo_url');
    t.boolean('verified').notNullable().defaultTo(false);
    t.integer('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);
  });

  await knex.schema.alterTable('users', (t) => {
    t.string('status').notNullable().defaultTo('active'); // pending | active | suspended
    t.integer('company_id').references('id').inTable('companies').onDelete('SET NULL');
  });

  await knex.schema.alterTable('clubs', (t) => {
    t.integer('owner_id').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.alterTable('courses', (t) => {
    t.integer('lecturer_id').references('id').inTable('users').onDelete('SET NULL');
  });

  await knex.schema.alterTable('opportunities', (t) => {
    t.integer('posted_by').references('id').inTable('users').onDelete('SET NULL');
    t.integer('company_id').references('id').inTable('companies').onDelete('SET NULL');
  });

  await knex.schema.createTable('audit_logs', (t) => {
    t.increments('id').primary();
    t.integer('actor_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('action').notNullable();
    t.string('target_type');
    t.integer('target_id');
    t.jsonb('meta');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('platform_settings', (t) => {
    t.increments('id').primary();
    t.string('institution_name').notNullable().defaultTo('iCollege University');
    t.string('subscription_plan').notNullable().defaultTo('standard');
    t.string('subscription_status').notNullable().defaultTo('active');
    t.integer('updated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('platform_settings');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.alterTable('opportunities', (t) => {
    t.dropColumn('posted_by');
    t.dropColumn('company_id');
  });
  await knex.schema.alterTable('courses', (t) => {
    t.dropColumn('lecturer_id');
  });
  await knex.schema.alterTable('clubs', (t) => {
    t.dropColumn('owner_id');
  });
  await knex.schema.alterTable('users', (t) => {
    t.dropColumn('status');
    t.dropColumn('company_id');
  });
  await knex.schema.dropTableIfExists('companies');
}
