import { Router } from "express";
import {
  addPassport,
  getPassportBySlug,
} from "../controllers/passportController";

const router = Router();

router.post("/passport/add", addPassport);
router.get("/passport/:slug", getPassportBySlug);

export default router;
