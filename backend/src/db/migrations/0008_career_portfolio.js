/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('opportunities', (t) => {
    t.increments('id').primary();
    t.string('role').notNullable();
    t.string('company').notNullable();
    t.string('logo_emoji');
    t.string('type').notNullable();
    t.string('category').notNullable();
    t.string('location');
    t.string('mode');
    t.string('pay');
    t.timestamp('posted_at').notNullable().defaultTo(knex.fn.now());
    t.date('deadline');
    t.specificType('tags', 'text[]').notNullable().defaultTo('{}');
    t.boolean('verified').notNullable().defaultTo(false);
    t.string('color_key');
    t.text('about');
    t.specificType('responsibilities', 'text[]').notNullable().defaultTo('{}');
    t.specificType('requirements', 'text[]').notNullable().defaultTo('{}');
  });

  await knex.schema.createTable('projects', (t) => {
    t.increments('id').primary();
    t.integer('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('tagline');
    t.string('status').notNullable().defaultTo('Recruiting');
    t.specificType('skills', 'text[]').notNullable().defaultTo('{}');
    t.integer('needed_count').notNullable().defaultTo(0);
    t.string('emoji');
    t.string('color_key');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('project_members', (t) => {
    t.integer('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('role').notNullable().defaultTo('member');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['project_id', 'user_id']);
  });

  await knex.schema.createTable('user_skills', (t) => {
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('skill').notNullable();
    t.primary(['user_id', 'skill']);
  });

  await knex.schema.createTable('user_experience', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('role').notNullable();
    t.string('org').notNullable();
    t.string('period');
    t.text('description');
    t.string('color_key');
  });

  await knex.schema.createTable('user_certifications', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('issuer');
    t.string('year');
    t.string('color_key');
  });

  await knex.schema.createTable('user_competitions', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('result');
    t.string('year');
    t.string('color_key');
  });

  await knex.schema.createTable('user_education', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('school').notNullable();
    t.string('degree');
    t.string('period');
    t.string('color_key');
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('user_education');
  await knex.schema.dropTableIfExists('user_competitions');
  await knex.schema.dropTableIfExists('user_certifications');
  await knex.schema.dropTableIfExists('user_experience');
  await knex.schema.dropTableIfExists('user_skills');
  await knex.schema.dropTableIfExists('project_members');
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('opportunities');
}
