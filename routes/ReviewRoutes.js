import {
  createReview,
  getReviewsByUser,
  getReviewsByRatedBy,
} from "../controllers/ReviewController.js";
import express from "express";

const router = express.Router();

router.post("/", createReview);
router.get("/:user", getReviewsByUser);
router.get("/ratedBy/:ratedBy", getReviewsByRatedBy);

export default router;
