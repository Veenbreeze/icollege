/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('clubs', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('category');
    t.string('emoji');
    t.string('color_key');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('club_members', (t) => {
    t.integer('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['club_id', 'user_id']);
  });

  await knex.schema.createTable('events', (t) => {
    t.increments('id').primary();
    t.integer('club_id').references('id').inTable('clubs').onDelete('SET NULL');
    t.string('title').notNullable();
    t.string('host_name');
    t.string('type');
    t.date('event_date').notNullable();
    t.string('event_time');
    t.string('venue');
    t.string('emoji');
    t.string('color_key');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('event_registrations', (t) => {
    t.integer('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('registered_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['event_id', 'user_id']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('event_registrations');
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('club_members');
  await knex.schema.dropTableIfExists('clubs');
}
