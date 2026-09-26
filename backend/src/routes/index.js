import { Router } from 'express';
import { authRouter } from './auth.js';
import { academicRouter } from './academic.js';
import { documentsRouter } from './documents.js';
import { libraryRouter } from './library.js';
import { filesRouter } from './files.js';
import { notificationsRouter } from './notifications.js';
import { academicNotificationsRouter } from './academicNotifications.js';
import { communityRouter } from './community.js';
import { chatRouter } from './chat.js';
import { clubsRouter } from './clubs.js';
import { reelsRouter } from './reels.js';
import { careerRouter } from './career.js';
import { aiRouter } from './ai.js';
import { adminRouter } from './admin.js';
import { lecturerRouter } from './lecturer.js';
import { clubAdminRouter } from './clubAdmin.js';
import { employerRouter } from './employer.js';

/** All /api sub-routers in one place, so app.js doesn't grow a new
 * import + mount line every time a domain is added. */
export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
// Mounted BEFORE academicRouter: academicRouter is mounted at the root path and
// applies requireAuth to everything that enters it, which would otherwise gate the
// signed-token (header-less) download route. Path-prefixed /files matches first.
apiRouter.use('/files', filesRouter); // access-checked downloads (auth header OR signed token)
apiRouter.use(academicRouter); // owns /timetable, /exams, /notices
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/library', libraryRouter);
apiRouter.use('/notifications', notificationsRouter); // social activity (likes/comments/…)
apiRouter.use('/academic-notifications', academicNotificationsRouter); // notice/lecture alerts + push
apiRouter.use('/community', communityRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use(clubsRouter); // owns /clubs, /events
apiRouter.use(reelsRouter); // owns /stories, /reels
apiRouter.use(careerRouter); // owns /opportunities, /projects, /portfolio
apiRouter.use('/ai', aiRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/lecturer', lecturerRouter);
apiRouter.use('/club-admin', clubAdminRouter);
apiRouter.use('/employer', employerRouter);
