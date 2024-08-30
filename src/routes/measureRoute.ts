import { Router } from "express";
import { measurement } from "../controllers/readingController";

const router = Router();

router.post("/measurement", measurement);

export default router;
