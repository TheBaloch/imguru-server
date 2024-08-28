import { AppDataSource } from "../../config/database";
import { Country } from "../../entities/Country";
import { CountryTranslations } from "../../entities/CountryTranslations";
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
 * Translate the blog via gpt-4o-mini and save the translations.
 * @param {number} countryId - The id of the blog post.
 * @param {string} language - 2 letter ISO language code
 */
export default async function blogTranslate(
  countryId: number,
  language: string
) {
  try {
    const countryRepository = AppDataSource.getRepository(Country);
    const countryTranslationsRepository =
      AppDataSource.getRepository(CountryTranslations);

    const country = await countryRepository.findOne({
      where: { id: countryId },
      relations: ["translations"],
    });

    if (!country) {
      console.error(
        `Country with id:${countryId} not found before translation`
      );
      return;
    }

    const englishCountryTranslation = country.translations.find(
      (t) => t.language === "en"
    );
    if (!englishCountryTranslation) {
      console.error(
        `CountryTranslation en for country_id:${countryId} not found before translation`
      );
      return;
    }

    const JSONDATA = {
      name: englishCountryTranslation.name,
      title: englishCountryTranslation.title,
      capitalCity: englishCountryTranslation.capitalCity,
      continent: englishCountryTranslation.continent,
      officialReligion: englishCountryTranslation.officialReligion,
      officialLanguage: englishCountryTranslation.officialLanguage,
      overview: englishCountryTranslation.overview,
      introduction: englishCountryTranslation.introduction,
      climate: englishCountryTranslation.climate,
      lifeExpectancy: englishCountryTranslation.lifeExpectancy,
      SEO: englishCountryTranslation.SEO,
      nationalSymbols: englishCountryTranslation.nationalSymbols,
      majorIndustries: englishCountryTranslation.majorIndustries,
      majorCities: englishCountryTranslation.majorCities,
      funFacts: englishCountryTranslation.funFacts,
      weirdFacts: englishCountryTranslation.weirdFacts,
      conclusion: englishCountryTranslation.conclusion,
    };
    let TranslatedJSONDATA;
    try {
      TranslatedJSONDATA = await retry(translateJSON, [JSONDATA, language]);
    } catch (e) {
      console.error(
        `Error translating JSON for language:${language} for Country id:${countryId}`,
        e
      );
      return; // Abort if translation fails
    }

    let translatedCountry = new CountryTranslations();
    translatedCountry.language = language;
    translatedCountry.name = TranslatedJSONDATA?.name;
    translatedCountry.title = TranslatedJSONDATA?.title;
    translatedCountry.capitalCity = TranslatedJSONDATA?.capitalCity;
    translatedCountry.continent = TranslatedJSONDATA?.continent;
    translatedCountry.officialReligion = TranslatedJSONDATA?.officialReligion;
    translatedCountry.officialLanguage = TranslatedJSONDATA?.officialLanguage;
    translatedCountry.overview = TranslatedJSONDATA?.overview;
    translatedCountry.introduction = TranslatedJSONDATA?.introduction;
    translatedCountry.climate = TranslatedJSONDATA?.climate;
    translatedCountry.lifeExpectancy = TranslatedJSONDATA?.lifeExpectancy;
    translatedCountry.SEO = TranslatedJSONDATA?.SEO;
    translatedCountry.nationalSymbols = TranslatedJSONDATA?.nationalSymbols;
    translatedCountry.majorIndustries = TranslatedJSONDATA?.majorIndustries;
    translatedCountry.majorCities = TranslatedJSONDATA?.majorCities;
    translatedCountry.funFacts = TranslatedJSONDATA?.funFacts;
    translatedCountry.weirdFacts = TranslatedJSONDATA?.weirdFacts;
    translatedCountry.conclusion = TranslatedJSONDATA?.conclusion;

    try {
      translatedCountry.history = await retry(translateHTML, [
        englishCountryTranslation.history,
        language,
      ]);
      translatedCountry.culture = await retry(translateHTML, [
        englishCountryTranslation.culture,
        language,
      ]);
      translatedCountry.geography = await retry(translateHTML, [
        englishCountryTranslation.geography,
        language,
      ]);
      translatedCountry.currentAffairs = await retry(translateHTML, [
        englishCountryTranslation.currentAffairs,
        language,
      ]);
      translatedCountry.touristAttractions = await retry(translateHTML, [
        englishCountryTranslation.touristAttractions,
        language,
      ]);
    } catch (e) {
      console.error(
        `Error translating HTML for language:${language} for Country id:${countryId}`,
        e
      );
      return;
    }

    translatedCountry = await countryTranslationsRepository.save(
      translatedCountry
    );

    country.translations.push(translatedCountry);
    await countryRepository.save(country);

    addToSitemap(
      `${process.env.CLIENT_URL}/${language}/${process.env.COUNTRY_PATH}/${country.slug}`
    );

    console.log(`Translated: ${country.slug} to ${language}`);
  } catch (e) {
    console.error(
      `Failed translation process for Country id:${countryId} language:${language}`,
      e
    );
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
            "You are an assistant that translates JSON content into a specified language using a two-letter language code. Your response should contain only the translated JSON content in the specified language. Ensure that every string in the JSON is translated and that the structure of the JSON remains unchanged. Do not include any extra text or explanations.",
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

async function translateText(
  TEXTCONTENT: string,
  language: string
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that translates plain text content into the specified language using a two-letter language code. Your response must contain only the translated text, ensuring it is accurate, grammatically correct, and in the specified language. Do not include any extra text, explanations, or formatting.",
        },
        {
          role: "user",
          content: `Translate the following text content into the language specified by the two-letter language code provided. Ensure that the translation is accurate, grammatically correct, and in the specified language. Provide only the translated text without any additional text or formatting.
  Language Code: ${language}
  
  Text Content:
  ${TEXTCONTENT}`,
        },
      ],
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      console.error(
        "OpenAI returned no response in the API for text translation."
      );
      throw new Error("Empty response from OpenAI.");
    }

    const cleanText = result.replace(/[\u0000-\u001F\u007F-\u009F`]/g, "");

    return cleanText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text content.");
  }
}
