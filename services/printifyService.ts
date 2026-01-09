// Printify API integration service
// Uses Printify REST API to create POD products and manage fulfillment

const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_BASE = 'https://api.printify.com/v1';

export interface PrintifyImage {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
  upload_time: string;
}

export interface PrintifyUploadResponse {
  id: string;
  file_name: string;
  height: number;
  width: number;
  size: number;
  mime_type: string;
  preview_url: string;
  upload_time: string;
}

export interface PrintifyVariant {
  id: number;
  price: number; // Price in cents
  is_enabled: boolean;
}

export interface PrintifyPrintArea {
  variant_ids: number[];
  placeholders: Array<{
    position: string;
    images: Array<{
      id: string;
      x: number;
      y: number;
      scale: number;
      angle: number;
    }>;
  }>;
}

export interface PrintifyProductPayload {
  title: string;
  description: string;
  blueprint_id: number; // Product type (e.g., 384 for t-shirt)
  print_provider_id: number; // Print provider to use
  variants: PrintifyVariant[];
  print_areas: PrintifyPrintArea[];
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: PrintifyPrintArea[];
  variants: PrintifyVariant[];
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PrintifyCreateProductResponse {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visible: boolean;
}

export interface PrintifyPublishResponse {
  id: string;
  title: string;
  handle: string;
  external: {
    id: string;
    handle: string;
  };
}

// Common blueprint IDs for popular products
export const PRINTIFY_BLUEPRINTS = {
  UNISEX_TSHIRT: 3, // Classic Unisex T-Shirt
  HOODIE: 5, // Unisex Hoodie
  MUG: 19, // Coffee Mug
  POSTER: 165, // Poster
  CANVAS: 67, // Canvas
  TOTE_BAG: 26, // Tote Bag
  PHONE_CASE: 77, // Phone Case
  STICKER: 380, // Stickers
} as const;

// Popular print providers
export const PRINTIFY_PROVIDERS = {
  MONSTER_DIGITAL: 1,
  CREATIVE_ZONE: 2,
  DUPLIUM: 3,
  SWIFTPOD: 8,
  PRINTFUL: 10,
} as const;

/**
 * Check if Printify credentials are configured
 */
export function isPrintifyConfigured(): boolean {
  return !!(PRINTIFY_API_TOKEN && PRINTIFY_SHOP_ID);
}

/**
 * Get Printify configuration status and details for user feedback
 */
export function getPrintifyConfigStatus(): {
  configured: boolean;
  message: string;
} {
  if (!PRINTIFY_API_TOKEN) {
    return {
      configured: false,
      message: 'Printify API token is not configured. Please set PRINTIFY_API_TOKEN in your .env.local file.',
    };
  }
  if (!PRINTIFY_SHOP_ID) {
    return {
      configured: false,
      message: 'Printify Shop ID is not configured. Please set PRINTIFY_SHOP_ID in your .env.local file.',
    };
  }
  return {
    configured: true,
    message: `Printify connected (Shop ID: ${PRINTIFY_SHOP_ID})`,
  };
}

/**
 * Upload an image to Printify for use in products
 * @param imageBase64 - Base64 encoded image data (with or without data URL prefix)
 * @param fileName - Name for the uploaded file
 */
export async function uploadImageToPrintify(
  imageBase64: string,
  fileName: string = 'design.png'
): Promise<PrintifyUploadResponse> {
  if (!isPrintifyConfigured()) {
    throw new Error('Printify is not configured. Please add PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID to your .env.local file.');
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const url = `${PRINTIFY_API_BASE}/uploads/images.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_name: fileName,
      contents: base64Data,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Printify upload error:', errorText);
    
    if (response.status === 401) {
      throw new Error('Printify authentication failed. Please check your API token.');
    } else if (response.status === 429) {
      throw new Error('Too many requests to Printify. Please wait a moment and try again.');
    } else {
      throw new Error(`Failed to upload image to Printify: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Create a product in Printify
 * @param productData - Product configuration including title, description, blueprint, variants, and print areas
 */
export async function createPrintifyProduct(
  productData: PrintifyProductPayload
): Promise<PrintifyProduct> {
  if (!isPrintifyConfigured()) {
    throw new Error('Printify is not configured. Please add PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID to your .env.local file.');
  }

  const url = `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Printify product creation error:', errorText);
    
    if (response.status === 401) {
      throw new Error('Printify authentication failed. Please check your API token.');
    } else if (response.status === 429) {
      throw new Error('Too many requests to Printify. Please wait a moment and try again.');
    } else if (response.status === 422) {
      throw new Error('Invalid product data. Please check the product configuration.');
    } else {
      throw new Error(`Failed to create Printify product: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Publish a Printify product to a connected sales channel (e.g., Shopify)
 * @param productId - ID of the Printify product to publish
 */
export async function publishPrintifyProduct(
  productId: string
): Promise<PrintifyPublishResponse> {
  if (!isPrintifyConfigured()) {
    throw new Error('Printify is not configured. Please add PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID to your .env.local file.');
  }

  const url = `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${productId}/publish.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: true, // Use Printify title
      description: true, // Use Printify description
      images: true, // Publish images
      variants: true, // Publish variants
      tags: true, // Publish tags
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Printify publish error:', errorText);
    
    if (response.status === 401) {
      throw new Error('Printify authentication failed. Please check your API token.');
    } else if (response.status === 404) {
      throw new Error('Product not found. Please verify the product ID.');
    } else if (response.status === 409) {
      throw new Error('Product already published to this sales channel.');
    } else if (response.status === 429) {
      throw new Error('Too many requests to Printify. Please wait a moment and try again.');
    } else {
      throw new Error(`Failed to publish Printify product: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Create and publish a complete POD product
 * @param title - Product title
 * @param description - Product description
 * @param imageBase64 - Base64 encoded design image
 * @param blueprintId - Printify blueprint ID (product type)
 * @param printProviderId - Printify print provider ID
 * @param price - Price in dollars (will be converted to cents)
 */
export async function createAndPublishProduct(
  title: string,
  description: string,
  imageBase64: string,
  blueprintId: number = PRINTIFY_BLUEPRINTS.UNISEX_TSHIRT,
  printProviderId: number = PRINTIFY_PROVIDERS.MONSTER_DIGITAL,
  price: number = 25.00
): Promise<{
  product: PrintifyProduct;
  publishResult?: PrintifyPublishResponse;
}> {
  try {
    // Step 1: Upload the design image
    console.log('Uploading design to Printify...');
    const uploadedImage = await uploadImageToPrintify(imageBase64, `${title}.png`);

    // Step 2: Get variant IDs for the blueprint (simplified - using common variants)
    // In a production app, you'd fetch these from the Printify catalog API
    const variantIds = await getDefaultVariantIds(blueprintId);

    // Step 3: Create the product with the uploaded design
    console.log('Creating Printify product...');
    const productData: PrintifyProductPayload = {
      title: title,
      description: description,
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      variants: variantIds.map(id => ({
        id: id,
        price: Math.round(price * 100), // Convert dollars to cents
        is_enabled: true,
      })),
      print_areas: [
        {
          variant_ids: variantIds,
          placeholders: [
            {
              position: 'front',
              images: [
                {
                  id: uploadedImage.id,
                  x: 0.5,
                  y: 0.5,
                  scale: 1,
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
    };

    const product = await createPrintifyProduct(productData);
    console.log('Printify product created:', product.id);

    // Step 4: Publish to connected sales channel (optional, can fail if no channel connected)
    let publishResult;
    try {
      console.log('Publishing to sales channel...');
      publishResult = await publishPrintifyProduct(product.id);
      console.log('Product published successfully');
    } catch (publishError) {
      console.warn('Could not publish to sales channel:', publishError);
      // Non-fatal error - product is still created in Printify
    }

    return {
      product,
      publishResult,
    };
  } catch (error) {
    console.error('Error in createAndPublishProduct:', error);
    throw error;
  }
}

/**
 * Get default variant IDs for a blueprint
 * This is a simplified version. In production, fetch from Printify catalog API
 */
async function getDefaultVariantIds(blueprintId: number): Promise<number[]> {
  // Common variant IDs for popular blueprints (these are examples)
  // In production, you should fetch these from the Printify Catalog API
  const defaultVariants: Record<number, number[]> = {
    [PRINTIFY_BLUEPRINTS.UNISEX_TSHIRT]: [45740, 45742, 45744], // S, M, L
    [PRINTIFY_BLUEPRINTS.HOODIE]: [46012, 46014, 46016], // S, M, L
    [PRINTIFY_BLUEPRINTS.MUG]: [12019], // 11oz
    [PRINTIFY_BLUEPRINTS.POSTER]: [18237, 18238], // 12x18, 18x24
    [PRINTIFY_BLUEPRINTS.TOTE_BAG]: [31112], // One size
  };

  return defaultVariants[blueprintId] || [45740]; // Default to a common variant
}

/**
 * Sanitize HTML content for use in product descriptions
 */
export function sanitizeHtmlForPrintify(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
