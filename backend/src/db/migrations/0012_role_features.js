/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('lecture_updates', (t) => {
    t.increments('id').primary();
    t.integer('timetable_slot_id').notNullable().references('id').inTable('timetable_slots').onDelete('CASCADE');
    t.date('date').notNullable();
    t.string('status').notNullable(); // held | cancelled | moved
    t.text('note');
    t.integer('updated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('timetable_change_requests', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.integer('lecturer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.text('message').notNullable();
    t.string('status').notNullable().defaultTo('pending'); // pending | approved | rejected
    t.text('admin_note');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('club_announcements', (t) => {
    t.increments('id').primary();
    t.integer('club_id').notNullable().references('id').inTable('clubs').onDelete('CASCADE');
    t.integer('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('body');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('competitions', (t) => {
    t.increments('id').primary();
    t.string('host_type').notNullable(); // club | employer | platform
    t.integer('host_id'); // clubs.id | companies.id | null for platform
    t.string('title').notNullable();
    t.text('description');
    t.date('start_date');
    t.date('end_date');
    t.integer('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('competition_participants', (t) => {
    t.integer('competition_id').notNullable().references('id').inTable('competitions').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['competition_id', 'user_id']);
  });

  await knex.schema.alterTable('documents', (t) => {
    t.string('visibility').notNullable().defaultTo('private'); // private | course
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.alterTable('documents', (t) => {
    t.dropColumn('visibility');
  });
  await knex.schema.dropTableIfExists('competition_participants');
  await knex.schema.dropTableIfExists('competitions');
  await knex.schema.dropTableIfExists('club_announcements');
  await knex.schema.dropTableIfExists('timetable_change_requests');
  await knex.schema.dropTableIfExists('lecture_updates');
}
