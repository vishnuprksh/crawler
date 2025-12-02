import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GroundingSource } from "../types";

// Initialize Gemini Client
// NOTE: API_KEY must be provided in the environment or replaced here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models - Enforcing Gemini 2.5 Flash as requested
const SEARCH_MODEL = 'gemini-2.5-flash'; 
const FORMAT_MODEL = 'gemini-2.5-flash';

/**
 * Step 1: Perform the search using Google Search Grounding.
 * We cannot enforce JSON schema here easily because of the tool usage limitation combined with schema.
 * So we get raw text first.
 */
async function searchTopic(query: string): Promise<{ text: string; sources: GroundingSource[] }> {
  try {
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: `Find the latest, most interesting, and specific news, research papers, or developments regarding: "${query}". 
      Focus on items from the last 24-48 hours if possible. 
      Provide a comprehensive summary of 3 distinct stories/papers found.`,
      config: {
        tools: [{ googleSearch: {} }],
        // No responseSchema here as per guidelines when using Tools
      },
    });

    const text = response.text || "";
    
    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Search step failed:", error);
    throw new Error("Failed to search for topic.");
  }
}

/**
 * Step 2: Format the search results into structured JSON "Cards".
 * We pass the raw text and ask Gemini to structure it.
 */
interface RawCardData {
  title: string;
  teaser: string;
  content: string;
}

async function formatResultsToCards(searchText: string, query: string): Promise<RawCardData[]> {
  try {
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A catchy, clickbait-style headline for the news item. Max 10 words.",
          },
          teaser: {
            type: Type.STRING,
            description: "A short, intriguing summary (under 150 chars) that makes the user want to read more.",
          },
          content: {
            type: Type.STRING,
            description: "A detailed explanation of the news item, main findings, or key points. Markdown supported.",
          },
        },
        required: ["title", "teaser", "content"],
      },
    };

    const response = await ai.models.generateContent({
      model: FORMAT_MODEL,
      contents: `You are an editor for a tech news aggregator called "Crawler". 
      Here is raw information gathered from a search about "${query}":
      
      ---
      ${searchText}
      ---
      
      Extract 3 distinct news items/stories from this text.
      Format them into the requested JSON structure.
      Make the titles punchy and interesting.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr) as RawCardData[];
  } catch (error) {
    console.error("Formatting step failed:", error);
    return [];
  }
}

/**
 * Main Orchestrator Function
 */
export async function generateCardsForTopic(topicId: string, query: string): Promise<any[]> {
  // 1. Search
  const searchResult = await searchTopic(query);
  
  // 2. Format
  const formattedItems = await formatResultsToCards(searchResult.text, query);

  // 3. Enrich with metadata
  return formattedItems.map(item => ({
    id: crypto.randomUUID(),
    topicId,
    topicQuery: query,
    title: item.title,
    teaser: item.teaser,
    content: item.content,
    generatedAt: Date.now(),
    sources: searchResult.sources, // Attach all sources for the topic to each card (simplification)
    isRead: false,
    isArchived: false,
    // Assign a random placeholder image based on a hash of the title to keep it consistent
    imageUrl: `https://picsum.photos/seed/${item.title.replace(/\s/g, '').slice(0, 10)}/600/400`
  }));
}