import express from "express";
import { getNotifications } from "../controllers/NotificationController.js";

const router = express.Router();

router.route("/:user_email").get(getNotifications);

export default router;
