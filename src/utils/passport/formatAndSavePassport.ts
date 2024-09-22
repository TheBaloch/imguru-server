import { AppDataSource } from "../../config/database";
import { Country } from "../../entities/Country";
import { Passport } from "../../entities/Passport";
import { addToSitemap } from "../sitemap";
import OpenAI from "openai";
import passportTranslate from "./passportTranslator";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Retry logic for translation functions.
 * @param fn - The function to be retried.
 * @param args - Arguments for the function.
 * @param retries - Number of retries.
 */
async function retry<T>(
  fn: (...args: any[]) => Promise<T>,
  args: any[],
  retries: number = 3
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn(...args);
    } catch (error: any) {
      lastError = error;
      console.warn(`Retry attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt === retries - 1) {
        throw lastError;
      }
    }
  }
  throw lastError;
}

export async function formatAndSavePassport(
  mainContent: string,
  secondContent: string,
  thirdContent: string,
  visaFreeAccess: any[],
  visaOnArrival: any[],
  eTA: any[],
  visaOnline: any[],
  visaRequired: any[],
  slug: string
) {
  try {
    const passportRepository = AppDataSource.getRepository(Passport);
    const countryRepository = AppDataSource.getRepository(Country);

    const country = await countryRepository.findOne({ where: { slug: slug } });
    if (!country) {
      console.log("Country not found for Passport with slug: ", slug);
      return;
    }

    const newPassport = new Passport();
    newPassport.language = "en";
    newPassport.country = country;
    if (mainContent)
      newPassport.mainContent = await retry(convert2HTML, [mainContent]);
    if (secondContent)
      newPassport.secondContent = await retry(convert2HTML, [secondContent]);
    if (thirdContent)
      newPassport.thirdContent = await retry(convert2HTML, [thirdContent]);
    newPassport.visaFreeAccess = visaFreeAccess;
    newPassport.visaOnArrival = visaOnArrival;
    newPassport.visaOnline = visaOnline;
    newPassport.visaRequired = visaRequired;
    newPassport.eTA = eTA;

    const savedPassport = await passportRepository.save(newPassport);

    addToSitemap(
      `${process.env.CLIENT_URL}/${process.env.PASSPORT_PATH}/${slug}`,
      "passport"
    );

    console.log(
      `Successfully generated and saved passport for: ${country.slug}`
    );
    await passportTranslate(savedPassport.id, "es");
    await passportTranslate(savedPassport.id, "zh");
    await passportTranslate(savedPassport.id, "ar");
    await passportTranslate(savedPassport.id, "fr");
    await passportTranslate(savedPassport.id, "de");
    await passportTranslate(savedPassport.id, "pt");
    await passportTranslate(savedPassport.id, "ja");
    await passportTranslate(savedPassport.id, "ru");
    await passportTranslate(savedPassport.id, "ko");
    await passportTranslate(savedPassport.id, "hi");
    await passportTranslate(savedPassport.id, "it");
  } catch (e) {
    console.error(`Failed to save passport: ${e}`);
  }
}

async function convert2HTML(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a highly skilled content editor and web designer. Your task is to:
  1. Paraphrase and enhance the provided content, making it fun to read and engaging.
  2. Fix any grammatical issues.
  3. Convert the content into clean, properly structured HTML using the necessary tags like <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, etc., ensuring that it improves readability and appeal.
  4. Ensure the content is SEO-optimized by using appropriate headings, keywords, and semantic tags.
  5. **Do not include** <html>, <head>, or <body> tags in your response.
  6. Return only the HTML content as specified. Do not add any explanations, comments, or additional text outside of the HTML.`,
        },
        {
          role: "user",
          content: `Convert the following content into proper HTML:
  "${content}"`,
        },
      ],
    });

    const translatedContent = completion.choices[0].message.content?.trim();
    if (!translatedContent) {
      throw new Error("Failed to generate HTML content.");
    }

    return translatedContent;
  } catch (error) {
    console.error("Error generating HTML:", error);
    throw new Error("Failed to generate HTML content.");
  }
}
