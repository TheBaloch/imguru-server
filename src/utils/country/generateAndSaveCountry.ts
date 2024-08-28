import { AppDataSource } from "../../config/database";
import { Country } from "../../entities/Country";
import { CountryTranslations } from "../../entities/CountryTranslations";
import { Tag } from "../../entities/Tag";
import { addToSitemap } from "../sitemap";
import OpenAI from "openai";
import { generateCountry } from "./countryGenerator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAndSaveCountry(
  name: string,
  mainImage: string,
  flagImage: string,
  passportImage: string
) {
  try {
    // const text = `Started: ${title}`;
    // const subject = "Blog Generation Started";
    // await sendEmailNotification(subject, text);
    //const generatedBlogData = await generateBlogPost(title, cta_type);
    const countryData = await generateCountry(name);
    if (countryData) {
      const countryRepository = AppDataSource.getRepository(Country);
      const countryTranslationsRepository =
        AppDataSource.getRepository(CountryTranslations);
      const tagRepository = AppDataSource.getRepository(Tag);

      const tags = [];
      if (countryData.Tags) {
        const generatedTags = Array(...countryData.Tags);
        for (const name of generatedTags) {
          const existing = await tagRepository.findOneBy({
            slug: slugify(name),
          });
          if (existing) tags.push(existing);
          else {
            const newTag = new Tag();
            newTag.name = name;
            newTag.slug = slugify(name);
            const savedTag = await tagRepository.save(newTag);
            tags.push(savedTag);
          }
        }
      }

      let countryTranslation = new CountryTranslations();
      countryTranslation.language = "en";
      countryTranslation.SEO = countryData?.SEO;
      countryTranslation.climate = countryData.climate;
      countryTranslation.conclusion = countryData.conclusion;
      countryTranslation.culture = countryData.culture;
      countryTranslation.currentAffairs = countryData.currentAffairs;
      countryTranslation.funFacts = countryData.funFacts;
      countryTranslation.geography = countryData.geography;
      countryTranslation.history = countryData.history;
      countryTranslation.introduction = countryData.introduction;
      countryTranslation.lifeExpectancy = countryData.lifeExpectancy;
      countryTranslation.majorCities = countryData.majorCities;
      countryTranslation.majorIndustries = countryData.majorIndustries;
      countryTranslation.nationalSymbols = countryData.nationalSymbols;
      countryTranslation.officialReligion = countryData.officialReligion;
      countryTranslation.overview = countryData.overview;
      countryTranslation.title = countryData.title;
      countryTranslation.touristAttractions = countryData.touristAttractions;
      countryTranslation.weirdFacts = countryData.weirdFacts;
      countryTranslation.capitalCity = countryData.capitalCity;
      countryTranslation.continent = countryData.continent;
      countryTranslation.officialLanguage = countryData.officialLanguage;
      countryTranslation.name = countryData.name;
      countryTranslation.author = countryData.author;
      countryTranslation = await countryTranslationsRepository.save(
        countryTranslation
      );

      let country = new Country();
      let existing = await countryRepository.findOneBy({
        slug: countryData.slug,
      });
      if (existing) {
        for (let i = 0; ; i++) {
          if (i < 3) {
            const newslug = slugify(await generateNewSlug(countryData.slug));
            if (newslug) {
              existing = await countryRepository.findOneBy({
                slug: newslug,
              });

              if (!existing) {
                country.slug = newslug;
                break;
              }
            }
          } else {
            existing = await countryRepository.findOneBy({
              slug: `${countryData.slug}-${i}`,
            });

            if (!existing) {
              country.slug = `${countryData.slug}-${i}`;
              break;
            }
          }
        }
      } else {
        country.slug = countryData.slug;
      }
      country.areaKm2 = countryData.areaKm2;
      country.callingCode = countryData.callingCode;
      country.currency = countryData.currency;
      country.drivingSide = countryData.drivingSide;
      country.governmentType = countryData.governmentType;
      country.independenceDay = countryData.independenceDay;
      country.internetTLD = countryData.internetTLD;
      country.isoAlpha2Code = countryData.isoAlpha2Code;
      country.isoAlpha3Code = countryData.isoAlpha3Code;
      country.isoNumericCode = countryData.isoNumericCode;
      country.name = countryData.name;
      country.rank = parseInt(countryData.rank);
      country.timeZone = countryData.timeZone;
      country.tags = tags;
      country.mainImage = mainImage;
      country.flagImage = flagImage;
      country.passportImage = passportImage;
      country.translations = [countryTranslation];

      country = await countryRepository.save(country);

      addToSitemap(
        `${process.env.CLIENT_URL}/en/${process.env.COUNTRY_PATH}/${country.slug}`
      );
      //   console.log(`Generated: ${blog.slug}`);
      //   await blogTranslate(finalBlog.id, "es");
      //   await blogTranslate(finalBlog.id, "fr");
      //   await blogTranslate(finalBlog.id, "de");
      //   await blogTranslate(finalBlog.id, "ar");
      //   await blogTranslate(finalBlog.id, "pt");
      // const text = `Link: ${process.env.BLOG_URL}/${finalBlog.slug}`;
      // const subject = "Blog Generated";
      // await sendEmailNotification(subject, text);
      // console.log(`Generated: ${process.env.BLOG_URL}/${finalBlog.slug}`);
    } else {
      // const text = `Failed: ${title}`;
      // const subject = "Blog Failed";
      // await sendEmailNotification(subject, text);
      console.log(`Failed: ${name}`);
    }
  } catch (e) {
    // const text = `Failed: ${title}`;
    // const subject = "Blog Failed";
    // await sendEmailNotification(subject, text);
    console.log(`Failed: ${e}`);
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove all non-word characters, except whitespace and hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen
}

async function generateNewSlug(existing: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at generating unique and SEO-friendly slugs for blog posts.",
        },
        {
          role: "user",
          content: `The existing slug "${existing}" is already in the database. Please generate a new, relevant slug.`,
        },
      ],
    });

    if (!completion.choices || completion.choices.length === 0) {
      console.error("OpenAI returned no choices in the API response.");
      throw new Error("Empty response from OpenAI.");
    }

    const result = completion.choices[0].message?.content?.trim();
    if (!result) {
      console.error("OpenAI returned an empty message content.");
      throw new Error("Empty response content from OpenAI.");
    }

    const cleanText = result.replace(/[\u0000-\u001F\u007F-\u009F`]/g, "");

    return cleanText;
  } catch (error) {
    console.error("Error generating a new slug:", error);
    throw new Error("Failed to generate a new slug.");
  }
}
