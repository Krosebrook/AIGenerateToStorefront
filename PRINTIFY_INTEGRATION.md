# Printify Integration Guide

This guide explains how to set up and use the Printify print-on-demand integration to automatically create and fulfill products.

## What is Printify?

Printify is a print-on-demand platform that connects you with multiple print providers globally. When you create a product in Printify and connect it to your sales channels (Shopify, Etsy, etc.), orders are automatically fulfilled without you having to handle inventory or shipping.

## Setup Instructions

### 1. Create a Printify Account

1. Go to [Printify.com](https://printify.com) and sign up
2. Verify your email and complete your profile
3. Create a shop in Printify (or connect an existing one)

### 2. Get Your API Token

1. Log into your Printify account
2. Go to **Account** → **API**
3. Click **Generate Token**
4. Copy the generated API token (starts with `eyJ...`)
5. Choose the appropriate scopes:
   - `shops.read` - Required to read shop information
   - `products.read` - Required to view products
   - `products.write` - Required to create and update products
   - `uploads.read` - Required to view uploaded images
   - `uploads.write` - Required to upload design images

### 3. Find Your Shop ID

Option A: From Dashboard URL
- When logged into Printify, look at the URL: `https://printify.com/app/stores/XXXXXX`
- The number `XXXXXX` is your Shop ID

Option B: Via API
```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.printify.com/v1/shops.json
```

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Printify Configuration
PRINTIFY_API_TOKEN=eyJ...your_token_here
PRINTIFY_SHOP_ID=1234567
```

### 5. Restart the Application

```bash
npm run dev
```

## How to Use

### Creating a Product

1. **Generate or Upload an Image**: Use the AI generation or upload your design
2. **Click "Push to Shopify"** (button will be updated to show multi-platform options)
3. **Select Platforms**: Check the "Printify" option
4. **Configure Product**:
   - Set the product title
   - Add a description
   - Set the price (default: $25.00)
   - Add hashtags for Etsy if publishing there too
5. **Check Compliance**: Confirm you have rights to use the design
6. **Click "Publish"**: The app will:
   - Upload your design image to Printify
   - Create the product with default variants (S, M, L for t-shirts)
   - Optionally publish to connected sales channels

### Product Types Supported

The integration currently supports these product blueprints:

- **T-Shirts** (Unisex Classic) - Default
- **Hoodies** (Unisex)
- **Coffee Mugs** (11oz)
- **Posters** (Multiple sizes)
- **Canvas Prints**
- **Tote Bags**
- **Phone Cases**
- **Stickers**

## Print Providers

By default, the integration uses Monster Digital as the print provider. You can modify this in the code by changing the `printProviderId` parameter.

Popular print providers include:
- **Monster Digital** (ID: 1) - Fast, high quality
- **Creative Zone** (ID: 2)
- **Duplium** (ID: 3)
- **SwiftPOD** (ID: 8)
- **Printful** (ID: 10)

## Connecting Printify to Sales Channels

### Shopify Integration

If you have both Printify and Shopify configured:

1. In Printify dashboard, go to **My sales channels**
2. Click **Add Sales Channel** → Select **Shopify**
3. Authorize the connection
4. When you publish a product via this app, it will automatically sync to Shopify

### Etsy Integration

1. In Printify dashboard, go to **My sales channels**
2. Click **Add Sales Channel** → Select **Etsy**
3. Authorize the connection with your Etsy account
4. Products will sync to Etsy when published

## Pricing Strategy

When setting product prices, consider:

1. **Base Cost**: Printify charges a base cost per product (varies by provider and product type)
2. **Shipping**: Customers pay shipping separately
3. **Your Margin**: Set your price above the base cost to earn profit
4. **Market Competition**: Research similar products on target platforms

Example pricing for T-Shirts:
- Printify Base Cost: ~$7-12 (depends on provider and size)
- Suggested Retail: $25-35
- Your Profit: $13-25 per sale

## Troubleshooting

### "Printify is not configured"

**Solution**: Verify your `.env.local` file has both `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID` set correctly.

### "Printify authentication failed"

**Solution**: 
- Check that your API token is valid and not expired
- Verify the token has the required scopes
- Regenerate the token if needed

### "Invalid product data"

**Solution**:
- Ensure the product title is not empty
- Check that the image is valid (PNG/JPEG)
- Verify the blueprint ID is correct

### "Too many requests"

**Solution**: 
- Wait a moment before retrying
- Printify has rate limits: 600 requests/min globally, 100 requests/min for catalog endpoints

### Product not appearing in Shopify/Etsy

**Solution**:
- Verify your sales channel is connected in Printify dashboard
- Check that the publish step succeeded (look for success message)
- Products may take a few minutes to sync
- Manually verify in Printify dashboard under "My Products"

## API Rate Limits

Printify enforces these rate limits:
- **Global**: 600 requests per minute
- **Catalog Endpoints**: 100 requests per minute
- **Publishing**: 200 requests per 30 minutes

The app handles rate limiting gracefully with user-friendly error messages.

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Keep API tokens secret** - treat them like passwords
3. **Regenerate tokens** if they are ever exposed
4. **Use environment-specific tokens** for development vs. production
5. **Review API access logs** regularly in Printify dashboard

## Advanced Configuration

### Custom Variant Selection

By default, the app creates products with standard sizes (S, M, L). To customize:

1. Fetch available variants from Printify Catalog API
2. Modify the `getDefaultVariantIds()` function in `printifyService.ts`
3. Specify custom variant IDs and prices

### Custom Blueprint Selection

To change the product type:

1. Find the blueprint ID from [Printify Catalog API](https://developers.printify.com/docs/)
2. Pass the blueprint ID when calling `createAndPublishProduct()`

Example:
```typescript
await createAndPublishProduct(
  title,
  description,
  imageUrl,
  PRINTIFY_BLUEPRINTS.HOODIE, // Change product type
  1, // Print provider
  35.00 // Price
);
```

## Resources

- [Printify Developer Documentation](https://developers.printify.com/docs/)
- [Printify Help Center](https://help.printify.com/)
- [Product Catalog](https://printify.com/app/products)
- [Profit Calculator](https://printify.com/profit-calculator/)

## Support

For issues specific to this integration, please open an issue on GitHub.

For Printify-specific questions, contact [Printify Support](https://help.printify.com/hc/en-us/requests/new).
