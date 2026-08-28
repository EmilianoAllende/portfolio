import { Router } from "express";
import userRoutes from "./users";
import appointmentsRoutes from "./appointments ";

const router = Router();

router.use("/appointments", appointmentsRoutes);
router.use("/users", userRoutes);

export default router;
