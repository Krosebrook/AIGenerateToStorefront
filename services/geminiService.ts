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

const STYLE_PROMPTS: Record<string, string> = {
  'Photorealistic': 'Analyze the image and enhance it to be hyper-realistic. Sharpen details, refine textures, and adjust lighting to create a photorealistic, high-fidelity version of the original scene. Do not change the content, only the style.',
  'Vector Art': 'Transform this image into a clean, modern vector illustration. Use bold lines, flat colors, and simplified shapes. The result should look like a scalable vector graphic, suitable for digital media.',
  'Vintage': 'Give this image a vintage, retro aesthetic. Apply a faded, warm color palette (sepia tones), add subtle film grain, and introduce minor imperfections like light leaks or soft focus to evoke the feeling of a photograph from the 1970s.',
  'Watercolor': 'Recreate this image in the style of a watercolor painting. Use soft, blended colors, visible brush strokes, and a textured paper background. The edges should be soft and bleed slightly, characteristic of watercolor art.',
  'Cyberpunk': `Convert this image to a vibrant, neon-drenched cyberpunk style. Emphasize blues, purples, and pinks. Add glowing elements, digital artifacts, and a high-tech, futuristic feel. The lighting should be dramatic and moody.`,
  'Pop Art': `Transform this image into a Pop Art style, reminiscent of Andy Warhol. Use bold, contrasting, and saturated colors. Simplify the image into distinct shapes and add Ben-Day dots or other graphic patterns.`,
};

const MARKETING_VISUAL_PROMPTS = {
  'Instagram Post': 'Create a photorealistic mockup of an Instagram post featuring the provided design. The design should be the main focus, placed within a modern smartphone screen showing the Instagram UI. The background should be a stylish, minimalist desk or a relevant lifestyle scene that complements the design. Include a generic profile picture, username, and placeholder caption text.',
  'Facebook Ad': 'Generate a compelling Facebook ad visual. The provided design should be clearly displayed on the relevant product (e.g., a t-shirt if it looks like a t-shirt design). Place this product in an eye-catching, high-energy lifestyle photo. The composition should be dynamic and optimized for a feed, leaving some space for ad copy overlay. The overall mood should be professional and engaging.',
  'Pinterest Pin': 'Create a visually appealing Pinterest Pin mockup. The provided design should be featured prominently on a product. The overall image should be vertically oriented (2:3 aspect ratio) and follow a bright, clean aesthetic. Add some tasteful text overlay like "New Collection" or "Shop Now" in a stylish font.'
};

export async function generateMarketingImage(base64ImageData: string, mimeType: string, visualType: keyof typeof MARKETING_VISUAL_PROMPTS): Promise<string> {
  const prompt = MARKETING_VISUAL_PROMPTS[visualType];
  if (!prompt) {
    throw new Error(`Invalid marketing visual type: ${visualType}`);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt }
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
      throw new Error(`No image data returned from API for ${visualType}.`);
    }
  } catch (error) {
    console.error(`Error calling Gemini API for marketing visual "${visualType}":`, error);
    throw new Error(`Failed to generate marketing visual for "${visualType}" with Gemini API.`);
  }
}

export async function applyStyleTransfer(base64ImageData: string, mimeType: string, styleName: string): Promise<string> {
  const prompt = STYLE_PROMPTS[styleName];
  if (!prompt) {
    throw new Error(`Invalid style name: ${styleName}`);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt }
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
      throw new Error("No styled image data returned from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for style transfer:", error);
    throw new Error("Failed to apply style with Gemini API.");
  }
}

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

export async function upscaleImage(base64ImageData: string, mimeType: string): Promise<string> {
  try {
    const upscalePrompt = "Upscale this image, significantly enhancing its resolution and detail for high-quality printing. Remove any compression artifacts, noise, or blurriness, while preserving the original artistic style and composition. Aim for a photorealistic enhancement.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: upscalePrompt }
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
      throw new Error("No upscaled image data returned from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API for image upscaling:", error);
    throw new Error("Failed to upscale image with Gemini API.");
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
    - "adCopy": An array of EXACTLY two distinct, short ad copy variations for social media ads. Variation 1 MUST focus on the visual style of the design. Variation 2 MUST focus on the emotion or story it tells.
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
