/**
 * Introduce explicit institution identity and academic placement.
 * Existing rows are assigned to a non-discoverable legacy tenant so the data
 * remains readable during migration review instead of being attributed to a
 * real institution based on unverified email/ID heuristics.
 * @param {import('knex').Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable('universities', (t) => {
    t.increments('id').primary();
    t.string('slug').notNullable().unique();
    t.string('name').notNullable();
    t.string('status').notNullable().defaultTo('provisioning'); // provisioning | active | suspended
    t.timestamps(true, true);
  });
  const [legacy] = await knex('universities').insert({
    slug: 'legacy-unassigned',
    name: 'Legacy records awaiting institution verification',
    status: 'provisioning',
  }).returning('id');
  const legacyId = legacy.id;

  await knex.schema.createTable('campuses', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('code');
    t.unique(['university_id', 'name']);
    t.unique(['university_id', 'code']);
    t.timestamps(true, true);
  });
  await knex.schema.createTable('departments', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('code');
    t.unique(['university_id', 'name']);
    t.unique(['university_id', 'code']);
    t.timestamps(true, true);
  });
  await knex.schema.createTable('programmes', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.string('name').notNullable();
    t.string('code');
    t.unique(['university_id', 'name']);
    t.unique(['university_id', 'code']);
    t.timestamps(true, true);
  });

  await knex.schema.alterTable('users', (t) => {
    t.integer('university_id').references('id').inTable('universities').onDelete('RESTRICT');
    t.integer('campus_id').references('id').inTable('campuses').onDelete('SET NULL');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('programme_id').references('id').inTable('programmes').onDelete('SET NULL');
    t.string('student_year');
  });
  await knex('users').update({ university_id: legacyId, student_year: knex.ref('year') });
  await knex.schema.alterTable('users', (t) => {
    t.integer('university_id').notNullable().defaultTo(legacyId).alter();
    t.dropUnique(['student_id']);
    t.unique(['university_id', 'student_id']);
    t.unique(['university_id', 'id']);
    t.index(['university_id', 'role', 'status']);
  });

  await knex.schema.alterTable('courses', (t) => {
    t.integer('university_id').references('id').inTable('universities').onDelete('RESTRICT');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('programme_id').references('id').inTable('programmes').onDelete('SET NULL');
  });
  await knex('courses').update({ university_id: legacyId });
  await knex.schema.alterTable('courses', (t) => {
    t.integer('university_id').notNullable().defaultTo(legacyId).alter();
    t.dropUnique(['code']);
    t.unique(['university_id', 'code']);
    t.unique(['university_id', 'id']);
    t.index(['university_id', 'department_id', 'programme_id']);
  });

  for (const table of ['notices', 'chambers', 'clubs', 'events', 'opportunities']) {
    await knex.schema.alterTable(table, (t) => {
      t.integer('university_id').references('id').inTable('universities').onDelete('RESTRICT');
    });
    await knex(table).update({ university_id: legacyId });
    await knex.schema.alterTable(table, (t) => {
      t.integer('university_id').notNullable().defaultTo(legacyId).alter();
      t.index(['university_id']);
    });
  }

  await knex.schema.alterTable('chambers', (t) => {
    t.string('visibility').notNullable().defaultTo('university'); // national | university | department | course
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('course_id').references('id').inTable('courses').onDelete('SET NULL');
  });
  await knex.schema.alterTable('notices', (t) => {
    t.string('visibility').notNullable().defaultTo('university');
    t.integer('department_id').references('id').inTable('departments').onDelete('SET NULL');
    t.integer('course_id').references('id').inTable('courses').onDelete('SET NULL');
  });
  await knex.schema.alterTable('clubs', (t) => {
    t.string('visibility').notNullable().defaultTo('university');
  });
  await knex.schema.alterTable('events', (t) => {
    t.string('visibility').notNullable().defaultTo('university');
  });
  await knex.schema.alterTable('opportunities', (t) => {
    // Historical records have unknown provenance; keep them institution-only
    // until an operator explicitly approves national distribution.
    t.string('visibility').notNullable().defaultTo('university');
  });
  for (const table of ['stories', 'reels']) {
    await knex.schema.alterTable(table, (t) => {
      t.string('visibility').notNullable().defaultTo('university');
    });
  }
  await knex.schema.alterTable('timetable_slots', (t) => t.index(['course_id', 'day_of_week'], 'timetable_course_day_idx'));
  await knex.schema.alterTable('exams', (t) => t.index(['course_id', 'exam_date'], 'exams_course_date_idx'));
  await knex.schema.alterTable('notices', (t) => t.index(['university_id', 'visibility', 'published_at'], 'notices_scope_date_idx'));
  await knex.schema.alterTable('posts', (t) => t.index(['chamber_id', 'created_at'], 'posts_chamber_created_idx'));
  await knex.schema.alterTable('comments', (t) => t.index(['post_id', 'created_at'], 'comments_post_created_idx'));
  await knex.schema.alterTable('documents', (t) => {
    t.index(['user_id', 'created_at'], 'documents_owner_created_idx');
    t.index(['course_id', 'visibility'], 'documents_course_visibility_idx');
  });
  await knex.schema.alterTable('chat_thread_members', (t) => t.index(['user_id', 'thread_id'], 'chat_members_user_thread_idx'));
  await knex.schema.alterTable('chat_messages', (t) => t.index(['thread_id', 'created_at'], 'chat_messages_thread_created_idx'));
  await knex.schema.alterTable('opportunities', (t) => t.index(['visibility', 'posted_at'], 'opportunities_visibility_posted_idx'));
  await knex.schema.alterTable('story_views', (t) => t.index(['viewer_id', 'story_id'], 'story_views_viewer_story_idx'));
  await knex.schema.alterTable('stories', (t) => t.index(['expires_at', 'visibility'], 'stories_expiry_visibility_idx'));
  await knex.schema.alterTable('reels', (t) => t.index(['visibility', 'created_at'], 'reels_visibility_created_idx'));
  await knex.schema.alterTable('projects', (t) => {
    t.integer('university_id').notNullable().defaultTo(legacyId).references('id').inTable('universities').onDelete('RESTRICT');
    t.string('visibility').notNullable().defaultTo('university');
    t.index(['visibility', 'university_id', 'created_at']);
  });
  await knex.schema.alterTable('chat_threads', (t) => {
    t.integer('university_id').notNullable().defaultTo(legacyId).references('id').inTable('universities').onDelete('RESTRICT');
    t.index(['university_id', 'updated_at']);
  });

  await knex.schema.createTable('student_course_enrollments', (t) => {
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.integer('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.string('academic_year').notNullable();
    t.string('term').notNullable();
    t.string('status').notNullable().defaultTo('active');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['student_id', 'course_id', 'academic_year', 'term']);
    t.index(['university_id', 'course_id', 'status']);
  });

  // Composite foreign keys make tenant mismatches impossible even if a future
  // service forgets to add an application-level university predicate.
  for (const table of ['campuses', 'departments', 'programmes']) {
    await knex.raw(`ALTER TABLE ?? ADD CONSTRAINT ?? UNIQUE (university_id, id)`, [table, `${table}_university_id_id_unique`]);
  }
  await knex.raw('ALTER TABLE users ADD CONSTRAINT users_campus_tenant_fk FOREIGN KEY (university_id, campus_id) REFERENCES campuses(university_id, id)');
  await knex.raw('ALTER TABLE users ADD CONSTRAINT users_department_tenant_fk FOREIGN KEY (university_id, department_id) REFERENCES departments(university_id, id)');
  await knex.raw('ALTER TABLE users ADD CONSTRAINT users_programme_tenant_fk FOREIGN KEY (university_id, programme_id) REFERENCES programmes(university_id, id)');
  await knex.raw('ALTER TABLE programmes ADD CONSTRAINT programmes_department_tenant_fk FOREIGN KEY (university_id, department_id) REFERENCES departments(university_id, id)');
  await knex.raw('ALTER TABLE courses ADD CONSTRAINT courses_department_tenant_fk FOREIGN KEY (university_id, department_id) REFERENCES departments(university_id, id)');
  await knex.raw('ALTER TABLE courses ADD CONSTRAINT courses_programme_tenant_fk FOREIGN KEY (university_id, programme_id) REFERENCES programmes(university_id, id)');
  await knex.raw('ALTER TABLE student_course_enrollments ADD CONSTRAINT enrollment_student_tenant_fk FOREIGN KEY (university_id, student_id) REFERENCES users(university_id, id) ON DELETE CASCADE');
  await knex.raw('ALTER TABLE student_course_enrollments ADD CONSTRAINT enrollment_course_tenant_fk FOREIGN KEY (university_id, course_id) REFERENCES courses(university_id, id) ON DELETE CASCADE');
  await knex.raw('ALTER TABLE chambers ADD CONSTRAINT chamber_department_tenant_fk FOREIGN KEY (university_id, department_id) REFERENCES departments(university_id, id)');
  await knex.raw('ALTER TABLE chambers ADD CONSTRAINT chamber_course_tenant_fk FOREIGN KEY (university_id, course_id) REFERENCES courses(university_id, id)');
  await knex.raw('ALTER TABLE notices ADD CONSTRAINT notice_department_tenant_fk FOREIGN KEY (university_id, department_id) REFERENCES departments(university_id, id)');
  await knex.raw('ALTER TABLE notices ADD CONSTRAINT notice_course_tenant_fk FOREIGN KEY (university_id, course_id) REFERENCES courses(university_id, id)');
  for (const table of ['notices', 'chambers']) {
    await knex.raw("ALTER TABLE ?? ADD CONSTRAINT ?? CHECK (visibility IN ('national', 'university', 'department', 'course'))", [table, `${table}_visibility_check`]);
  }
  for (const table of ['clubs', 'events', 'opportunities', 'stories', 'reels', 'projects']) {
    await knex.raw("ALTER TABLE ?? ADD CONSTRAINT ?? CHECK (visibility IN ('national', 'university'))", [table, `${table}_visibility_check`]);
  }

  // Explicit metadata for verified university identity/academic integrations.
  // Secrets live in a secret manager; only a reference is stored here.
  await knex.schema.createTable('university_integrations', (t) => {
    t.increments('id').primary();
    t.integer('university_id').notNullable().references('id').inTable('universities').onDelete('CASCADE');
    t.string('kind').notNullable(); // oidc | saml | sis_api | lms_api
    t.string('issuer');
    t.string('client_id');
    t.string('secret_reference');
    t.jsonb('configuration').notNullable().defaultTo('{}');
    t.string('status').notNullable().defaultTo('disabled');
    t.timestamps(true, true);
    t.unique(['university_id', 'kind', 'issuer']);
  });
}

/** @param {import('knex').Knex} knex */
export async function down(knex) {
  const tenantUse = await knex('universities').whereNot({ slug: 'legacy-unassigned' }).first('id');
  const enrollmentUse = await knex('student_course_enrollments').first('student_id');
  const integrationUse = await knex('university_integrations').first('id');
  if (tenantUse || enrollmentUse || integrationUse) {
    throw new Error('Refusing to roll back university schema after a real tenant, course enrollment, or integration was created; restore the pre-migration backup instead.');
  }
  await knex.schema.alterTable('timetable_slots', (t) => t.dropIndex(['course_id', 'day_of_week'], 'timetable_course_day_idx'));
  await knex.schema.alterTable('exams', (t) => t.dropIndex(['course_id', 'exam_date'], 'exams_course_date_idx'));
  await knex.schema.alterTable('notices', (t) => t.dropIndex(['university_id', 'visibility', 'published_at'], 'notices_scope_date_idx'));
  await knex.schema.alterTable('posts', (t) => t.dropIndex(['chamber_id', 'created_at'], 'posts_chamber_created_idx'));
  await knex.schema.alterTable('comments', (t) => t.dropIndex(['post_id', 'created_at'], 'comments_post_created_idx'));
  await knex.schema.alterTable('documents', (t) => {
    t.dropIndex(['user_id', 'created_at'], 'documents_owner_created_idx');
    t.dropIndex(['course_id', 'visibility'], 'documents_course_visibility_idx');
  });
  await knex.schema.alterTable('chat_thread_members', (t) => t.dropIndex(['user_id', 'thread_id'], 'chat_members_user_thread_idx'));
  await knex.schema.alterTable('chat_messages', (t) => t.dropIndex(['thread_id', 'created_at'], 'chat_messages_thread_created_idx'));
  await knex.schema.alterTable('opportunities', (t) => t.dropIndex(['visibility', 'posted_at'], 'opportunities_visibility_posted_idx'));
  await knex.schema.alterTable('story_views', (t) => t.dropIndex(['viewer_id', 'story_id'], 'story_views_viewer_story_idx'));
  await knex.schema.alterTable('stories', (t) => t.dropIndex(['expires_at', 'visibility'], 'stories_expiry_visibility_idx'));
  await knex.schema.alterTable('reels', (t) => t.dropIndex(['visibility', 'created_at'], 'reels_visibility_created_idx'));
  await knex.schema.dropTableIfExists('university_integrations');
  await knex.schema.dropTableIfExists('student_course_enrollments');
  await knex.schema.alterTable('projects', (t) => { t.dropColumn('university_id'); t.dropColumn('visibility'); });
  for (const table of ['stories', 'reels']) await knex.schema.alterTable(table, (t) => t.dropColumn('visibility'));
  await knex.schema.alterTable('chat_threads', (t) => t.dropColumn('university_id'));
  for (const table of ['opportunities', 'events', 'clubs', 'chambers', 'notices']) {
    await knex.schema.alterTable(table, (t) => {
      if (table === 'chambers') {
        t.dropColumn('visibility');
        t.dropColumn('department_id');
        t.dropColumn('course_id');
      } else if (table === 'notices') {
        t.dropColumn('visibility');
        t.dropColumn('department_id');
        t.dropColumn('course_id');
      } else {
        t.dropColumn('visibility');
      }
      t.dropColumn('university_id');
    });
  }
  await knex.schema.alterTable('courses', (t) => {
    t.dropUnique(['university_id', 'code']);
    t.unique(['code']);
    t.dropColumn('university_id');
    t.dropColumn('department_id');
    t.dropColumn('programme_id');
  });
  await knex.schema.alterTable('users', (t) => {
    t.dropUnique(['university_id', 'student_id']);
    t.unique(['student_id']);
    t.dropColumn('university_id');
    t.dropColumn('campus_id');
    t.dropColumn('department_id');
    t.dropColumn('programme_id');
    t.dropColumn('student_year');
  });
  await knex.schema.dropTableIfExists('programmes');
  await knex.schema.dropTableIfExists('departments');
  await knex.schema.dropTableIfExists('campuses');
  await knex.schema.dropTableIfExists('universities');
}
