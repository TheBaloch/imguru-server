import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { formatAndSavePassport } from "../utils/passport/formatAndSavePassport";
import { Country } from "../entities/Country";

export const addPassport = async (req: Request, res: Response) => {
  const {
    auth,
    mainContent,
    secondContent,
    thirdContent,
    visaFreeAccess,
    visaOnArrival,
    eTA,
    visaOnline,
    visaRequired,
    slug,
  } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });
  if (!slug) return res.status(304).json({ message: "Slug is missing" });
  res.status(201).json({ message: "Passport generation started" });
  setTimeout(async () => {
    console.log(`Started: ${slug}`);
    await formatAndSavePassport(
      mainContent,
      secondContent,
      thirdContent,
      visaFreeAccess,
      visaOnArrival,
      eTA,
      visaOnline,
      visaRequired,
      slug
    );
  }, 100);
};

export const getPassportBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { lang = "en" } = req.query;
  try {
    const countryRepository = AppDataSource.getRepository(Country);
    const country = await countryRepository.findOne({
      where: { slug },
      relations: ["translations", "tags", "passport"],
    });

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }
    const translation =
      country.translations.find((t) => t.language === lang) ||
      country.translations.find((t) => t.language === "en");
    const passportT =
      country.passport.find((t) => t.language === lang) ||
      country.passport.find((t) => t.language === "en");
    return res.status(200).json({
      name: country.name,
      rank: country.rank,
      flagImage: country.flagImage,
      passportImage: country.passportImage,
      isoAlpha3Code: country.isoAlpha3Code,
      isoNumericCode: country.isoNumericCode,
      currency: country.currency,
      timeZone: country.timeZone,
      callingCode: country.callingCode,
      governmentType: country.governmentType,
      independenceDay: country.independenceDay,
      createdAt: passportT?.createdAt,
      tags: country.tags,
      capitalCity: translation?.capitalCity,
      continent: translation?.continent,
      officialReligion: translation?.officialLanguage,
      officialLanguage: translation?.officialLanguage,
      overview: translation?.overview,
      introduction: translation?.introduction,
      climate: translation?.climate,
      lifeExpectancy: translation?.lifeExpectancy,
      nationalSymbols: translation?.nationalSymbols,
      ...passportT,
    });
  } catch (error) {
    console.error("Error fetching country:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
