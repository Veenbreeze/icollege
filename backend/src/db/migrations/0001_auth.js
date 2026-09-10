/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('student_id').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('full_name').notNullable();
    t.string('email');
    t.string('phone');
    t.string('year');
    t.string('programme');
    t.string('avatar_url');
    t.integer('success_score').notNullable().defaultTo(0);
    t.string('role').notNullable().defaultTo('student');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('profiles', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    t.string('headline');
    t.string('location');
    t.text('about');
    t.boolean('open_to_opportunities').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('refresh_tokens', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash').notNullable();
    t.timestamp('expires_at').notNullable();
    t.timestamp('revoked_at');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('password_reset_tokens', (t) => {
    t.increments('id').primary();
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('code_hash').notNullable();
    t.timestamp('expires_at').notNullable();
    t.timestamp('used_at');
    t.timestamps(true, true);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('password_reset_tokens');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('profiles');
  await knex.schema.dropTableIfExists('users');
}
