import { Router } from "express";
import { uploadMeasuaremnt } from "../controllers/readingController";

const router = Router();

router.post("/upload", uploadMeasuaremnt);

export default router;
