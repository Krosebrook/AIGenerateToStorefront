import { GoogleGenAI, Modality, Type, Part } from "@google/genai";
import { ShopifyProductDetails, NewsArticle } from "../App";
import { BrandKit } from "../components/BrandKitPanel";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface GroundingSource {
    uri: string;
    title: string;
}

const PRODUCT_LIST = ['T-Shirt', 'Mug', 'Poster', 'Hoodie', 'Stickers', 'Phone Case', 'Hat', 'Notebook', 'Tote Bag'].join(', ');

const orchestratorResponseSchema = {
    type: Type.OBJECT,
    properties: {
        request_id: { type: Type.STRING },
        execution_log: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.NUMBER },
                    status: { type: Type.STRING },
                    detail: { type: Type.STRING }
                },
            }
        },
        asset_generation_request: {
            type: Type.OBJECT,
            properties: {
                model_name: { type: Type.STRING },
                target_prompt: { type: Type.STRING },
                negative_prompt: { type: Type.STRING },
                resolution: { type: Type.STRING },
                aspect_ratio: { type: Type.STRING },
            },
        },
        marketing_package: {
            type: Type.OBJECT,
            properties: {
                target_keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                listing_title: { type: Type.STRING },
                product_description: { type: Type.STRING },
                social_caption: { type: Type.STRING },
                ad_copy_variations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
        }
    },
};

export async function orchestrateProductGeneration(
    userPrompt: string,
    negativePrompt: string,
    aspectRatio: string,
    variations: number,
): Promise<{ imageUrls: string[], marketingPackage: ShopifyProductDetails }> {
    const orchestratorSystemPrompt = `You are the Generative AI Architect and E-commerce Design Orchestrator. Your goal is to convert a user's creative idea into a single, structured JSON payload.
- You MUST output only the final JSON object. Do not include commentary or explanations.
- Adhere to the provided JSON schema.
- The 'target_prompt' should be a high-fidelity, highly descriptive, style-constrained prompt suitable for a modern text-to-image model like Imagen 4.
- The 'marketing_package' should be creative, engaging, and optimized for e-commerce.

User's Creative Idea:
---
${userPrompt}
---

Additional Instructions:
- Negative prompt cues: ${negativePrompt || 'blurry, text, logo, watermark, extra limbs, bad anatomy'}
- Target aspect ratio: ${aspectRatio}
- Resolution target: 4096x4096
`;

    try {
        // Step 1: Call Gemini to get the structured plan (image prompt + marketing copy)
        const planResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: orchestratorSystemPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: orchestratorResponseSchema,
            },
        });

        const plan = JSON.parse(planResponse.text);

        const { asset_generation_request, marketing_package } = plan;

        // Step 2: Use the generated prompt to create the image
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: asset_generation_request.target_prompt,
            config: {
                numberOfImages: variations,
                outputMimeType: 'image/png',
                aspectRatio: asset_generation_request.aspect_ratio || aspectRatio,
            },
        });

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("Image generation step failed to return images.");
        }

        const imageUrls = imageResponse.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);

        // Step 3: Map the marketing package to our app's interface
        const finalMarketingPackage: ShopifyProductDetails = {
            title: marketing_package.listing_title,
            description: marketing_package.product_description,
            socialMediaCaption: marketing_package.social_caption,
            adCopy: marketing_package.ad_copy_variations,
            hashtags: marketing_package.hashtags,
        };

        return { imageUrls, marketingPackage: finalMarketingPackage };

    } catch (error) {
        console.error("Error during product orchestration:", error);
        throw new Error("Failed to orchestrate product generation with Gemini API.");
    }
}


export async function fetchLatestNews(): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> {
  const prompt = 'Fetch the top 5 latest world news headlines. Respond ONLY with a valid JSON array where each object has "title", "summary", and "url" keys. Do not include any introductory text, markdown formatting, or explanations.';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    // Clean the response text to extract the JSON part.
    let jsonText = response.text;
    const jsonStartIndex = jsonText.indexOf('[');
    const jsonEndIndex = jsonText.lastIndexOf(']');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    const articles = JSON.parse(jsonText) as NewsArticle[];
    
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = rawChunks
      .map(chunk => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || ''
      }))
      .filter(source => source.uri); // Filter out any empty sources

    return { articles, sources };

  } catch (error) {
    console.error("Error calling Gemini API for news fetching:", error);
    throw new Error("Failed to fetch news with Gemini API.");
  }
}

export async function generateImageFromPrompt(prompt: string, negativePrompt: string, numberOfImages: number, aspectRatio: string): Promise<string[]> {
  try {
    const finalPrompt = negativePrompt 
      ? `${prompt}\n\n**Negative Prompt:** Do not include any of the following elements: ${negativePrompt}` 
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

export async function editImageWithPrompt(
  base64ImageData: string, 
  mimeType: string, 
  prompt: string, 
  negativePrompt: string,
  brandKit?: BrandKit
): Promise<string> {
  try {
    
    let finalPrompt = prompt;

    if (brandKit && (brandKit.logo || brandKit.colors.length > 0)) {
        let brandInstructions = [];
        if (brandKit.logo) {
            brandInstructions.push("The second image provided is a brand logo. Please incorporate it naturally onto the product shown in the first image.");
        }
        if (brandKit.colors.length > 0) {
            brandInstructions.push(`The design should prioritize or be complemented by the following brand colors: ${brandKit.colors.join(', ')}.`);
        }
        if (brandInstructions.length > 0) {
            finalPrompt += `\n\n**Brand Guidelines:** ${brandInstructions.join(' ')}`;
        }
    }

    if (negativePrompt) {
        finalPrompt += `\n\n**Negative Prompt:** Do not include any of the following elements: ${negativePrompt}`;
    }

    const parts: Part[] = [
      { inlineData: { data: base64ImageData, mimeType: mimeType } }
    ];

    if (brandKit?.logo) {
      const [logoHeader, logoData] = brandKit.logo.split(';base64,');
      const logoMimeType = logoHeader.replace('data:', '');
      parts.push({
        inlineData: { data: logoData, mimeType: logoMimeType }
      });
    }

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
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
  const prompt = `
    You are a professional e-commerce copywriter. For the provided image design on a ${productName}, generate a complete marketing package.
    The response must be a single, valid JSON object.

    The JSON object should contain the following keys:
    - "title": A short, catchy, and SEO-friendly product title (max 60 characters).
    - "description": A compelling product description (2-3 sentences) that highlights the design's unique appeal and the product's quality.
    - "socialMediaCaption": A ready-to-use caption for an Instagram or Facebook post, including 1-2 relevant emojis.
    - "adCopy": An array of two distinct, short ad copy variations suitable for social media ads. Each variation should have a different angle (e.g., one focuses on the design, the other on the feeling it evokes).
    - "hashtags": An array of 5-7 relevant and popular hashtags (without the '#' symbol).
  `;

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
            },
            socialMediaCaption: {
              type: Type.STRING,
              description: 'A caption for social media posts.'
            },
            adCopy: {
              type: Type.ARRAY,
              description: 'Two distinct ad copy variations.',
              items: { type: Type.STRING }
            },
            hashtags: {
              type: Type.ARRAY,
              description: 'An array of 5-7 relevant hashtags.',
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'description', 'socialMediaCaption', 'adCopy', 'hashtags']
        }
      }
    });

    return JSON.parse(response.text);

  } catch (error) {
    console.error("Error calling Gemini API for product details:", error);
    throw new Error("Failed to generate product details with Gemini API.");
  }
}
