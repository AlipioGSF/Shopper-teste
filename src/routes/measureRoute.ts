import { Router } from "express";
import {
  confirmMeasurement,
  getCustomerMeasuries,
  uploadMeasuremnt,
} from "../controllers/readingController";

const router = Router();

router.post("/upload", uploadMeasuremnt);
router.patch("/confirm", confirmMeasurement);
router.get("/:customer_code/list", getCustomerMeasuries);

export default router;
