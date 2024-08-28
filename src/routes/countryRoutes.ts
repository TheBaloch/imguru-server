import { Router } from "express";
import {
  generateCountry,
  getCountries,
  getCountryBySlug,
} from "../controllers/countryController";

const router = Router();

router.post("/country/generate", generateCountry);
router.get("/country/", getCountries);
router.get("/country/:slug", getCountryBySlug);

export default router;
