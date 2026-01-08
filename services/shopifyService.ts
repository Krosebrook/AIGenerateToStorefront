// Shopify Admin API integration service
// Uses Shopify Admin REST API to create product drafts

const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ADMIN_API_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-01';

export interface ShopifyProductPayload {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: 'draft' | 'active';
  images?: Array<{ src: string }>;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  admin_graphql_api_id: string;
}

export interface ShopifyCreateProductResponse {
  product: ShopifyProduct;
}

/**
 * Check if Shopify credentials are configured
 */
export function isShopifyConfigured(): boolean {
  return !!(SHOPIFY_SHOP_DOMAIN && SHOPIFY_ADMIN_API_TOKEN);
}

/**
 * Get Shopify configuration status and details for user feedback
 */
export function getShopifyConfigStatus(): {
  configured: boolean;
  message: string;
} {
  if (!SHOPIFY_SHOP_DOMAIN) {
    return {
      configured: false,
      message: 'Shopify shop domain is not configured. Please set SHOPIFY_SHOP_DOMAIN in your .env.local file.',
    };
  }
  if (!SHOPIFY_ADMIN_API_TOKEN) {
    return {
      configured: false,
      message: 'Shopify admin API token is not configured. Please set SHOPIFY_ADMIN_API_TOKEN in your .env.local file.',
    };
  }
  return {
    configured: true,
    message: `Connected to ${SHOPIFY_SHOP_DOMAIN}`,
  };
}

/**
 * Convert data URL (base64) to a Blob for potential future upload
 * Note: Shopify REST API accepts image URLs or base64 in the src field
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Sanitize HTML content for Shopify product descriptions
 * Removes potentially dangerous scripts while preserving basic formatting
 */
export function sanitizeHtmlForShopify(html: string): string {
  // Basic HTML escaping for user-provided content
  // Shopify accepts HTML in body_html, but we should be cautious
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

/**
 * Create a product draft in Shopify store
 * @param productData Product information including title, description, and image
 * @returns Shopify product object with ID and handle
 */
export async function createShopifyProduct(productData: {
  title: string;
  description: string;
  imageDataURL: string;
  productType?: string;
}): Promise<ShopifyProduct> {
  
  if (!isShopifyConfigured()) {
    throw new Error('Shopify is not configured. Please add your credentials to .env.local');
  }

  // Validate input
  if (!productData.title || productData.title.trim().length === 0) {
    throw new Error('Product title is required');
  }

  if (productData.title.length > 255) {
    throw new Error('Product title must be 255 characters or less');
  }

  // Prepare product payload for Shopify API
  const sanitizedDescription = sanitizeHtmlForShopify(productData.description);
  
  const payload: { product: ShopifyProductPayload } = {
    product: {
      title: productData.title.trim(),
      body_html: sanitizedDescription,
      vendor: 'AI Generated',
      product_type: productData.productType || 'Print on Demand',
      status: 'draft', // Create as draft for review
    },
  };

  // Add image if provided
  // Shopify REST API accepts base64-encoded images in the attachment field
  // or image URLs in the src field
  if (productData.imageDataURL) {
    // For base64 images, we need to use the attachment field format
    const base64Data = productData.imageDataURL.split(',')[1];
    if (base64Data) {
      payload.product.images = [{
        attachment: base64Data,
        filename: `${Date.now()}.png`,
      } as any]; // Type assertion needed as attachment isn't in standard type
    }
  }

  const apiUrl = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Shopify API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.errors) {
          errorMessage = `Shopify API error: ${JSON.stringify(errorData.errors)}`;
        }
      } catch (parseError) {
        // If we can't parse the error, use the status text
      }
      
      // Provide user-friendly messages for common errors
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your Shopify Admin API token.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please ensure your API token has the required permissions.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 422) {
        throw new Error('Invalid product data. Please check your product information and try again.');
      }
      
      throw new Error(errorMessage);
    }

    const result: ShopifyCreateProductResponse = await response.json();
    
    if (!result.product || !result.product.id) {
      throw new Error('Unexpected response from Shopify API - no product returned');
    }

    console.log('Successfully created Shopify product:', {
      id: result.product.id,
      title: result.product.title,
      handle: result.product.handle,
    });

    return result.product;

  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Shopify. Please check your internet connection.');
    }
    
    // Re-throw error with context
    console.error('Error creating Shopify product:', error);
    throw error;
  }
}

/**
 * Get the admin URL for a product
 */
export function getShopifyProductAdminUrl(productId: number): string {
  return `https://${SHOPIFY_SHOP_DOMAIN}/admin/products/${productId}`;
}

/**
 * Get the storefront URL for a product (useful for published products)
 */
export function getShopifyProductStorefrontUrl(handle: string): string {
  return `https://${SHOPIFY_SHOP_DOMAIN}/products/${handle}`;
}
