import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { generateAndSaveCountry } from "../utils/country/generateAndSaveCountry";
import { Country } from "../entities/Country";

export const generateCountry = async (req: Request, res: Response) => {
  const { name, mainImage, flagImage, passportImage, auth } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });

  if (!name) return res.status(301).json({ message: "title is Required" });
  if (!mainImage)
    return res.status(301).json({ message: "main image is Required" });
  if (!flagImage)
    return res.status(301).json({ message: "flag image is Required" });
  if (!passportImage)
    return res.status(301).json({ message: "passport image is Required" });
  try {
    res.status(201).json({ message: "Blog generation started" });
    setTimeout(async () => {
      console.log(`Started: ${name}`);
      await generateAndSaveCountry(name, mainImage, flagImage, passportImage);
    }, 100);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCountries = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, lang = "en" } = req.query;

  try {
    const countryRepository = AppDataSource.getRepository(Country);
    const [country, total] = await countryRepository.findAndCount({
      relations: ["translations"],
      order: { rank: "ASC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const totalPages = Math.ceil(total / Number(limit));

    const Countires = country.map((c) => {
      const t =
        c.translations.find((t) => t.language === lang) ||
        c.translations.find((t) => t.language === "en");
      return {
        id: c.id,
        slug: c.slug,
        rank: c.rank,
        mainImage: c.mainImage,
        flagImage: c.flagImage,
        passportImage: c.passportImage,
        name: t?.name,
        continent: t?.continent,
        capitalCity: t?.capitalCity,
        title: t?.title,
        overview: t?.overview,
        climate: t?.climate,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return res.status(200).json({
      data: Countires,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching counties:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getCountryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { lang = "en" } = req.query;

  try {
    const countryRepository = AppDataSource.getRepository(Country);

    // Fetch the main blog with related entities
    const country = await countryRepository.findOne({
      where: { slug },
      relations: ["translations", "tags"],
    });

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    // Get translations and content for the main blog
    const translation =
      country.translations.find((t) => t.language === lang) ||
      country.translations.find((t) => t.language === "en");
    const { translations, ...data } = country;
    return res.status(200).json({
      ...data,
      ...translation,
    });
  } catch (error) {
    console.error("Error fetching country:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
