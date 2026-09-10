/**
 * Mock / local data for the iCollege app.
 * No backend yet — screens read from here.
 */
import { colors } from '@/theme';

export const user = {
  name: 'Victor',
  fullName: 'Victor Mpambije',
  greeting: 'Good Morning',
  year: 'Year 2',
  programme: 'BSc Computer Science',
  successScore: 720,
  avatarInitials: 'VM',
};

export type ClassStatus = 'completed' | 'current' | 'upcoming';

export type ClassItem = {
  id: string;
  title: string;
  code: string;
  type: string;
  lecturer: string;
  room: string;
  start: string;
  end: string;
  status: ClassStatus;
  note?: string; // e.g. "Ends in 45m"
  icon: string; // ionicons / mci name
  color: string;
  soft: string;
};

export const todayClasses: ClassItem[] = [
  {
    id: 'c1',
    title: 'Introduction to Programming',
    code: 'CSC 101',
    type: 'Lecture',
    lecturer: 'Dr. John Mwangi',
    room: 'Block C, Room C301',
    start: '08:00 AM',
    end: '09:30 AM',
    status: 'completed',
    icon: 'desktop-outline',
    color: colors.primary,
    soft: colors.primarySoft,
  },
  {
    id: 'c2',
    title: 'Database Systems',
    code: 'CSC 203',
    type: 'Lecture',
    lecturer: 'Dr. Rehema Salum',
    room: 'Block D, Room D204',
    start: '10:00 AM',
    end: '12:00 PM',
    status: 'current',
    note: 'Ends in 45m',
    icon: 'server-outline',
    color: colors.blue,
    soft: colors.blueSoft,
  },
  {
    id: 'c3',
    title: 'Financial Accounting',
    code: 'ACC 201',
    type: 'Lecture',
    lecturer: 'Prof. Kelvin Ochieng',
    room: 'Block A, Room A102',
    start: '02:00 PM',
    end: '04:00 PM',
    status: 'upcoming',
    icon: 'calculator-outline',
    color: colors.orange,
    soft: colors.orangeSoft,
  },
];

export const timetableStats = {
  classesToday: 3,
  totalDuration: '5h 30m',
  completed: 2,
  upcoming: 1,
};

export const weekDays = [
  { day: 'Sun', date: 11 },
  { day: 'Mon', date: 12 },
  { day: 'Tue', date: 13, selected: true },
  { day: 'Wed', date: 14 },
  { day: 'Thu', date: 15 },
  { day: 'Fri', date: 16 },
  { day: 'Sat', date: 17 },
];

export const announcements = [
  'Exam Timetable Released',
  'Library Workshop Tomorrow',
];

export type QuickAction = {
  key: string;
  label: string;
  icon: string;
  color: string;
  soft: string;
  badge?: boolean;
  route?: string;
};

export const quickActions: QuickAction[] = [
  { key: 'timetable', label: 'Timetable', icon: 'time-outline', color: colors.primary, soft: colors.primarySoft, route: '/timetable' },
  { key: 'exams', label: 'Exams', icon: 'document-text-outline', color: colors.red, soft: colors.redSoft, route: '/exams' },
  { key: 'notices', label: 'Notices', icon: 'notifications-outline', color: colors.yellow, soft: colors.yellowSoft, badge: true, route: '/notices' },
  { key: 'documents', label: 'My Documents', icon: 'folder-outline', color: colors.green, soft: colors.greenSoft, route: '/documents' },
  { key: 'library', label: 'Library', icon: 'book-outline', color: colors.blue, soft: colors.blueSoft },
  { key: 'forums', label: 'Forums', icon: 'chatbubbles-outline', color: colors.primary, soft: colors.primarySoft, route: '/community' },
  { key: 'chambers', label: 'Chambers', icon: 'people-outline', color: colors.green, soft: colors.greenSoft, route: '/community' },
  { key: 'reels', label: 'Reels', icon: 'play-circle-outline', color: colors.red, soft: colors.redSoft, route: '/reels' },
  { key: 'events', label: 'Events', icon: 'calendar-outline', color: colors.blue, soft: colors.blueSoft, route: '/clubs' },
  { key: 'ai', label: 'iAI', icon: 'sparkles-outline', color: colors.primary, soft: colors.primarySoft, route: '/ai' },
];

export type Chamber = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  members: string;
  online?: string;
  postsToday?: string;
  emoji: string;
  theme: string; // key into chamberThemes
};

export const chambers: Chamber[] = [
  { id: 'education', name: 'Education', tagline: 'Learn. Share. Grow.', description: 'A community for students passionate about learning and teaching.', members: '12.4K Members', emoji: '🎓', theme: 'education' },
  { id: 'economics', name: 'Economics', tagline: 'Learn. Discuss. Grow.', description: 'A community for students passionate about economics, business, markets and development.', members: '8.7K Members', online: '245 Online', postsToday: '152 Posts Today', emoji: '📈', theme: 'economics' },
  { id: 'finance', name: 'Finance', tagline: 'Invest in knowledge.', description: 'Everything money, markets and personal finance for students.', members: '6.3K Members', emoji: '💰', theme: 'finance' },
  { id: 'social', name: 'Social Life', tagline: 'Connect. Belong.', description: 'Campus life, events and making friends.', members: '9.1K Members', emoji: '👥', theme: 'social' },
  { id: 'music', name: 'Music', tagline: 'Feel the sound.', description: 'For music lovers, creators and performers on campus.', members: '4.8K Members', emoji: '🎧', theme: 'music' },
];

export const postFilters = ['All Posts', 'Questions', 'News', 'Study Help', 'Opportunities'];

export const chamberTabs = ['Feed', 'Discussions', 'Resources', 'Events', 'Members', 'About'];

export const pinnedPost = {
  author: 'Admin',
  time: '2d ago',
  title: 'ECONOMICS CHAMBER GUIDELINES',
  body: 'Please read and follow the rules to keep our chamber safe, productive and helpful for everyone.',
  likes: 128,
  comments: 36,
  shares: 22,
};

export const trendingTopics = [
  { title: 'Inflation & Cost of Living', posts: '125 posts', emoji: '📊' },
  { title: 'Global Economic Outlook 2024', posts: '98 posts', emoji: '🌍' },
  { title: 'Investment for Students', posts: '87 posts', emoji: '🪙' },
  { title: 'Central Bank Policies', posts: '64 posts', emoji: '🏛️' },
];

export type Post = {
  id: string;
  author: string;
  initials: string;
  year: string;
  chamber: string;
  time: string;
  tag?: { label: string; kind: 'question' | 'news' | 'opportunity' };
  topContributor?: boolean;
  title: string;
  body?: string;
  likes: number;
  comments: number;
};

export const posts: Post[] = [
  {
    id: 'p1',
    author: 'Neema John',
    initials: 'NJ',
    year: 'Year 3',
    chamber: 'Economics',
    time: '1h ago',
    tag: { label: 'Question', kind: 'question' },
    topContributor: true,
    title: 'How does inflation affect interest rates?',
    body: 'Can someone explain the relationship between inflation and interest rates? I\'m preparing for my macroeconomics exam.',
    likes: 24,
    comments: 18,
  },
  {
    id: 'p2',
    author: 'Samuel Peter',
    initials: 'SP',
    year: 'Year 2',
    chamber: 'Economics',
    time: '3h ago',
    tag: { label: 'News', kind: 'news' },
    title: 'World Bank: Africa\'s Economy to Grow by 3.5% in 2024',
    body: 'New report projects steady growth across sub-Saharan economies driven by services and technology.',
    likes: 41,
    comments: 12,
  },
];

export const recommended = [
  { key: 'ai', title: 'AI Study Assistant', body: 'Summarize notes, generate quizzes, and more.', cta: 'Try Now', icon: 'sparkles-outline', color: colors.primary, soft: colors.primarySoft, route: '/ai-study' },
  { key: 'opp', title: 'Find Opportunities', body: 'Jobs, internships, scholarships and competitions.', cta: 'Explore', icon: 'briefcase-outline', color: colors.green, soft: colors.greenSoft, route: '/career' },
  { key: 'events', title: 'Campus Events', body: 'Discover events happening in your campus.', cta: 'See Events', icon: 'calendar-outline', color: colors.red, soft: colors.redSoft, route: '/clubs' },
];

export const messagesPreview = [
  { id: 'm1', name: 'CSC 203 Group', initials: 'CS', last: 'Dr. Rehema: Lab moved to D204', time: '2m', unread: 3, color: colors.blue },
  { id: 'm2', name: 'Neema John', initials: 'NJ', last: 'Thanks for the notes! 🙌', time: '18m', unread: 0, color: colors.green },
  { id: 'm3', name: 'Innovation Club', initials: 'IC', last: 'Meeting this Friday at 5pm', time: '1h', unread: 1, color: colors.orange },
  { id: 'm4', name: 'Samuel Peter', initials: 'SP', last: 'Did you register for iCompete?', time: '3h', unread: 0, color: colors.primary },
];

/* ------------------------------------------------------------------ */
/* Phase 1 — Exams                                                     */
/* ------------------------------------------------------------------ */

export const examTypes = ['Final', 'Mid-Semester', 'CAT / Test', 'Supplementary'];

export type ExamStatus = 'upcoming' | 'next' | 'done';

export type Exam = {
  id: string;
  title: string;
  code: string;
  type: string;
  date: string; // e.g. "Mon, 19 May"
  time: string; // e.g. "09:00 AM"
  duration: string; // e.g. "2h"
  venue: string;
  room: string;
  seat: string; // e.g. "R4-S12"
  status: ExamStatus;
  color: string;
  soft: string;
  icon: string;
};

export const exams: Exam[] = [
  {
    id: 'e1', title: 'Database Systems', code: 'CSC 203', type: 'Final',
    date: 'Mon, 19 May', time: '09:00 AM', duration: '2h',
    venue: 'Main Exam Hall', room: 'Hall A', seat: 'R4 · S12',
    status: 'next', color: colors.blue, soft: colors.blueSoft, icon: 'server-outline',
  },
  {
    id: 'e2', title: 'Introduction to Programming', code: 'CSC 101', type: 'Final',
    date: 'Wed, 21 May', time: '02:00 PM', duration: '2h',
    venue: 'Main Exam Hall', room: 'Hall B', seat: 'R2 · S05',
    status: 'upcoming', color: colors.primary, soft: colors.primarySoft, icon: 'desktop-outline',
  },
  {
    id: 'e3', title: 'Financial Accounting', code: 'ACC 201', type: 'Final',
    date: 'Fri, 23 May', time: '09:00 AM', duration: '3h',
    venue: 'Block A', room: 'A102', seat: 'R1 · S08',
    status: 'upcoming', color: colors.orange, soft: colors.orangeSoft, icon: 'calculator-outline',
  },
  {
    id: 'e4', title: 'Discrete Mathematics', code: 'MAT 104', type: 'Final',
    date: 'Mon, 26 May', time: '11:00 AM', duration: '2h',
    venue: 'Block C', room: 'C301', seat: 'R6 · S20',
    status: 'upcoming', color: colors.green, soft: colors.greenSoft, icon: 'shapes-outline',
  },
];

/* Exam seating — a room grid. 'me' is the student's seat. */
export const seatingInfo = {
  exam: 'Database Systems',
  code: 'CSC 203',
  date: 'Mon, 19 May · 09:00 AM',
  venue: 'Main Exam Hall',
  room: 'Hall A',
  seat: 'R4 · S12',
  row: 'Row 4',
  seatNo: 'Seat 12',
  regNumber: 'ICU/2024/00458',
  cols: 8,
  rows: 6,
  myRow: 3, // 0-indexed row 4
  myCol: 3, // 0-indexed seat 12 wraps; we just mark one cell
};

/* ------------------------------------------------------------------ */
/* Phase 1 — Notices                                                   */
/* ------------------------------------------------------------------ */

export type Priority = 'Critical' | 'Important' | 'Normal';

export type Notice = {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: Priority;
  time: string;
  read: boolean;
  icon: string;
  color: string;
  soft: string;
};

export const noticeCategories = ['All', 'Academic', 'Exams', 'Timetable', 'Events', 'Career'];

export const notices: Notice[] = [
  {
    id: 'n1', title: 'Final Exam Timetable Released', body: 'The final examination timetable for Semester 2 is now available. Check your exam schedule and seating.',
    category: 'Exams', priority: 'Critical', time: '2h ago', read: false,
    icon: 'document-text-outline', color: colors.red, soft: colors.redSoft,
  },
  {
    id: 'n2', title: 'Lecture Postponed — Financial Accounting', body: 'ACC 201 lecture moved from 2:00 PM today to tomorrow 10:00 AM.',
    category: 'Timetable', priority: 'Important', time: '4h ago', read: false,
    icon: 'time-outline', color: colors.orange, soft: colors.orangeSoft,
  },
  {
    id: 'n3', title: 'Library Workshop Tomorrow', body: 'Research skills & referencing workshop at the Main Library, 11:00 AM. Open to all students.',
    category: 'Academic', priority: 'Normal', time: '6h ago', read: true,
    icon: 'book-outline', color: colors.blue, soft: colors.blueSoft,
  },
  {
    id: 'n4', title: 'Career Fair 2025 Registration Open', body: 'Meet 40+ employers. Register early to book interview slots with top companies.',
    category: 'Career', priority: 'Important', time: '1d ago', read: true,
    icon: 'briefcase-outline', color: colors.green, soft: colors.greenSoft,
  },
  {
    id: 'n5', title: 'Innovation Club Meetup', body: 'Weekly meetup this Friday at 5:00 PM, Block D. New members welcome.',
    category: 'Events', priority: 'Normal', time: '1d ago', read: true,
    icon: 'people-outline', color: colors.primary, soft: colors.primarySoft,
  },
  {
    id: 'n6', title: 'Fee Payment Deadline Reminder', body: 'Semester 2 fee balance is due by 30 May to avoid exam card blocking.',
    category: 'Academic', priority: 'Critical', time: '2d ago', read: true,
    icon: 'card-outline', color: colors.red, soft: colors.redSoft,
  },
];

/* ------------------------------------------------------------------ */
/* Phase 1 — My Documents (iVault)                                     */
/* ------------------------------------------------------------------ */

export type DocType = 'pdf' | 'image' | 'doc';

export type Document = {
  id: string;
  name: string;
  type: DocType;
  category: string;
  size: string;
  date: string;
  color: string;
  soft: string;
};

const docTypeMeta: Record<DocType, { icon: string; color: string; soft: string }> = {
  pdf: { icon: 'document-text', color: colors.red, soft: colors.redSoft },
  image: { icon: 'image', color: colors.blue, soft: colors.blueSoft },
  doc: { icon: 'document', color: colors.primary, soft: colors.primarySoft },
};

export const docIconFor = (t: DocType) => docTypeMeta[t];

export const docCategories = [
  { key: 'all', label: 'All Files', icon: 'folder-outline', color: colors.primary, soft: colors.primarySoft, count: 12 },
  { key: 'certs', label: 'Certificates', icon: 'ribbon-outline', color: colors.orange, soft: colors.orangeSoft, count: 3 },
  { key: 'results', label: 'Results', icon: 'school-outline', color: colors.green, soft: colors.greenSoft, count: 4 },
  { key: 'cv', label: 'CV & Letters', icon: 'reader-outline', color: colors.blue, soft: colors.blueSoft, count: 2 },
  { key: 'receipts', label: 'Receipts', icon: 'receipt-outline', color: colors.red, soft: colors.redSoft, count: 3 },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Admission Letter.pdf', type: 'pdf', category: 'certs', size: '284 KB', date: '12 Jan 2024', ...docTypeMeta.pdf },
  { id: 'd2', name: 'Semester 1 Results.pdf', type: 'pdf', category: 'results', size: '156 KB', date: '20 Feb 2024', ...docTypeMeta.pdf },
  { id: 'd3', name: 'Daniel_CV_2025.docx', type: 'doc', category: 'cv', size: '92 KB', date: '05 Mar 2025', ...docTypeMeta.doc },
  { id: 'd4', name: 'KCSE Certificate.jpg', type: 'image', category: 'certs', size: '1.2 MB', date: '12 Jan 2024', ...docTypeMeta.image },
  { id: 'd5', name: 'Fee Receipt — Sem 2.pdf', type: 'pdf', category: 'receipts', size: '78 KB', date: '18 Feb 2025', ...docTypeMeta.pdf },
  { id: 'd6', name: 'Recommendation Letter.pdf', type: 'pdf', category: 'cv', size: '120 KB', date: '01 Apr 2025', ...docTypeMeta.pdf },
];

/* ================================================================== */
/* PHASE 2 — Student Community                                         */
/* ================================================================== */

/* ---- Live Chat -------------------------------------------------- */

export type ChatMessage = {
  id: string;
  text: string;
  mine: boolean;
  time: string;
  sender?: string; // for group chats
  senderColor?: string;
};

export type ChatThread = {
  id: string;
  name: string;
  initials: string;
  color: string;
  isGroup: boolean;
  members?: string;
  online: boolean;
  messages: ChatMessage[];
};

export const chatThreads: Record<string, ChatThread> = {
  m1: {
    id: 'm1', name: 'CSC 203 Group', initials: 'CS', color: colors.blue, isGroup: true, members: '48 members', online: true,
    messages: [
      { id: 'x1', text: 'Reminder: our lab session is today.', mine: false, time: '09:12', sender: 'Dr. Rehema', senderColor: colors.green },
      { id: 'x2', text: 'The lab has been moved to D204 instead of D201.', mine: false, time: '09:12', sender: 'Dr. Rehema', senderColor: colors.green },
      { id: 'x3', text: 'Noted, thank you Doctor 🙏', mine: true, time: '09:15' },
      { id: 'x4', text: 'Does anyone have the SQL join notes from last week?', mine: false, time: '09:20', sender: 'Neema John', senderColor: colors.primary },
      { id: 'x5', text: 'Yes! I\'ll share them in iVault shortly.', mine: true, time: '09:22' },
      { id: 'x6', text: 'You\'re a lifesaver 🙌', mine: false, time: '09:23', sender: 'Neema John', senderColor: colors.primary },
    ],
  },
  m2: {
    id: 'm2', name: 'Neema John', initials: 'NJ', color: colors.green, isGroup: false, online: true,
    messages: [
      { id: 'y1', text: 'Hey! Did you finish the assignment?', mine: false, time: '18:02' },
      { id: 'y2', text: 'Almost, just the last question left.', mine: true, time: '18:05' },
      { id: 'y3', text: 'Same here 😅 want to compare answers?', mine: false, time: '18:06' },
      { id: 'y4', text: 'Sure, sending mine now.', mine: true, time: '18:07' },
      { id: 'y5', text: 'Thanks for the notes! 🙌', mine: false, time: '18:10' },
    ],
  },
  m3: {
    id: 'm3', name: 'Innovation Club', initials: 'IC', color: colors.orange, isGroup: true, members: '126 members', online: false,
    messages: [
      { id: 'z1', text: 'Weekly meetup this Friday at 5pm 🚀', mine: false, time: '14:30', sender: 'Club Admin', senderColor: colors.orange },
      { id: 'z2', text: 'We\'ll be planning the hackathon.', mine: false, time: '14:31', sender: 'Club Admin', senderColor: colors.orange },
      { id: 'z3', text: 'Count me in!', mine: true, time: '14:45' },
    ],
  },
  m4: {
    id: 'm4', name: 'Samuel Peter', initials: 'SP', color: colors.primary, isGroup: false, online: false,
    messages: [
      { id: 'w1', text: 'Did you register for iCompete?', mine: false, time: '15:00' },
      { id: 'w2', text: 'Not yet, is the deadline soon?', mine: true, time: '15:20' },
      { id: 'w3', text: 'This Friday. You should join the coding challenge!', mine: false, time: '15:21' },
    ],
  },
};

/* ---- iForum: post detail + comments ----------------------------- */

export type Comment = {
  id: string;
  author: string;
  initials: string;
  color: string;
  year: string;
  time: string;
  text: string;
  likes: number;
  best?: boolean;
};

export const postComments: Record<string, Comment[]> = {
  p1: [
    { id: 'c1', author: 'Dr. Rehema Salum', initials: 'RS', color: colors.green, year: 'Lecturer', time: '45m ago', best: true, likes: 34,
      text: 'When inflation rises, central banks typically raise interest rates to cool spending. Higher rates make borrowing costlier, which reduces demand and helps bring prices back down.' },
    { id: 'c2', author: 'Brian Otieno', initials: 'BO', color: colors.blue, year: 'Year 3', time: '30m ago', likes: 12,
      text: 'Think of it as the price of money. Inflation high → money loses value → rates go up to protect it.' },
    { id: 'c3', author: 'Aisha Khamis', initials: 'AK', color: colors.orange, year: 'Year 2', time: '12m ago', likes: 5,
      text: 'This helped me so much for my exam prep, thank you! 🙏' },
  ],
  p2: [
    { id: 'c4', author: 'Kevin Mwangi', initials: 'KM', color: colors.primary, year: 'Year 4', time: '2h ago', likes: 8,
      text: 'Great news for the region. Services and tech are really driving this growth.' },
  ],
};

/* ---- iClubs & iEvents -------------------------------------------- */

export type Club = {
  id: string;
  name: string;
  category: string;
  members: string;
  emoji: string;
  color: string;
  soft: string;
  joined: boolean;
};

export const clubs: Club[] = [
  { id: 'cl1', name: 'Innovation & Tech Club', category: 'Technology', members: '1.2K', emoji: '💡', color: colors.primary, soft: colors.primarySoft, joined: true },
  { id: 'cl2', name: 'Debate Society', category: 'Public Speaking', members: '640', emoji: '🎙️', color: colors.orange, soft: colors.orangeSoft, joined: false },
  { id: 'cl3', name: 'Entrepreneurship Hub', category: 'Business', members: '980', emoji: '🚀', color: colors.green, soft: colors.greenSoft, joined: true },
  { id: 'cl4', name: 'Photography Club', category: 'Creative', members: '410', emoji: '📷', color: colors.blue, soft: colors.blueSoft, joined: false },
];

export type EventItem = {
  id: string;
  title: string;
  host: string;
  type: string;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  attending: string;
  emoji: string;
  color: string;
  soft: string;
  registered: boolean;
};

export const events: EventItem[] = [
  { id: 'ev1', title: 'Annual Tech Summit 2025', host: 'Innovation & Tech Club', type: 'Conference',
    date: 'Fri, 23 May', day: '23', month: 'MAY', time: '10:00 AM', venue: 'Main Auditorium', attending: '312', emoji: '🚀', color: colors.primary, soft: colors.primarySoft, registered: false },
  { id: 'ev2', title: 'Career Fair & Networking', host: 'Career Services', type: 'Career Fair',
    date: 'Wed, 28 May', day: '28', month: 'MAY', time: '09:00 AM', venue: 'Sports Complex', attending: '540', emoji: '💼', color: colors.green, soft: colors.greenSoft, registered: true },
  { id: 'ev3', title: 'Inter-University Debate', host: 'Debate Society', type: 'Competition',
    date: 'Sat, 31 May', day: '31', month: 'MAY', time: '02:00 PM', venue: 'Lecture Hall 3', attending: '128', emoji: '🎙️', color: colors.orange, soft: colors.orangeSoft, registered: false },
];

/* ---- iReels & Stories -------------------------------------------- */

export type Story = {
  id: string;
  name: string;
  initials: string;
  color: string;
  viewed: boolean;
  mine?: boolean;
};

export const stories: Story[] = [
  { id: 's0', name: 'Your Story', initials: 'DM', color: colors.primary, viewed: false, mine: true },
  { id: 's1', name: 'Neema', initials: 'NJ', color: colors.green, viewed: false },
  { id: 's2', name: 'Innovation', initials: 'IC', color: colors.orange, viewed: false },
  { id: 's3', name: 'Brian', initials: 'BO', color: colors.blue, viewed: true },
  { id: 's4', name: 'Aisha', initials: 'AK', color: colors.red, viewed: true },
  { id: 's5', name: 'Kevin', initials: 'KM', color: colors.primaryLight, viewed: true },
];

export type Reel = {
  id: string;
  author: string;
  initials: string;
  color: string;
  caption: string;
  chamber: string;
  music: string;
  likes: string;
  comments: string;
  shares: string;
  bg: string; // gradient-ish background color
  emoji: string;
};

export const reels: Reel[] = [
  { id: 'r1', author: 'Neema John', initials: 'NJ', color: colors.green, caption: 'Quick tip: how I organize my exam revision timetable 📚✨', chamber: 'Education', music: 'Study Vibes — Lofi', likes: '2.4K', comments: '186', shares: '92', bg: '#5638C4', emoji: '📚' },
  { id: 'r2', author: 'Innovation Club', initials: 'IC', color: colors.orange, caption: 'Behind the scenes at our hackathon 🚀 48 hours of pure code!', chamber: 'Technology', music: 'Original Audio', likes: '5.1K', comments: '340', shares: '210', bg: '#219653', emoji: '🚀' },
  { id: 'r3', author: 'Kevin Mwangi', initials: 'KM', color: colors.primary, caption: 'Campus sunset from the engineering block 🌇 #campuslife', chamber: 'Social Life', music: 'Golden Hour — JVKE', likes: '8.7K', comments: '512', shares: '430', bg: '#F2994A', emoji: '🌇' },
];

/* ================================================================== */
/* PHASE 3 — Student Future (iCareer)                                  */
/* ================================================================== */

export const opportunityCategories = ['All', 'Jobs', 'Internships', 'Scholarships', 'Graduate', 'Research', 'Volunteer'];

export type Opportunity = {
  id: string;
  role: string;
  company: string;
  logo: string; // emoji
  type: string; // Internship / Full-time / Scholarship...
  category: string;
  location: string;
  mode: string; // On-site / Remote / Hybrid
  pay: string;
  posted: string;
  deadline: string;
  tags: string[];
  matched: number; // AI match %
  verified: boolean;
  color: string;
  soft: string;
  about: string;
  responsibilities: string[];
  requirements: string[];
};

export const opportunities: Opportunity[] = [
  {
    id: 'o1', role: 'Software Engineering Intern', company: 'Safaricom PLC', logo: '📱',
    type: 'Internship', category: 'Internships', location: 'Nairobi', mode: 'Hybrid', pay: 'KSh 45,000/mo',
    posted: '2d ago', deadline: '30 May 2025', tags: ['React Native', 'Node.js', 'Git'], matched: 94, verified: true,
    color: colors.green, soft: colors.greenSoft,
    about: 'Join our digital products team to build mobile experiences used by millions across East Africa. You\'ll work alongside senior engineers on real features shipped to production.',
    responsibilities: ['Build and maintain mobile app features', 'Write clean, tested, documented code', 'Collaborate in agile sprints with the product team', 'Participate in code reviews'],
    requirements: ['3rd/4th year in CS or related', 'Familiarity with React Native or Flutter', 'Understanding of REST APIs & Git', 'Strong problem-solving skills'],
  },
  {
    id: 'o2', role: 'Data Analyst (Graduate Programme)', company: 'KCB Bank', logo: '🏦',
    type: 'Graduate', category: 'Graduate', location: 'Nairobi', mode: 'On-site', pay: 'Competitive',
    posted: '4d ago', deadline: '15 Jun 2025', tags: ['SQL', 'Python', 'Power BI'], matched: 87, verified: true,
    color: colors.blue, soft: colors.blueSoft,
    about: 'A 12-month graduate rotation across analytics, risk and digital banking teams. Ideal for recent graduates passionate about data-driven decision making.',
    responsibilities: ['Analyze large datasets for business insights', 'Build dashboards and reports', 'Support data-driven decisions across teams'],
    requirements: ['Bachelor\'s degree (any quantitative field)', 'SQL & Python basics', 'Strong analytical mindset', 'Graduated within last 2 years'],
  },
  {
    id: 'o3', role: 'Mastercard Foundation Scholarship', company: 'Mastercard Foundation', logo: '🎓',
    type: 'Scholarship', category: 'Scholarships', location: 'Multiple', mode: 'Remote', pay: 'Full tuition + stipend',
    posted: '1w ago', deadline: '20 Jun 2025', tags: ['Leadership', 'Financial Need'], matched: 78, verified: true,
    color: colors.orange, soft: colors.orangeSoft,
    about: 'A comprehensive scholarship covering tuition, accommodation and a monthly stipend for academically talented students with demonstrated leadership and financial need.',
    responsibilities: ['Maintain strong academic performance', 'Participate in leadership programmes', 'Give back through community service'],
    requirements: ['Currently enrolled undergraduate', 'GPA 3.5+ / First Class', 'Demonstrated financial need', 'Leadership experience'],
  },
  {
    id: 'o4', role: 'Undergraduate Research Assistant', company: 'ICU Research Lab', logo: '🔬',
    type: 'Research', category: 'Research', location: 'On Campus', mode: 'On-site', pay: 'KSh 20,000/mo',
    posted: '3d ago', deadline: '10 Jun 2025', tags: ['ML', 'Data Collection', 'LaTeX'], matched: 82, verified: true,
    color: colors.primary, soft: colors.primarySoft,
    about: 'Support an ongoing machine-learning research project on agricultural yield prediction. Great for students considering postgraduate study.',
    responsibilities: ['Collect and clean datasets', 'Run experiments and log results', 'Co-author research documentation'],
    requirements: ['2nd year or above', 'Python & basic ML', 'Attention to detail', 'Interest in research'],
  },
  {
    id: 'o5', role: 'Frontend Developer', company: 'Twiga Foods', logo: '🥬',
    type: 'Full-time', category: 'Jobs', location: 'Nairobi', mode: 'Remote', pay: 'KSh 120,000/mo',
    posted: '5d ago', deadline: '28 May 2025', tags: ['React', 'TypeScript', 'CSS'], matched: 90, verified: true,
    color: colors.green, soft: colors.greenSoft,
    about: 'Build the web platform powering Africa\'s largest B2B food distribution network. Remote-first with quarterly meetups.',
    responsibilities: ['Develop responsive web interfaces', 'Optimize performance and accessibility', 'Collaborate with designers and backend engineers'],
    requirements: ['Final year or graduate', 'Strong React & TypeScript', 'Portfolio of projects', 'Good communication'],
  },
];

/* ---- Student Projects ------------------------------------------- */

export type Project = {
  id: string;
  title: string;
  owner: string;
  ownerInitials: string;
  tagline: string;
  status: 'Recruiting' | 'In Progress' | 'Completed';
  skills: string[];
  members: number;
  needed: number;
  emoji: string;
  color: string;
  soft: string;
};

export const projects: Project[] = [
  { id: 'pr1', title: 'Campus Ride-Share App', owner: 'Kevin Mwangi', ownerInitials: 'KM', tagline: 'A carpooling app to help students share rides to campus safely and cheaply.', status: 'Recruiting', skills: ['React Native', 'Firebase', 'UI/UX'], members: 3, needed: 5, emoji: '🚗', color: colors.primary, soft: colors.primarySoft },
  { id: 'pr2', title: 'AgriPredict — Yield ML Model', owner: 'Neema John', ownerInitials: 'NJ', tagline: 'Machine-learning model predicting crop yields for smallholder farmers.', status: 'In Progress', skills: ['Python', 'ML', 'Data'], members: 4, needed: 4, emoji: '🌱', color: colors.green, soft: colors.greenSoft },
  { id: 'pr3', title: 'iCollege Study Buddy Bot', owner: 'Daniel Mwakideu', ownerInitials: 'DM', tagline: 'An AI chatbot that quizzes you from your lecture notes.', status: 'Recruiting', skills: ['AI', 'Node.js', 'Prompt Eng.'], members: 2, needed: 4, emoji: '🤖', color: colors.orange, soft: colors.orangeSoft },
];

/* ---- Student Portfolio ------------------------------------------ */

export const portfolio = {
  name: 'Daniel Mwakideu',
  initials: 'DM',
  headline: 'CS Student · Mobile Developer · AI Enthusiast',
  location: 'Nairobi, Kenya',
  successScore: 720,
  open: true, // open to opportunities
  about: 'Second-year Computer Science student passionate about building mobile apps that solve real campus problems. Currently exploring React Native and applied AI.',
  stats: [
    { label: 'Projects', value: '8' },
    { label: 'Certifications', value: '5' },
    { label: 'Competitions', value: '3' },
  ],
  skills: ['React Native', 'TypeScript', 'Node.js', 'Python', 'Firebase', 'UI/UX', 'Git', 'SQL'],
  experience: [
    { id: 'e1', role: 'Frontend Intern', org: 'BongoHive Labs', period: 'Jun – Aug 2024', desc: 'Built reusable UI components for a fintech dashboard.', color: colors.blue },
    { id: 'e2', role: 'Peer Tutor — Programming', org: 'ICU CS Department', period: '2023 – Present', desc: 'Tutor first-year students in Python and data structures.', color: colors.green },
  ],
  projectsList: [
    { id: 'p1', name: 'iCollege Study Buddy Bot', tag: 'AI · Node.js', emoji: '🤖', color: colors.orange },
    { id: 'p2', name: 'Campus Ride-Share App', tag: 'React Native', emoji: '🚗', color: colors.primary },
  ],
  certifications: [
    { id: 'c1', name: 'Meta React Native Specialization', issuer: 'Coursera', year: '2024', color: colors.blue },
    { id: 'c2', name: 'Google Data Analytics', issuer: 'Google', year: '2024', color: colors.green },
    { id: 'c3', name: 'AWS Cloud Practitioner', issuer: 'Amazon', year: '2025', color: colors.orange },
  ],
  competitions: [
    { id: 'k1', name: 'iCompete Coding Challenge', result: '🥇 1st Place', year: '2024', color: colors.yellow },
    { id: 'k2', name: 'Nairobi Hackathon', result: '🥈 Runner-up', year: '2024', color: colors.textSecondary },
  ],
  education: [
    { id: 'ed1', school: 'iCollege University', degree: 'BSc Computer Science', period: '2023 – 2027', color: colors.primary },
  ],
};

/* ================================================================== */
/* PHASE 4 — Intelligence (iAI)                                        */
/* ================================================================== */

/* ---- iAI Assistant chat ----------------------------------------- */

export type AiCapability = {
  key: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  soft: string;
  route?: string;
};

export const aiCapabilities: AiCapability[] = [
  { key: 'study', label: 'Study Assistant', desc: 'Summaries, flashcards & quizzes', icon: 'school-outline', color: colors.primary, soft: colors.primarySoft, route: '/ai-study' },
  { key: 'search', label: 'Smart Search', desc: 'Ask in plain language', icon: 'search-outline', color: colors.blue, soft: colors.blueSoft, route: '/ai-search' },
  { key: 'career', label: 'Career Match', desc: 'Find opportunities for you', icon: 'briefcase-outline', color: colors.green, soft: colors.greenSoft, route: '/career' },
  { key: 'explain', label: 'Explain a Concept', desc: 'Break down hard topics', icon: 'bulb-outline', color: colors.orange, soft: colors.orangeSoft },
];

export const aiSuggestions = [
  'Summarize my Database Systems notes',
  'Explain normalization with an example',
  'Make a 5-question quiz on SQL joins',
  'Find technology internships for final-year students',
  'Create a revision plan for my finals',
];

/** Canned assistant replies keyed by matching text (mock — real AI is backend). */
export const aiReplies: { match: string; reply: string }[] = [
  {
    match: 'normalization',
    reply: 'Normalization organizes database tables to reduce redundancy.\n\n• 1NF — atomic values, no repeating groups\n• 2NF — 1NF + no partial dependency on a composite key\n• 3NF — 2NF + no transitive dependency\n\nExample: splitting a Students table that repeats course names into separate Students, Courses and Enrolment tables removes duplication.',
  },
  {
    match: 'quiz',
    reply: 'Here\'s a quick 3-question quiz on SQL joins:\n\n1. Which join returns only matching rows in both tables?\n2. What does a LEFT JOIN return when there\'s no match on the right?\n3. Which join can produce a Cartesian product if unconstrained?\n\nTap "Study Assistant" for the full interactive quiz with instant marking.',
  },
  {
    match: 'internship',
    reply: 'I found 3 technology internships matched to your profile (94%, 90%, 82%):\n\n• Software Engineering Intern — Safaricom (Hybrid)\n• Frontend Developer — Twiga Foods (Remote)\n• Research Assistant — ICU Lab\n\nOpen iCareer to view and apply.',
  },
  {
    match: 'summar',
    reply: 'Summary of "Database Systems — Week 5":\n\nA database index speeds up reads by keeping a sorted structure (usually a B-tree) of key → row pointers, at the cost of slower writes and extra storage. Use indexes on columns you filter or join on frequently; avoid over-indexing.',
  },
  {
    match: 'revision plan',
    reply: 'Here\'s a 5-day finals revision plan:\n\n• Mon — Database Systems (indexing, joins)\n• Tue — Programming (data structures)\n• Wed — Financial Accounting (statements)\n• Thu — Discrete Maths (proofs, graphs)\n• Fri — Mixed past papers + rest\n\nWant me to add this to your Timetable?',
  },
];

export const aiDefaultReply =
  'Great question! Based on your courses and profile, here\'s what I found. I can pull from your notes in iVault, your timetable and university resources. Try one of the tools below for summaries, quizzes or a smart search.';

/* ---- AI Study Assistant ----------------------------------------- */

export const studyMaterials = [
  { id: 'sm1', name: 'Database Systems — Week 5.pdf', pages: 18, color: colors.blue, soft: colors.blueSoft },
  { id: 'sm2', name: 'Intro to Programming — Notes.pdf', pages: 24, color: colors.primary, soft: colors.primarySoft },
  { id: 'sm3', name: 'Financial Accounting — Ch 3.pdf', pages: 12, color: colors.orange, soft: colors.orangeSoft },
];

export const studyTools = [
  { key: 'summary', label: 'Summary', icon: 'reader-outline', color: colors.blue, soft: colors.blueSoft },
  { key: 'flashcards', label: 'Flashcards', icon: 'albums-outline', color: colors.primary, soft: colors.primarySoft },
  { key: 'quiz', label: 'Quiz', icon: 'help-circle-outline', color: colors.green, soft: colors.greenSoft },
  { key: 'plan', label: 'Study Plan', icon: 'calendar-outline', color: colors.orange, soft: colors.orangeSoft },
];

export const studySummary = {
  keyConcepts: ['Indexing', 'B-tree', 'Query optimization', 'Normalization', 'Transactions'],
  points: [
    'Indexes trade slower writes for much faster reads on filtered/joined columns.',
    'A B-tree keeps keys sorted so lookups are logarithmic time.',
    'Normalization (1NF→3NF) removes redundancy but can add joins.',
    'Transactions guarantee ACID: Atomicity, Consistency, Isolation, Durability.',
  ],
};

export type Flashcard = { id: string; front: string; back: string };
export const flashcards: Flashcard[] = [
  { id: 'f1', front: 'What is a database index?', back: 'A sorted data structure (usually a B-tree) mapping key values to row locations, speeding up reads at the cost of slower writes.' },
  { id: 'f2', front: 'What does ACID stand for?', back: 'Atomicity, Consistency, Isolation, Durability — the guarantees a transaction provides.' },
  { id: 'f3', front: 'Difference between INNER and LEFT JOIN?', back: 'INNER returns only matching rows; LEFT returns all left rows plus matches (NULLs where no match).' },
];

export type QuizQuestion = { id: string; q: string; options: string[]; answer: number };
export const quizQuestions: QuizQuestion[] = [
  { id: 'q1', q: 'Which normal form removes transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 2 },
  { id: 'q2', q: 'A B-tree lookup has what time complexity?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 1 },
  { id: 'q3', q: 'Which join returns only matching rows?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer: 2 },
];

/* ---- AI Smart Search -------------------------------------------- */

export const searchExamples = [
  'Find technology internships for final-year students',
  'Lecturers who teach databases',
  'Study materials on financial accounting',
  'Coding competitions closing this month',
];

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  color: string;
  soft: string;
  route?: string;
};

export const smartSearchQuery = 'Find technology internships for final-year students';
export const smartSearchInterpretation = 'Internships · Technology · Year 4 · Open now';

export const searchResults: SearchResult[] = [
  { id: 'sr1', title: 'Software Engineering Intern', subtitle: 'Safaricom PLC · 94% match · Hybrid', category: 'Opportunity', icon: 'briefcase', color: colors.green, soft: colors.greenSoft, route: '/opportunity/o1' },
  { id: 'sr2', title: 'Frontend Developer', subtitle: 'Twiga Foods · 90% match · Remote', category: 'Opportunity', icon: 'briefcase', color: colors.green, soft: colors.greenSoft, route: '/opportunity/o5' },
  { id: 'sr3', title: 'Innovation & Tech Club', subtitle: '1.2K members · hosts the Tech Summit', category: 'Club', icon: 'people', color: colors.primary, soft: colors.primarySoft, route: '/clubs' },
  { id: 'sr4', title: 'Annual Tech Summit 2025', subtitle: 'Fri, 23 May · Main Auditorium', category: 'Event', icon: 'calendar', color: colors.blue, soft: colors.blueSoft, route: '/clubs' },
  { id: 'sr5', title: 'Campus Ride-Share App', subtitle: 'Project · Recruiting · React Native', category: 'Project', icon: 'construct', color: colors.orange, soft: colors.orangeSoft, route: '/career' },
];
