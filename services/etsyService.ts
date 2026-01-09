// Etsy API integration service
// Uses Etsy Open API v3 to create product listings

const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID;
const ETSY_ACCESS_TOKEN = process.env.ETSY_ACCESS_TOKEN;
const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

export interface EtsyListingPayload {
  quantity: number;
  title: string;
  description: string;
  price: number; // Price in shop currency
  who_made: 'i_did' | 'someone_else' | 'collective';
  when_made: string; // e.g., "2020_2023", "made_to_order"
  taxonomy_id: number; // Product category
  shipping_profile_id?: number;
  return_policy_id?: number;
  production_partner_ids?: number[];
  type: 'physical' | 'digital';
  is_supply: boolean;
  is_customizable: boolean;
  should_auto_renew: boolean;
  is_taxable: boolean;
  tags?: string[];
}

export interface EtsyListing {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: 'active' | 'draft' | 'inactive';
  creation_timestamp: number;
  created_timestamp: number;
  ending_timestamp: number;
  original_creation_timestamp: number;
  last_modified_timestamp: number;
  updated_timestamp: number;
  state_timestamp: number;
  quantity: number;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  taxonomy_id: number;
  url: string;
}

export interface EtsyCreateListingResponse {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  state: string;
  url: string;
}

export interface EtsyImageUploadResponse {
  listing_id: number;
  listing_image_id: number;
  hex_code: string;
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturation: number;
  brightness: number;
  is_black_and_white: boolean;
  creation_tsz: number;
  created_timestamp: number;
  rank: number;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  alt_text: string;
}

// Popular Etsy taxonomy IDs (product categories)
export const ETSY_TAXONOMIES = {
  CLOTHING_TSHIRT: 1964,
  ACCESSORIES_MUG: 1066,
  ART_POSTER: 1066,
  HOME_DECOR: 1063,
  ACCESSORIES_BAG: 1065,
  ACCESSORIES_PHONE_CASE: 2093,
} as const;

/**
 * Check if Etsy credentials are configured
 */
export function isEtsyConfigured(): boolean {
  return !!(ETSY_API_KEY && ETSY_SHOP_ID && ETSY_ACCESS_TOKEN);
}

/**
 * Get Etsy configuration status and details for user feedback
 */
export function getEtsyConfigStatus(): {
  configured: boolean;
  message: string;
} {
  if (!ETSY_API_KEY) {
    return {
      configured: false,
      message: 'Etsy API key is not configured. Please set ETSY_API_KEY in your .env.local file.',
    };
  }
  if (!ETSY_SHOP_ID) {
    return {
      configured: false,
      message: 'Etsy Shop ID is not configured. Please set ETSY_SHOP_ID in your .env.local file.',
    };
  }
  if (!ETSY_ACCESS_TOKEN) {
    return {
      configured: false,
      message: 'Etsy access token is not configured. Please set ETSY_ACCESS_TOKEN in your .env.local file.',
    };
  }
  return {
    configured: true,
    message: `Etsy connected (Shop ID: ${ETSY_SHOP_ID})`,
  };
}

/**
 * Create a product listing on Etsy
 * @param listingData - Product listing configuration
 */
export async function createEtsyListing(
  listingData: EtsyListingPayload
): Promise<EtsyListing> {
  if (!isEtsyConfigured()) {
    throw new Error('Etsy is not configured. Please add ETSY_API_KEY, ETSY_SHOP_ID, and ETSY_ACCESS_TOKEN to your .env.local file.');
  }

  const url = `${ETSY_API_BASE}/application/shops/${ETSY_SHOP_ID}/listings`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': ETSY_API_KEY!,
      'Authorization': `Bearer ${ETSY_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Etsy listing creation error:', errorText);
    
    if (response.status === 401) {
      throw new Error('Etsy authentication failed. Please check your API key and access token.');
    } else if (response.status === 403) {
      throw new Error('Etsy access forbidden. Please verify your OAuth scopes include listings_w.');
    } else if (response.status === 404) {
      throw new Error('Etsy shop not found. Please check your Shop ID.');
    } else if (response.status === 429) {
      throw new Error('Too many requests to Etsy. Please wait a moment and try again.');
    } else if (response.status === 400 || response.status === 422) {
      throw new Error(`Invalid listing data: ${errorText}`);
    } else {
      throw new Error(`Failed to create Etsy listing: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Upload an image to an Etsy listing
 * @param listingId - ID of the listing to add the image to
 * @param imageBase64 - Base64 encoded image data
 * @param rank - Position of the image (1 = primary image)
 * @param altText - Alternative text for the image
 */
export async function uploadEtsyListingImage(
  listingId: number,
  imageBase64: string,
  rank: number = 1,
  altText: string = ''
): Promise<EtsyImageUploadResponse> {
  if (!isEtsyConfigured()) {
    throw new Error('Etsy is not configured. Please add ETSY_API_KEY, ETSY_SHOP_ID, and ETSY_ACCESS_TOKEN to your .env.local file.');
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  // Convert base64 to blob
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/png' });

  const url = `${ETSY_API_BASE}/application/shops/${ETSY_SHOP_ID}/listings/${listingId}/images`;
  
  const formData = new FormData();
  formData.append('image', blob, 'product.png');
  formData.append('rank', rank.toString());
  if (altText) {
    formData.append('alt_text', altText);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': ETSY_API_KEY!,
      'Authorization': `Bearer ${ETSY_ACCESS_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Etsy image upload error:', errorText);
    
    if (response.status === 401) {
      throw new Error('Etsy authentication failed. Please check your API key and access token.');
    } else if (response.status === 404) {
      throw new Error('Etsy listing not found. Please verify the listing ID.');
    } else if (response.status === 429) {
      throw new Error('Too many requests to Etsy. Please wait a moment and try again.');
    } else {
      throw new Error(`Failed to upload image to Etsy: ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data;
}

/**
 * Create a complete Etsy listing with image
 * @param title - Product title (max 140 characters)
 * @param description - Product description
 * @param price - Price in dollars
 * @param imageBase64 - Base64 encoded product image
 * @param taxonomyId - Etsy taxonomy/category ID
 * @param tags - Product tags (max 13 tags, each max 20 characters)
 */
export async function createEtsyProductWithImage(
  title: string,
  description: string,
  price: number,
  imageBase64: string,
  taxonomyId: number = ETSY_TAXONOMIES.CLOTHING_TSHIRT,
  tags: string[] = []
): Promise<{
  listing: EtsyListing;
  image: EtsyImageUploadResponse;
}> {
  try {
    // Validate title length (Etsy max is 140 characters)
    if (title.length > 140) {
      title = title.substring(0, 137) + '...';
    }

    // Validate and truncate tags (max 13 tags, each max 20 chars)
    const validTags = tags
      .slice(0, 13)
      .map(tag => tag.substring(0, 20).toLowerCase().trim())
      .filter(tag => tag.length > 0);

    // Step 1: Create the listing
    console.log('Creating Etsy listing...');
    const listingData: EtsyListingPayload = {
      quantity: 999, // High quantity for print-on-demand
      title: title,
      description: description,
      price: price,
      who_made: 'i_did',
      when_made: 'made_to_order',
      taxonomy_id: taxonomyId,
      type: 'physical',
      is_supply: false,
      is_customizable: false,
      should_auto_renew: true,
      is_taxable: true,
      tags: validTags.length > 0 ? validTags : undefined,
    };

    const listing = await createEtsyListing(listingData);
    console.log('Etsy listing created:', listing.listing_id);

    // Step 2: Upload the product image
    console.log('Uploading product image to Etsy...');
    const image = await uploadEtsyListingImage(
      listing.listing_id,
      imageBase64,
      1,
      title
    );
    console.log('Image uploaded successfully');

    return {
      listing,
      image,
    };
  } catch (error) {
    console.error('Error in createEtsyProductWithImage:', error);
    throw error;
  }
}

/**
 * Sanitize HTML content for use in Etsy descriptions
 */
export function sanitizeHtmlForEtsy(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
