import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Password123!';

const TABLES_IN_DEPENDENCY_ORDER = [
  'quiz_questions', 'flashcards',
  'user_education', 'user_competitions', 'user_certifications', 'user_experience', 'user_skills',
  'project_members', 'projects', 'opportunities',
  'reels', 'story_views', 'stories',
  'competition_participants', 'competitions',
  'club_announcements',
  'event_registrations', 'events', 'club_members', 'clubs',
  'chat_messages', 'chat_thread_members', 'chat_threads',
  'likes', 'comments', 'posts', 'chamber_members', 'chambers',
  'documents',
  'notice_reads', 'notices',
  'lecture_updates', 'timetable_change_requests',
  'exam_seats', 'exams', 'timetable_slots', 'courses',
  'audit_logs', 'platform_settings',
  'password_reset_tokens', 'refresh_tokens', 'profiles', 'users', 'companies',
];

/** @param {import('knex').Knex} knex */
export async function seed(knex) {
  for (const table of TABLES_IN_DEPENDENCY_ORDER) {
    await knex(table).del();
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [daniel, neema, samuel, rehema, brian, aisha, kevin, innovationClub] = await knex('users')
    .insert([
      { student_id: 'ICU/2024/00458', password_hash: passwordHash, full_name: 'Daniel Mwakideu', email: 'daniel@student.icu.ac.tz', phone: '+255 711 000 001', year: 'Year 2', programme: 'BSc Computer Science', success_score: 720, role: 'student' },
      { student_id: 'ICU/2023/00112', password_hash: passwordHash, full_name: 'Neema John', email: 'neema@student.icu.ac.tz', phone: '+255 711 000 002', year: 'Year 3', programme: 'BSc Economics', success_score: 640, role: 'student' },
      { student_id: 'ICU/2022/00087', password_hash: passwordHash, full_name: 'Samuel Peter', email: 'samuel@student.icu.ac.tz', phone: '+255 711 000 003', year: 'Year 2', programme: 'BSc Economics', success_score: 580, role: 'student' },
      { student_id: 'STAFF/00019', password_hash: passwordHash, full_name: 'Dr. Rehema Salum', email: 'rehema.salum@icu.ac.tz', phone: '+255 711 000 004', year: null, programme: 'Lecturer, Computer Science', success_score: 0, role: 'lecturer' },
      { student_id: 'ICU/2023/00201', password_hash: passwordHash, full_name: 'Brian Mrema', email: 'brian@student.icu.ac.tz', phone: '+255 711 000 005', year: 'Year 3', programme: 'BSc Economics', success_score: 610, role: 'student' },
      { student_id: 'ICU/2024/00305', password_hash: passwordHash, full_name: 'Aisha Khamis', email: 'aisha@student.icu.ac.tz', phone: '+255 711 000 006', year: 'Year 2', programme: 'BSc Economics', success_score: 590, role: 'student' },
      { student_id: 'ICU/2021/00044', password_hash: passwordHash, full_name: 'Kevin Mushi', email: 'kevin@student.icu.ac.tz', phone: '+255 711 000 007', year: 'Year 4', programme: 'BSc Computer Science', success_score: 700, role: 'student' },
      { student_id: 'CLUB/INNOV01', password_hash: passwordHash, full_name: 'Innovation Club', email: 'innovation.club@icu.ac.tz', phone: null, year: null, programme: 'Student Club', success_score: 0, role: 'club_admin' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  // Reviewer test account — separate password from the shared demo one above.
  await knex('users').insert({
    student_id: '32162/T.2023',
    password_hash: await bcrypt.hash('Mpambije', 10),
    full_name: 'Victor Mpambije',
    email: 'victor.mpambije@student.aru.ac.tz',
    phone: null,
    year: 'Year 2',
    programme: 'BSc Land Management and Valuation',
    success_score: 0,
    role: 'student',
  });

  // Demo company + non-student roles (platform_admin is pre-approved so there's
  // always an account able to approve everyone else's pending signups).
  const [zuriTech] = await knex('companies')
    .insert({ name: 'Zuri Technologies', slug: 'zuri-technologies', description: 'A Dar es Salaam-based fintech scale-up hiring student talent for internships and graduate roles.', website: 'https://zuritech.example.com', verified: true })
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  const [platformAdmin, universityAdmin, employer] = await knex('users')
    .insert([
      { student_id: 'PLATFORM/ADMIN01', password_hash: passwordHash, full_name: 'Asha Shirima', email: 'asha.shirima@icollege.app', role: 'platform_admin', status: 'active', success_score: 0 },
      { student_id: 'ADMIN/UNI01', password_hash: passwordHash, full_name: 'Prof. James Massawe', email: 'james.massawe@icu.ac.tz', role: 'university_admin', status: 'active', success_score: 0 },
      { student_id: 'EMP/ZURI01', password_hash: passwordHash, full_name: 'Lilian Mnyika', email: 'lilian@zuritech.example.com', role: 'employer', status: 'active', company_id: zuriTech, success_score: 0 },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('companies').where({ id: zuriTech }).update({ created_by: employer });

  // Pending signup, for testing the admin approval flow end to end.
  await knex('users').insert({
    student_id: 'STAFF/00088',
    password_hash: passwordHash,
    full_name: 'Dr. Peter Lyimo',
    email: 'peter.lyimo@icu.ac.tz',
    role: 'lecturer',
    status: 'pending',
    success_score: 0,
  });

  await knex('platform_settings').insert({
    institution_name: 'iCollege University',
    subscription_plan: 'standard',
    subscription_status: 'active',
    updated_by: platformAdmin,
  });

  await knex('profiles').insert({
    user_id: daniel,
    headline: 'CS Student · Mobile Developer · AI Enthusiast',
    location: 'Dar es Salaam, Tanzania',
    about: 'Second-year Computer Science student passionate about building mobile apps that solve real campus problems. Currently exploring React Native and applied AI.',
    open_to_opportunities: true,
  });

  const [csc101, csc203, acc201, mat104] = await knex('courses')
    .insert([
      { code: 'CSC 101', title: 'Introduction to Programming', lecturer_name: 'Dr. John Kimaro', icon: 'desktop-outline', color_key: 'primary' },
      { code: 'CSC 203', title: 'Database Systems', lecturer_name: 'Dr. Rehema Salum', icon: 'server-outline', color_key: 'blue' },
      { code: 'ACC 201', title: 'Financial Accounting', lecturer_name: 'Prof. Kelvin Temba', icon: 'calculator-outline', color_key: 'orange' },
      { code: 'MAT 104', title: 'Discrete Mathematics', lecturer_name: 'Dr. Susan Sanga', icon: 'shapes-outline', color_key: 'green' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('courses').where({ id: csc203 }).update({ lecturer_id: rehema });

  await knex('timetable_slots').insert([
    { course_id: csc101, day_of_week: 2, start_time: '08:00', end_time: '09:30', room: 'Block C, Room C301', type: 'Lecture' },
    { course_id: csc203, day_of_week: 2, start_time: '10:00', end_time: '12:00', room: 'Block D, Room D204', type: 'Lecture' },
    { course_id: acc201, day_of_week: 2, start_time: '14:00', end_time: '16:00', room: 'Block A, Room A102', type: 'Lecture' },
    { course_id: mat104, day_of_week: 4, start_time: '11:00', end_time: '12:30', room: 'Block C, Room C301', type: 'Lecture' },
  ]);

  const [examCsc203] = await knex('exams')
    .insert([
      { course_id: csc203, type: 'Final', exam_date: '2026-09-19', exam_time: '09:00 AM', duration: '2h', venue: 'Main Exam Hall', room: 'Hall A' },
      { course_id: csc101, type: 'Final', exam_date: '2026-09-22', exam_time: '02:00 PM', duration: '2h', venue: 'Main Exam Hall', room: 'Hall B' },
      { course_id: acc201, type: 'Final', exam_date: '2026-09-24', exam_time: '09:00 AM', duration: '3h', venue: 'Block A', room: 'A102' },
      { course_id: mat104, type: 'Final', exam_date: '2026-09-27', exam_time: '11:00 AM', duration: '2h', venue: 'Block C', room: 'C301' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('exam_seats').insert({ exam_id: examCsc203, user_id: daniel, seat_row: 4, seat_col: 12, seat_label: 'R4 · S12' });

  await knex('notices').insert([
    { title: 'Final Exam Timetable Released', body: 'The final examination timetable for Semester 2 is now available. Check your exam schedule and seating.', category: 'Exams', priority: 'Critical', icon: 'document-text-outline', color_key: 'red' },
    { title: 'Lecture Postponed: Financial Accounting', body: 'ACC 201 lecture moved from 2:00 PM today to tomorrow 10:00 AM.', category: 'Timetable', priority: 'Important', icon: 'time-outline', color_key: 'orange' },
    { title: 'Library Workshop Tomorrow', body: 'Research skills & referencing workshop at the Main Library, 11:00 AM. Open to all students.', category: 'Academic', priority: 'Normal', icon: 'book-outline', color_key: 'blue' },
    { title: 'Career Fair 2026 Registration Open', body: 'Meet 40+ employers. Register early to book interview slots with top companies.', category: 'Career', priority: 'Important', icon: 'briefcase-outline', color_key: 'green' },
    { title: 'Innovation Club Meetup', body: 'Weekly meetup this Friday at 5:00 PM, Block D. New members welcome.', category: 'Events', priority: 'Normal', icon: 'people-outline', color_key: 'primary' },
    { title: 'Fee Payment Deadline Reminder', body: 'Semester 2 fee balance is due by 30 September to avoid exam card blocking.', category: 'Academic', priority: 'Critical', icon: 'card-outline', color_key: 'red' },
  ]);

  const csc203Slot = await knex('timetable_slots').where({ course_id: csc203 }).first('id');
  await knex('lecture_updates').insert({
    timetable_slot_id: csc203Slot.id,
    date: '2026-09-15',
    status: 'moved',
    note: 'Moved to Block D, Room D204 for this week only.',
    updated_by: rehema,
  });
  await knex('timetable_change_requests').insert({
    course_id: csc203,
    lecturer_id: rehema,
    message: 'Requesting to swap CSC 203 to Thursday 10:00 AM. It clashes with a faculty meeting on Tuesdays this semester.',
    status: 'pending',
  });

  const [education, economics, finance, social, music] = await knex('chambers')
    .insert([
      { slug: 'education', name: 'Education', tagline: 'Learn. Share. Grow.', description: 'A community for students passionate about learning and teaching.', theme_key: 'education', emoji: '🎓' },
      { slug: 'economics', name: 'Economics', tagline: 'Learn. Discuss. Grow.', description: 'A community for students passionate about economics, business, markets and development.', theme_key: 'economics', emoji: '📈' },
      { slug: 'finance', name: 'Finance', tagline: 'Invest in knowledge.', description: 'Everything money, markets and personal finance for students.', theme_key: 'finance', emoji: '💰' },
      { slug: 'social', name: 'Social Life', tagline: 'Connect. Belong.', description: 'Campus life, events and making friends.', theme_key: 'social', emoji: '👥' },
      { slug: 'music', name: 'Music', tagline: 'Feel the sound.', description: 'For music lovers, creators and performers on campus.', theme_key: 'music', emoji: '🎧' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('chamber_members').insert([
    { chamber_id: education, user_id: daniel },
    { chamber_id: economics, user_id: daniel },
    { chamber_id: economics, user_id: neema, role: 'top_contributor' },
    { chamber_id: economics, user_id: samuel },
    { chamber_id: economics, user_id: brian },
    { chamber_id: economics, user_id: aisha },
    { chamber_id: economics, user_id: kevin },
    { chamber_id: economics, user_id: rehema, role: 'lecturer' },
  ]);

  const [postInflation, postWorldBank] = await knex('posts')
    .insert([
      { author_id: neema, chamber_id: economics, tag: 'question', title: 'How does inflation affect interest rates?', body: "Can someone explain the relationship between inflation and interest rates? I'm preparing for my macroeconomics exam." },
      { author_id: samuel, chamber_id: economics, tag: 'news', title: "World Bank: Africa's Economy to Grow by 3.5% in 2026", body: 'New report projects steady growth across sub-Saharan economies driven by services and technology.' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('comments').insert([
    { post_id: postInflation, author_id: rehema, body: 'When inflation rises, central banks typically raise interest rates to cool spending. Higher rates make borrowing costlier, which reduces demand and helps bring prices back down.', best: true },
    { post_id: postInflation, author_id: brian, body: 'Think of it as the price of money. Inflation high → money loses value → rates go up to protect it.' },
    { post_id: postInflation, author_id: aisha, body: 'This helped me so much for my exam prep, thank you! 🙏' },
    { post_id: postWorldBank, author_id: kevin, body: 'Great news for the region. Services and tech are really driving this growth.' },
  ]);

  const [threadGroup, threadNeema, threadClub, threadSamuel] = await knex('chat_threads')
    .insert([
      { is_group: true, name: 'CSC 203 Group' },
      { is_group: false, name: null },
      { is_group: true, name: 'Innovation Club' },
      { is_group: false, name: null },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('chat_thread_members').insert([
    { thread_id: threadGroup, user_id: daniel }, { thread_id: threadGroup, user_id: rehema }, { thread_id: threadGroup, user_id: neema },
    { thread_id: threadNeema, user_id: daniel }, { thread_id: threadNeema, user_id: neema },
    { thread_id: threadClub, user_id: daniel }, { thread_id: threadClub, user_id: innovationClub },
    { thread_id: threadSamuel, user_id: daniel }, { thread_id: threadSamuel, user_id: samuel },
  ]);

  await knex('chat_messages').insert([
    { thread_id: threadGroup, sender_id: rehema, body: 'Reminder: our lab session is today.' },
    { thread_id: threadGroup, sender_id: rehema, body: 'The lab has been moved to D204 instead of D201.' },
    { thread_id: threadGroup, sender_id: daniel, body: 'Noted, thank you Doctor 🙏' },
    { thread_id: threadGroup, sender_id: neema, body: 'Does anyone have the SQL join notes from last week?' },
    { thread_id: threadGroup, sender_id: daniel, body: "Yes! I'll share them in iVault shortly." },
    { thread_id: threadGroup, sender_id: neema, body: "You're a lifesaver 🙌" },

    { thread_id: threadNeema, sender_id: neema, body: 'Hey! Did you finish the assignment?' },
    { thread_id: threadNeema, sender_id: daniel, body: 'Almost, just the last question left.' },
    { thread_id: threadNeema, sender_id: neema, body: 'Same here 😅 want to compare answers?' },
    { thread_id: threadNeema, sender_id: daniel, body: 'Sure, sending mine now.' },
    { thread_id: threadNeema, sender_id: neema, body: 'Thanks for the notes! 🙌' },

    { thread_id: threadClub, sender_id: innovationClub, body: 'Weekly meetup this Friday at 5pm 🚀' },
    { thread_id: threadClub, sender_id: innovationClub, body: "We'll be planning the hackathon." },
    { thread_id: threadClub, sender_id: daniel, body: 'Count me in!' },

    { thread_id: threadSamuel, sender_id: samuel, body: 'Did you register for iCompete?' },
    { thread_id: threadSamuel, sender_id: daniel, body: 'Not yet, is the deadline soon?' },
    { thread_id: threadSamuel, sender_id: samuel, body: 'This Friday. You should join the coding challenge!' },
  ]);

  const [clubTech, clubDebate, clubEntrepreneur, clubPhoto] = await knex('clubs')
    .insert([
      { name: 'Innovation & Tech Club', category: 'Technology', emoji: '💡', color_key: 'primary' },
      { name: 'Debate Society', category: 'Public Speaking', emoji: '🎙️', color_key: 'orange' },
      { name: 'Entrepreneurship Hub', category: 'Business', emoji: '🚀', color_key: 'green' },
      { name: 'Photography Club', category: 'Creative', emoji: '📷', color_key: 'blue' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('clubs').where({ id: clubTech }).update({ owner_id: innovationClub });

  await knex('club_members').insert([
    { club_id: clubTech, user_id: daniel }, { club_id: clubTech, user_id: kevin },
    { club_id: clubEntrepreneur, user_id: daniel },
    { club_id: clubDebate, user_id: brian },
    { club_id: clubPhoto, user_id: aisha },
  ]);

  const [eventSummit, eventCareerFair, eventDebate] = await knex('events')
    .insert([
      { club_id: clubTech, title: 'Annual Tech Summit 2026', host_name: 'Innovation & Tech Club', type: 'Conference', event_date: '2026-09-23', event_time: '10:00 AM', venue: 'Main Auditorium', emoji: '🚀', color_key: 'primary' },
      { club_id: null, title: 'Career Fair & Networking', host_name: 'Career Services', type: 'Career Fair', event_date: '2026-09-28', event_time: '09:00 AM', venue: 'Sports Complex', emoji: '💼', color_key: 'green' },
      { club_id: clubDebate, title: 'Inter-University Debate', host_name: 'Debate Society', type: 'Competition', event_date: '2026-10-03', event_time: '02:00 PM', venue: 'Lecture Hall 3', emoji: '🎙️', color_key: 'orange' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('event_registrations').insert([{ event_id: eventCareerFair, user_id: daniel }]);

  await knex('club_announcements').insert({
    club_id: clubTech,
    author_id: innovationClub,
    title: 'Hackathon registration is open!',
    body: 'Sign up for the 48-hour campus hackathon by Friday. Teams of up to 4, prizes for top 3.',
  });

  await knex('competitions').insert([
    { host_type: 'club', host_id: clubTech, title: 'Campus Hackathon 2026', description: '48-hour build sprint. Open to all students.', start_date: '2026-10-10', end_date: '2026-10-12', created_by: innovationClub },
    { host_type: 'employer', host_id: zuriTech, title: 'Zuri Fintech Challenge', description: 'Build a personal-finance feature prototype. Winners get fast-tracked internship interviews.', start_date: '2026-10-20', end_date: '2026-11-05', created_by: employer },
    { host_type: 'platform', host_id: null, title: 'iCollege Cross-University Coding Cup', description: 'Platform-wide competitive programming contest.', start_date: '2026-11-01', end_date: '2026-11-02', created_by: platformAdmin },
  ]);

  await knex('reels').insert([
    { author_id: neema, chamber_id: education, caption: 'Quick tip: how I organize my exam revision timetable', music_label: 'Study Vibes: Lofi', bg_color: '#5638C4', emoji: '📚', shares_count: 92 },
    { author_id: kevin, chamber_id: null, caption: 'Behind the scenes at our hackathon. 48 hours of pure code!', music_label: 'Original Audio', bg_color: '#219653', emoji: '🚀', shares_count: 210 },
    { author_id: daniel, chamber_id: social, caption: 'Campus sunset from the engineering block. #campuslife', music_label: 'Golden Hour: JVKE', bg_color: '#F2994A', emoji: '🌇', shares_count: 430 },
  ]);

  await knex('opportunities').insert([
    { role: 'Software Engineering Intern', company: 'Vodacom Tanzania', logo_emoji: '📱', type: 'Internship', category: 'Internships', location: 'Dar es Salaam', mode: 'Hybrid', pay: 'TSh 700,000/mo', deadline: '2026-10-30', tags: ['React Native', 'Node.js', 'Git'], verified: true, color_key: 'green',
      about: "Join our digital products team to build mobile experiences used by millions across East Africa. You'll work alongside senior engineers on real features shipped to production.",
      responsibilities: ['Build and maintain mobile app features', 'Write clean, tested, documented code', 'Collaborate in agile sprints with the product team', 'Participate in code reviews'],
      requirements: ['3rd/4th year in CS or related', 'Familiarity with React Native or Flutter', 'Understanding of REST APIs & Git', 'Strong problem-solving skills'] },
    { role: 'Data Analyst (Graduate Programme)', company: 'CRDB Bank', logo_emoji: '🏦', type: 'Graduate', category: 'Graduate', location: 'Dar es Salaam', mode: 'On-site', pay: 'Competitive', deadline: '2026-11-15', tags: ['SQL', 'Python', 'Power BI'], verified: true, color_key: 'blue',
      about: 'A 12-month graduate rotation across analytics, risk and digital banking teams. Ideal for recent graduates passionate about data-driven decision making.',
      responsibilities: ['Analyze large datasets for business insights', 'Build dashboards and reports', 'Support data-driven decisions across teams'],
      requirements: ["Bachelor's degree (any quantitative field)", 'SQL & Python basics', 'Strong analytical mindset', 'Graduated within last 2 years'] },
    { role: 'Mastercard Foundation Scholarship', company: 'Mastercard Foundation', logo_emoji: '🎓', type: 'Scholarship', category: 'Scholarships', location: 'Multiple', mode: 'Remote', pay: 'Full tuition + stipend', deadline: '2026-11-20', tags: ['Leadership', 'Financial Need'], verified: true, color_key: 'orange',
      about: 'A comprehensive scholarship covering tuition, accommodation and a monthly stipend for academically talented students with demonstrated leadership and financial need.',
      responsibilities: ['Maintain strong academic performance', 'Participate in leadership programmes', 'Give back through community service'],
      requirements: ['Currently enrolled undergraduate', 'GPA 3.5+ / First Class', 'Demonstrated financial need', 'Leadership experience'] },
    { role: 'Undergraduate Research Assistant', company: 'ICU Research Lab', logo_emoji: '🔬', type: 'Research', category: 'Research', location: 'On Campus', mode: 'On-site', pay: 'TSh 300,000/mo', deadline: '2026-10-10', tags: ['ML', 'Data Collection', 'LaTeX'], verified: true, color_key: 'primary',
      about: 'Support an ongoing machine-learning research project on agricultural yield prediction. Great for students considering postgraduate study.',
      responsibilities: ['Collect and clean datasets', 'Run experiments and log results', 'Co-author research documentation'],
      requirements: ['2nd year or above', 'Python & basic ML', 'Attention to detail', 'Interest in research'] },
    { role: 'Frontend Developer', company: 'Kilimo Fresh', logo_emoji: '🥬', type: 'Full-time', category: 'Jobs', location: 'Dar es Salaam', mode: 'Remote', pay: 'TSh 1,800,000/mo', deadline: '2026-10-28', tags: ['React', 'TypeScript', 'CSS'], verified: true, color_key: 'green',
      about: "Build the web platform powering Tanzania's largest B2B food distribution network. Remote-first with quarterly meetups.",
      responsibilities: ['Develop responsive web interfaces', 'Optimize performance and accessibility', 'Collaborate with designers and backend engineers'],
      requirements: ['Final year or graduate', 'Strong React & TypeScript', 'Portfolio of projects', 'Good communication'] },
  ]);

  await knex('opportunities')
    .where({ role: 'Software Engineering Intern', company: 'Vodacom Tanzania' })
    .update({ posted_by: employer, company_id: zuriTech });

  const [projRideShare, projAgriPredict, projStudyBuddy] = await knex('projects')
    .insert([
      { owner_id: kevin, title: 'Campus Ride-Share App', tagline: 'A carpooling app to help students share rides to campus safely and cheaply.', status: 'Recruiting', skills: ['React Native', 'Firebase', 'UI/UX'], needed_count: 5, emoji: '🚗', color_key: 'primary' },
      { owner_id: neema, title: 'AgriPredict: Yield ML Model', tagline: 'Machine-learning model predicting crop yields for smallholder farmers.', status: 'In Progress', skills: ['Python', 'ML', 'Data'], needed_count: 4, emoji: '🌱', color_key: 'green' },
      { owner_id: daniel, title: 'iCollege Study Buddy Bot', tagline: 'A quiz bot that tests you from your lecture notes.', status: 'Recruiting', skills: ['Node.js', 'Prompt Eng.'], needed_count: 4, emoji: '🤖', color_key: 'orange' },
    ])
    .returning('id')
    .then((rows) => rows.map((r) => r.id));

  await knex('project_members').insert([
    { project_id: projRideShare, user_id: kevin, role: 'owner' }, { project_id: projRideShare, user_id: daniel, role: 'member' }, { project_id: projRideShare, user_id: brian, role: 'member' },
    { project_id: projAgriPredict, user_id: neema, role: 'owner' }, { project_id: projAgriPredict, user_id: samuel, role: 'member' }, { project_id: projAgriPredict, user_id: aisha, role: 'member' }, { project_id: projAgriPredict, user_id: kevin, role: 'member' },
    { project_id: projStudyBuddy, user_id: daniel, role: 'owner' }, { project_id: projStudyBuddy, user_id: neema, role: 'member' },
  ]);

  await knex('user_skills').insert(
    ['React Native', 'TypeScript', 'Node.js', 'Python', 'Firebase', 'UI/UX', 'Git', 'SQL'].map((skill) => ({ user_id: daniel, skill })),
  );

  await knex('user_experience').insert([
    { user_id: daniel, role: 'Frontend Intern', org: 'BongoHive Labs', period: 'Jun – Aug 2025', description: 'Built reusable UI components for a fintech dashboard.', color_key: 'blue' },
    { user_id: daniel, role: 'Peer Tutor: Programming', org: 'ICU CS Department', period: '2024 – Present', description: 'Tutor first-year students in Python and data structures.', color_key: 'green' },
  ]);

  await knex('user_certifications').insert([
    { user_id: daniel, name: 'Meta React Native Specialization', issuer: 'Coursera', year: '2025', color_key: 'blue' },
    { user_id: daniel, name: 'Google Data Analytics', issuer: 'Google', year: '2025', color_key: 'green' },
    { user_id: daniel, name: 'AWS Cloud Practitioner', issuer: 'Amazon', year: '2026', color_key: 'orange' },
  ]);

  await knex('user_competitions').insert([
    { user_id: daniel, name: 'iCompete Coding Challenge', result: '🥇 1st Place', year: '2025', color_key: 'yellow' },
    { user_id: daniel, name: 'Dar es Salaam Hackathon', result: '🥈 Runner-up', year: '2025', color_key: 'textSecondary' },
  ]);

  await knex('user_education').insert([
    { user_id: daniel, school: 'iCollege University', degree: 'BSc Computer Science', period: '2024 – 2028', color_key: 'primary' },
  ]);

  await knex('flashcards').insert([
    { course_id: csc203, front: 'What is a database index?', back: 'A sorted data structure (usually a B-tree) mapping key values to row locations, speeding up reads at the cost of slower writes.' },
    { course_id: csc203, front: 'What does ACID stand for?', back: 'Atomicity, Consistency, Isolation, Durability: the guarantees a transaction provides.' },
    { course_id: csc203, front: 'Difference between INNER and LEFT JOIN?', back: 'INNER returns only matching rows; LEFT returns all left rows plus matches (NULLs where no match).' },
  ]);

  await knex('quiz_questions').insert([
    { course_id: csc203, question: 'Which normal form removes transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer_index: 2 },
    { course_id: csc203, question: 'A B-tree lookup has what time complexity?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer_index: 1 },
    { course_id: csc203, question: 'Which join returns only matching rows?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer_index: 2 },
  ]);

  console.log(`Seed complete. Demo login: student_id="ICU/2024/00458" password="${DEMO_PASSWORD}"`);
  console.log('Reviewer login: student_id="32162/T.2023" password="Mpambije"');
  console.log(`Platform admin: student_id="PLATFORM/ADMIN01" password="${DEMO_PASSWORD}"`);
  console.log(`University admin: student_id="ADMIN/UNI01" password="${DEMO_PASSWORD}"`);
  console.log(`Employer: student_id="EMP/ZURI01" password="${DEMO_PASSWORD}"`);
  console.log(`Lecturer: student_id="STAFF/00019" password="${DEMO_PASSWORD}"`);
  console.log(`Club admin: student_id="CLUB/INNOV01" password="${DEMO_PASSWORD}"`);
  console.log(`Pending lecturer (for approval testing): student_id="STAFF/00088" password="${DEMO_PASSWORD}"`);
}
