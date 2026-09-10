import { db } from '../db/pool.js';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function to12Hour(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export async function getTodayTimetable(now = new Date()) {
  const dayOfWeek = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const rows = await db('timetable_slots')
    .join('courses', 'courses.id', 'timetable_slots.course_id')
    .where('timetable_slots.day_of_week', dayOfWeek)
    .select(
      'timetable_slots.id', 'timetable_slots.start_time', 'timetable_slots.end_time',
      'timetable_slots.room', 'timetable_slots.type',
      'courses.code', 'courses.title', 'courses.lecturer_name', 'courses.icon', 'courses.color_key',
    )
    .orderBy('timetable_slots.start_time');

  const classes = rows.map((r) => {
    const startMin = toMinutes(r.start_time);
    const endMin = toMinutes(r.end_time);
    let status = 'upcoming';
    if (nowMinutes >= endMin) status = 'completed';
    else if (nowMinutes >= startMin) status = 'current';

    let note;
    if (status === 'current') note = `Ends in ${Math.max(0, endMin - nowMinutes)}m`;
    if (status === 'upcoming' && startMin - nowMinutes <= 60) note = `Starts in ${startMin - nowMinutes}m`;

    return {
      id: `slot-${r.id}`,
      title: r.title,
      code: r.code,
      type: r.type,
      lecturer: r.lecturer_name,
      room: r.room,
      start: to12Hour(r.start_time),
      end: to12Hour(r.end_time),
      durationMinutes: endMin - startMin,
      status,
      note,
      icon: r.icon,
      colorKey: r.color_key,
    };
  });

  return { day: DAY_NAMES[dayOfWeek], classes };
}

export async function getWeekTimetable() {
  const rows = await db('timetable_slots')
    .join('courses', 'courses.id', 'timetable_slots.course_id')
    .select(
      'timetable_slots.id', 'timetable_slots.day_of_week', 'timetable_slots.start_time', 'timetable_slots.end_time',
      'timetable_slots.room', 'timetable_slots.type',
      'courses.code', 'courses.title', 'courses.lecturer_name', 'courses.icon', 'courses.color_key',
    )
    .orderBy(['timetable_slots.day_of_week', 'timetable_slots.start_time']);

  return rows.map((r) => ({
    id: `slot-${r.id}`,
    day: DAY_NAMES[r.day_of_week],
    dayOfWeek: r.day_of_week,
    title: r.title,
    code: r.code,
    type: r.type,
    lecturer: r.lecturer_name,
    room: r.room,
    start: to12Hour(r.start_time),
    end: to12Hour(r.end_time),
    icon: r.icon,
    colorKey: r.color_key,
  }));
}

export async function getExams(userId, now = new Date()) {
  const rows = await db('exams')
    .join('courses', 'courses.id', 'exams.course_id')
    .leftJoin('exam_seats', function () {
      this.on('exam_seats.exam_id', '=', 'exams.id').andOn('exam_seats.user_id', '=', db.raw('?', [userId]));
    })
    .select(
      'exams.id', 'exams.type', 'exams.exam_date', 'exams.exam_time', 'exams.duration', 'exams.venue', 'exams.room',
      'courses.code', 'courses.title', 'courses.icon', 'courses.color_key',
      'exam_seats.seat_label',
    )
    .orderBy('exams.exam_date');

  const upcoming = rows
    .filter((r) => new Date(r.exam_date) >= new Date(now.toDateString()))
    .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  return rows.map((r, idx) => {
    const isPast = new Date(r.exam_date) < new Date(now.toDateString());
    const isNext = !isPast && upcoming[0]?.id === r.id;
    return {
      id: `exam-${r.id}`,
      title: r.title,
      code: r.code,
      type: r.type,
      date: new Date(r.exam_date).toDateString(),
      time: r.exam_time,
      duration: r.duration,
      venue: r.venue,
      room: r.room,
      seat: r.seat_label ?? null,
      status: isPast ? 'done' : isNext ? 'next' : 'upcoming',
      icon: r.icon,
      colorKey: r.color_key,
    };
  });
}

export async function getExamSeating(examId, userId) {
  const exam = await db('exams')
    .join('courses', 'courses.id', 'exams.course_id')
    .where('exams.id', examId)
    .select('exams.*', 'courses.code', 'courses.title')
    .first();
  if (!exam) return null;

  const seat = await db('exam_seats').where({ exam_id: examId, user_id: userId }).first();

  return {
    exam: exam.title,
    code: exam.code,
    date: `${new Date(exam.exam_date).toDateString()} · ${exam.exam_time}`,
    venue: exam.venue,
    room: exam.room,
    seat: seat?.seat_label ?? null,
    seatRow: seat?.seat_row ?? null,
    seatCol: seat?.seat_col ?? null,
  };
}

export async function getNotices(userId) {
  const rows = await db('notices')
    .leftJoin('notice_reads', function () {
      this.on('notice_reads.notice_id', '=', 'notices.id').andOn('notice_reads.user_id', '=', db.raw('?', [userId]));
    })
    .select('notices.*', 'notice_reads.read_at')
    .orderBy('notices.published_at', 'desc');

  return rows.map((r) => ({
    id: `notice-${r.id}`,
    title: r.title,
    body: r.body,
    category: r.category,
    priority: r.priority,
    time: r.published_at,
    read: !!r.read_at,
    icon: r.icon,
    colorKey: r.color_key,
  }));
}

export async function markNoticeRead(noticeId, userId) {
  await db('notice_reads')
    .insert({ notice_id: noticeId, user_id: userId })
    .onConflict(['notice_id', 'user_id'])
    .ignore();
}
