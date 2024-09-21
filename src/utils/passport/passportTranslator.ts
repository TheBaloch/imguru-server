import { AppDataSource } from "../../config/database";
import { Passport } from "../../entities/Passport";
import { addToSitemap } from "../sitemap";
import OpenAI from "openai";

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
  throw lastError; // Should not reach here if retries are exhausted
}

/**
 * Translate the passport via gpt-4o-mini and save the translations.
 * @param {number} passportId - The id of the blog post.
 * @param {string} language - 2 letter ISO language code
 */
export default async function passportTranslate(
  passportId: number,
  language: string
) {
  try {
    const passportRepository = AppDataSource.getRepository(Passport);
    const englishPassport = await passportRepository.findOne({
      where: { id: passportId },
      relations: ["country"],
    });
    if (!englishPassport)
      return console.log(
        "Error english passport not found for id:",
        passportId
      );

    const translatedPassport = new Passport();
    translatedPassport.country = englishPassport.country;
    translatedPassport.language = language;
    translatedPassport.mainContent = await retry(translateHTML, [
      englishPassport.mainContent,
      language,
    ]);
    translatedPassport.secondContent = await retry(translateHTML, [
      englishPassport.secondContent,
      language,
    ]);
    translatedPassport.thirdContent = await retry(translateHTML, [
      englishPassport.thirdContent,
      language,
    ]);
    translatedPassport.eTA = await retry(translateJSON, [
      englishPassport.eTA,
      language,
    ]);
    translatedPassport.visaFreeAccess = await retry(translateJSON, [
      englishPassport.visaFreeAccess,
      language,
    ]);
    translatedPassport.visaOnArrival = await retry(translateJSON, [
      englishPassport.visaOnArrival,
      language,
    ]);
    translatedPassport.visaOnline = await retry(translateJSON, [
      englishPassport.visaOnline,
      language,
    ]);
    translatedPassport.visaRequired = await retry(translateJSON, [
      englishPassport.visaRequired,
      language,
    ]);

    await passportRepository.save(translatedPassport);

    addToSitemap(
      `${process.env.CLIENT_URL}/${language}/${process.env.PASSPORT_PATH}/${englishPassport.country.slug}`,
      "passport"
    );

    console.log(
      `Passport translated: ${englishPassport.country.slug} to ${language}`
    );
  } catch (e) {
    console.error(
      `Failed translation process for Country id:${passportId} language:${language}`,
      e
    );
  }
}

async function translateHTML(
  HTMLCONTENT: string,
  language: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates HTML content into the specified language using the provided two-letter language code. Your response must contain only the translated HTML content, preserving all HTML tags and attributes, but translating all text content within the tags. Ensure the translation is accurate, grammatically correct, and uses the specified language. Do not include any extra text or explanations.",
        },
        {
          role: "user",
          content: `Translate the following HTML content into the language specified by the two-letter language code provided. Translate only the text content within the HTML tags, ensuring that the translation is accurate, grammatically correct, and in the specified language. Keep all HTML tags and attributes unchanged. Provide only the translated HTML content without any additional text.
  Language Code: ${language}

  HTML Content:
  ${HTMLCONTENT}`,
        },
      ],
    });

    const translatedContent = completion.choices[0].message.content?.trim();
    if (!translatedContent) {
      throw new Error("Failed to translate HTML content.");
    }

    return translatedContent;
  } catch (error) {
    console.error("Error translating HTML:", error);
    throw new Error("Failed to translate HTML content.");
  }
}

async function translateJSON(JSONCONTENT: any, language: string): Promise<any> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates JSON content into a specified language using a two-letter language code. Your response should contain only the translated JSON content in the specified language. Ensure that every string in the JSON is translated and that the structure of the JSON remains unchanged. Do not include any extra text or explanations do not translate slug.",
        },
        {
          role: "user",
          content: `Translate the following JSON content into the language specified by the two-letter language code provided. Ensure all translatable text within the JSON is translated, and the original content is not returned. Provide only the translated JSON content without any additional text.
          Language Code: ${language}
  
          JSON Content:
          ${JSON.stringify(JSONCONTENT)}`,
        },
      ],
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      console.error(
        "OpenAI returned no response in the API for JSON translation."
      );
      throw new Error("Empty response from OpenAI.");
    }

    const cleanJsonString = result.replace(
      /[\u0000-\u001F\u007F-\u009F`]/g,
      ""
    );
    const translatedObject = JSON.parse(cleanJsonString);
    return translatedObject;
  } catch (error) {
    console.error("Error translating JSON:", error);
    throw new Error("Failed to translate JSON content.");
  }
}
