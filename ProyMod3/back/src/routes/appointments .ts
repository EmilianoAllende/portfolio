import { Router } from "express";
import {
  getAllAppointments,
  getAppointmentsById,
  scheduleNewAppointments,
  cancelAppointments,
} from "../controllers/appointments.controllers";

const router = Router();

router.get("/", getAllAppointments);
router.get("/:id", getAppointmentsById);
router.post("/schedule", scheduleNewAppointments);
router.put("/cancel/:id", cancelAppointments);
export default router;
