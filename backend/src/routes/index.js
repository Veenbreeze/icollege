import { Router } from 'express';
import { authRouter } from './auth.js';
import { academicRouter } from './academic.js';
import { documentsRouter } from './documents.js';
import { communityRouter } from './community.js';
import { notificationsRouter } from './notifications.js';
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
apiRouter.use(academicRouter); // owns /timetable, /exams, /notices
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/community', communityRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use(clubsRouter); // owns /clubs, /events
apiRouter.use(reelsRouter); // owns /stories, /reels
apiRouter.use(careerRouter); // owns /opportunities, /projects, /portfolio
apiRouter.use('/ai', aiRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/lecturer', lecturerRouter);
apiRouter.use('/club-admin', clubAdminRouter);
apiRouter.use('/employer', employerRouter);
