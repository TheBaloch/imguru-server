import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface NationalSymbols {
  flag: string;
  animal: string;
  flower: string;
}

export interface MajorCity {
  name: string;
  description: string;
}

export interface FunFact {
  heading: string;
  content: string;
}

export interface Author {
  name: string;
  about: string;
}

export interface WeirdFact {
  heading: string;
  content: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
}

export interface CountryData {
  slug: string;
  name: string;
  rank: string;
  isoAlpha2Code: string;
  isoAlpha3Code: string;
  isoNumericCode: string;
  capitalCity: string;
  continent: string;
  officialLanguage: string;
  currency: string;
  areaKm2: string;
  timeZone: string;
  callingCode: string;
  internetTLD: string;
  governmentType: string;
  independenceDay: string;
  drivingSide: "Left" | "Right";
  officialReligion: string;
  climate: string;
  nationalSymbols: NationalSymbols;
  majorIndustries: string[];
  lifeExpectancy: string;
  majorCities: MajorCity[];
  overview: string;
  title: string;
  introduction: string;
  history: string;
  culture: string;
  geography: string;
  conclusion: string;
  funFacts: FunFact[];
  weirdFacts: WeirdFact[];
  currentAffairs: string;
  touristAttractions: string;
  SEO: SEO;
  Tags: string[];
  author: Author;
}

/**
 * Generates an SEO-friendly blog post based on the provided title.
 * @param {string} name - The name of the country.
 * @returns {Object} The generated blog content as a JSON object.
 */
export async function generateCountry(
  name: string
): Promise<CountryData | null> {
  try {
    const prompt = `Write a comprehensive blog post that provides in-depth information about country: "${name}" with a minimum word count of 2,000 words.
Return the result in the following JSON only format with no additional text:
{
  "slug": "seo-friendly-slug-containing-only-country-name",
  "name": "Correct name and spellings",
  "rank": "Country passport rank",
  "isoAlpha2Code": "The ISO 3166-1 Alpha-2 code",
  "isoAlpha3Code": "The ISO 3166-1 Alpha-3 code",
  "isoNumericCode": "The ISO 3166-1 Numeric code",
  "capitalCity": "capital city of the country",
  "continent": "continent",
  "officialLanguage": "primary official language full name",
  "currency": "The official currency code",
  "areaKm2": "area in Km2 as string",
  "timeZone": "in UTC format as string",
  "callingCode": "international dialing code",
  "internetTLD": "The country’s top-level domain",
  "governmentType": "A descriptive term for the government system (e.g., 'Federal parliamentary republic')",
  "independenceDay": "independenceDay",
  "drivingSide": "Left or Right",
  "officialReligion": "The officially recognized religion(s)",
  "climate": "A brief description of the country’s general climate",
  "nationalSymbols": {
    "flag": "A description or key facts about the national flag.",
    "animal": "The national animal",
    "flower": "The national flower"
  },
  "majorIndustries": [
    "A list of the key industries driving the country’s economy"
  ],
  "lifeExpectancy": "The average life expectancy in the country",
  "majorCities": [
    {
      "name": "The name of a major city",
      "description": "A brief description or notable fact about the city."
    },
    {
      "name": "The name of another major city.",
      "description": "A brief description or notable fact about the city."
    },
    {
      //list all big/major cities
    }
  ],
  "overview": "A concise overview paragraph summarizing key aspects of the country.",
  "title": "A catchy, SEO-friendly title that captures the essence of the content.",
  "introduction": "An engaging introduction paragraph that draws the reader into the topic.",
  "history": "Next JS friendly, SEO optimized, readable, and structured HTML content providing an in-depth historical overview of the country.",
  "culture": "Next JS friendly, SEO optimized, readable, and structured HTML content describing the cultural aspects of the country, including traditions, languages, and arts.",
  "geography": "Next JS friendly, SEO optimized, readable, and structured HTML content detailing the geographical features and landscapes of the country.",
  "conclusion": "A concluding paragraph that summarizes the content and encourages further exploration.",
  "funFacts": [
    {
      "heading": "A brief title for the fun fact.",
      "content": "A concise description of the fun fact."
    },
    {
      "heading": "A brief title for another fun fact.",
      "content": "A concise description of another fun fact."
    },
    "Add additional fun facts following the same structure."
  ],
  "weirdFacts": [
    {
      "heading": "A brief title for the weird fact.",
      "content": "A concise description of the weird fact."
    },
    {
      "heading": "A brief title for another weird fact.",
      "content": "A concise description of another weird fact."
    },
    "Add additional fun facts following the same structure."
  ],
  "currentAffairs": "Next JS friendly, SEO optimized, and structured HTML content covering recent developments, significant events, or current affairs in the country.",
  "touristAttractions": "Next JS friendly, SEO optimized, and structured HTML content highlighting the top tourist attractions or popular destinations in the country.",
  "SEO":{
    "metaTitle":"strong, attention-grabbing title.",
    "metaDescription":"brief and compelling summary of the page content",
    "metaKeywords:["primary keyword","primary keyword","seconday keyword",....add more as suitable],
    "ogTitle":"strong, attention-grabbing title.",
    "ogDescription":"summary of the content, further improving the visibility and appeal of content",
  },
  "Tags":["tag1","tag2","tag3"],  //these are relevent tags or keywords for internal linking,
  "author": {
    "name": "Generate a local name that fits the tone and culture of the country being written about. Consider common or historically significant names from that country for inspiration.",
    "about": "Write a compelling author bio that highlights expertise and background relevant to the country being discussed. Include details such as the author's connection to the country, notable achievements, experience in writing or cultural exploration, and any unique insights they bring to the topic."
  }
}
`;

    const system = `These guidelines are designed to produce high-quality, engaging content about the history and current affairs of various countries. The content should captivate readers, encouraging exploration while remaining optimized for search engines. Follow these instructions closely:
1. Human-like Writing:
	Create original narratives that reflect the nuances of human expression.
	Use natural, engaging language that resonates emotionally with readers.
2. Engaging and Exploratory Storytelling:
	Craft immersive journeys through a country’s history and current events.
	Utilize vivid storytelling techniques to maintain reader curiosity and interest.
3. Originality and Plagiarism Avoidance:
	Ensure all content is 100% original and free from plagiarism.
	Do not copy or closely paraphrase existing content from other sources.
4. SEO Optimization:
	Incorporate low-competition, long-tail keywords relevant to the topic.
	Prioritize niche, low-ranking keywords to improve search engine visibility and attract targeted traffic.
5. Tone and Audience Awareness:
	Maintain a friendly and informative tone, tailored to the interests and curiosities of your target audience.
    Aim for a tone that is both knowledgeable and conversational, making the reader feel as if they are on a journey through the country with an enthusiastic guide.
6. Encourage Further Exploration:
	Conclude with thought-provoking questions or prompts that invite readers to delve deeper into the topic.
7. Technical Output Guidelines:
    Return only JSON format with no additional text or text formatting
	Ensure content is compatible with JSON formatting.
	Use JSON.stringify() to format outputs.
	Sanitize input to remove non-printable characters or unwanted escape sequences.
	Confirm that all outputs are encoded in UTF-8 to prevent encoding issues.
By following these guidelines, the content will align with the unique needs of the target audience while performing well in search engines.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: system,
        },
        { role: "user", content: prompt },
      ],
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      console.error("openai returned no resposne in api in blog generator");
      return null;
    }
    const jsonStartIndex = result.indexOf("{");
    const jsonEndIndex = result.lastIndexOf("}") + 1;
    const jsonString = result.slice(jsonStartIndex, jsonEndIndex);

    const cleanJsonString = jsonString.replace(
      /[\u0000-\u001F\u007F-\u009F`]/g,
      ""
    );
    try {
      const countryData = JSON.parse(cleanJsonString);
      return countryData;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      console.error("Raw JSON string:", cleanJsonString);
      return null;
    }
  } catch (error) {
    console.error("Error during API call:", error);
    return null;
  }
}
