/** @param {import('knex').Knex} knex */
export async function up(knex) {
  await knex.schema.createTable('courses', (t) => {
    t.increments('id').primary();
    t.string('code').notNullable().unique();
    t.string('title').notNullable();
    t.string('lecturer_name');
    t.string('icon');
    t.string('color_key');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('timetable_slots', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.integer('day_of_week').notNullable(); // 0=Sun..6=Sat
    t.string('start_time').notNullable(); // '08:00'
    t.string('end_time').notNullable();
    t.string('room');
    t.string('type').notNullable().defaultTo('Lecture');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('exams', (t) => {
    t.increments('id').primary();
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.string('type').notNullable().defaultTo('Final');
    t.date('exam_date').notNullable();
    t.string('exam_time').notNullable();
    t.string('duration');
    t.string('venue');
    t.string('room');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('exam_seats', (t) => {
    t.increments('id').primary();
    t.integer('exam_id').notNullable().references('id').inTable('exams').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('seat_row').notNullable();
    t.integer('seat_col').notNullable();
    t.string('seat_label').notNullable();
    t.unique(['exam_id', 'user_id']);
  });

  await knex.schema.createTable('notices', (t) => {
    t.increments('id').primary();
    t.string('title').notNullable();
    t.text('body').notNullable();
    t.string('category').notNullable();
    t.string('priority').notNullable().defaultTo('Normal');
    t.string('icon');
    t.string('color_key');
    t.timestamp('published_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('notice_reads', (t) => {
    t.integer('notice_id').notNullable().references('id').inTable('notices').onDelete('CASCADE');
    t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.timestamp('read_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['notice_id', 'user_id']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  await knex.schema.dropTableIfExists('notice_reads');
  await knex.schema.dropTableIfExists('notices');
  await knex.schema.dropTableIfExists('exam_seats');
  await knex.schema.dropTableIfExists('exams');
  await knex.schema.dropTableIfExists('timetable_slots');
  await knex.schema.dropTableIfExists('courses');
}
