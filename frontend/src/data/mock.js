/**
 * Static UI-only configuration — category chips, filter labels, tab
 * labels, capability tiles. These change with app releases, not by users,
 * so they stay as frontend constants rather than database tables. All
 * user-facing data (timetable, notices, posts, chat, etc.) now comes from
 * the real API — see `@/lib/api/*`.
 */
import { colors } from '@/theme';
export const examTypes = ['Final', 'Mid-Semester', 'CAT / Test', 'Supplementary'];
export const noticeCategories = ['All', 'Academic', 'Exams', 'Timetable', 'Events', 'Career'];
export const docCategories = [
  {
    key: 'all',
    label: 'All Files',
    icon: 'folder-outline',
    color: colors.primary,
  },
  {
    key: 'certs',
    label: 'Certificates',
    icon: 'ribbon-outline',
    color: colors.orange,
  },
  {
    key: 'results',
    label: 'Results',
    icon: 'school-outline',
    color: colors.green,
  },
  {
    key: 'cv',
    label: 'CV & Letters',
    icon: 'reader-outline',
    color: colors.blue,
  },
  {
    key: 'receipts',
    label: 'Receipts',
    icon: 'receipt-outline',
    color: colors.red,
  },
];
export const postFilters = ['All Posts', 'Questions', 'News', 'Study Help', 'Opportunities'];
export const chamberTabs = ['Feed', 'Discussions', 'Resources', 'Events', 'Members', 'About'];
export const opportunityCategories = [
  'All',
  'Jobs',
  'Internships',
  'Scholarships',
  'Graduate',
  'Research',
  'Volunteer',
];
export const recommended = [
  {
    key: 'ai',
    title: 'AI Study Assistant',
    body: 'Summarize notes, generate quizzes, and more.',
    cta: 'Try Now',
    icon: 'sparkles-outline',
    color: colors.primary,
    soft: colors.primarySoft,
    route: '/ai-study',
  },
  {
    key: 'opp',
    title: 'Find Opportunities',
    body: 'Jobs, internships, scholarships and competitions.',
    cta: 'Explore',
    icon: 'briefcase-outline',
    color: colors.green,
    soft: colors.greenSoft,
    route: '/career',
  },
  {
    key: 'events',
    title: 'Campus Events',
    body: 'Discover events happening in your campus.',
    cta: 'See Events',
    icon: 'calendar-outline',
    color: colors.red,
    soft: colors.redSoft,
    route: '/clubs',
  },
];
export const aiCapabilities = [
  {
    key: 'study',
    label: 'Study Assistant',
    desc: 'Summaries, flashcards & quizzes',
    icon: 'school-outline',
    color: colors.primary,
    soft: colors.primarySoft,
    route: '/ai-study',
  },
  {
    key: 'search',
    label: 'Smart Search',
    desc: 'Ask in plain language',
    icon: 'search-outline',
    color: colors.blue,
    soft: colors.blueSoft,
    route: '/ai-search',
  },
  {
    key: 'career',
    label: 'Career Match',
    desc: 'Find opportunities for you',
    icon: 'briefcase-outline',
    color: colors.green,
    soft: colors.greenSoft,
    route: '/career',
  },
  {
    key: 'explain',
    label: 'Explain a Concept',
    desc: 'Break down hard topics',
    icon: 'bulb-outline',
    color: colors.orange,
    soft: colors.orangeSoft,
  },
];
export const aiSuggestions = [
  'Summarize my Database Systems notes',
  'Explain normalization with an example',
  'Make a 5-question quiz on SQL joins',
  'Find technology internships for final-year students',
  'Create a revision plan for my finals',
];
export const searchExamples = [
  'Find technology internships for final-year students',
  'Lecturers who teach databases',
  'Study materials on financial accounting',
  'Coding competitions closing this month',
];
