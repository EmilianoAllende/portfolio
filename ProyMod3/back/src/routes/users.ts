import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  registerNewUser,
  loginUser,
} from "../controllers/users.controllers";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/register", registerNewUser);
router.post("/login", loginUser);

export default router;