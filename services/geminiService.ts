import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ShopifyProductDetails } from "../App";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const PRODUCT_LIST = ['T-Shirt', 'Mug', 'Poster', 'Hoodie', 'Stickers', 'Phone Case', 'Hat', 'Notebook', 'Tote Bag'].join(', ');

export async function generateImageFromPrompt(prompt: string, negativePrompt: string, numberOfImages: number, aspectRatio: string): Promise<string[]> {
  try {
    const finalPrompt = negativePrompt 
      ? `${prompt}\n\nNegative prompt: please avoid ${negativePrompt}` 
      : prompt;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: finalPrompt,
        config: {
          numberOfImages,
          outputMimeType: 'image/png',
          aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
    } else {
      throw new Error("No image data returned from API.");
    }

  } catch (error) {
    console.error("Error calling Gemini API for image generation:", error);
    throw new Error("Failed to generate image from prompt with Gemini API.");
  }
}

export async function editImageWithPrompt(base64ImageData: string, mimeType: string, prompt: string, negativePrompt: string): Promise<string> {
  try {
    const finalPrompt = negativePrompt
      ? `${prompt}\n\nNegative prompt: please avoid ${negativePrompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
      const newBase64Data = response.candidates[0].content.parts[0].inlineData.data;
      return `data:image/png;base64,${newBase64Data}`;
    } else {
      throw new Error("No image data returned from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for image editing:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
}

export async function suggestProductsForImage(base64ImageData: string, mimeType: string): Promise<string[]> {
  const prompt = `Analyze the following image. Based on its style, content, and complexity, suggest the top 3 most suitable merchandise products to print it on. Choose ONLY from the following list: ${PRODUCT_LIST}. Respond in a JSON object with a single key "suggestions" containing an array of the product names as strings, for example {"suggestions": ["T-Shirt", "Mug", "Stickers"]}.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: 'A list of suggested product names.',
              items: { type: Type.STRING }
            }
          },
          required: ['suggestions']
        }
      }
    });

    const json = JSON.parse(response.text);
    return json.suggestions || [];

  } catch (error) {
    console.error("Error calling Gemini API for product suggestion:", error);
    throw new Error("Failed to suggest products with Gemini API.");
  }
}

export async function generateProductDetails(base64ImageData: string, mimeType: string, productName: string): Promise<ShopifyProductDetails> {
  const prompt = `Generate a catchy product title and a compelling product description for a ${productName} featuring this design. The title should be short and punchy. The description should be 2-3 sentences long and highlight the design's appeal. Respond in a valid JSON object with two keys: "title" and "description".`;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The catchy product title.'
            },
            description: {
              type: Type.STRING,
              description: 'The compelling product description.'
            }
          },
          required: ['title', 'description']
        }
      }
    });

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error calling Gemini API for product details:", error);
    throw new Error("Failed to generate product details with Gemini API.");
  }
}