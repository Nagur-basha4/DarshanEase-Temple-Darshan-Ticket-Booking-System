import { Router, type IRouter } from "express";
import healthRouter from "./health";
import templesRouter from "./temples";
import poojaTypesRouter from "./poojaTypes";
import slotsRouter from "./slots";
import bookingsRouter from "./bookings";
import dashboardRouter from "./dashboard";
import authRouter from "./auth";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(templesRouter);
router.use(poojaTypesRouter);
router.use(slotsRouter);
router.use(bookingsRouter);
router.use(dashboardRouter);

export default router;
