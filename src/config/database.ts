import { DataSource } from "typeorm";
import { User } from "../entities/User";

import * as dotenv from "dotenv";
import { SiteSettings } from "../entities/SiteSettings";
import { Tag } from "../entities/Tag";
import { Country } from "../entities/Country";
import { CountryTranslations } from "../entities/CountryTranslations";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "country",
  entities: [User, SiteSettings, Tag, Country, CountryTranslations],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
});
