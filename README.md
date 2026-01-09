# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sBK9m7xOgqpxCLZlcdkJI4UP5LB3F2oi

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Configure Shopify integration:
   - Set `SHOPIFY_SHOP_DOMAIN` to your shop domain (e.g., `my-store.myshopify.com`)
   - Set `SHOPIFY_ADMIN_API_TOKEN` to your Shopify Admin API access token
   - See [Shopify Configuration](#shopify-configuration) below for details
4. Run the app:
   `npm run dev`

## Shopify Configuration

To enable Shopify store integration for publishing AI-generated products:

### 1. Create a Shopify Custom App

1. Log in to your Shopify admin panel
2. Go to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app** and give it a name (e.g., "AI Merch Generator")
4. Go to the **API credentials** tab
5. Under **Admin API access token**, click **Install app** and then **Reveal token once**
6. Copy the Admin API access token (you'll need this for `SHOPIFY_ADMIN_API_TOKEN`)

### 2. Configure API Permissions

Your app needs the following scopes:
- `write_products` - To create product drafts
- `read_products` - To verify product creation

### 3. Add Credentials to .env.local

Create or edit `.env.local` in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_VERSION=2024-01
```

See [SHOPIFY_INTEGRATION.md](./SHOPIFY_INTEGRATION.md) for detailed setup instructions.

## Printify Configuration

To enable print-on-demand fulfillment with Printify:

### 1. Create a Printify Account

1. Sign up at [Printify.com](https://printify.com)
2. Create or connect your shop

### 2. Get Your API Token

1. Go to **Account** → **API** in Printify dashboard
2. Click **Generate Token**
3. Copy the token and your Shop ID

### 3. Add Credentials to .env.local

```
PRINTIFY_API_TOKEN=your_printify_api_token_here
PRINTIFY_SHOP_ID=your_shop_id_here
```

See [PRINTIFY_INTEGRATION.md](./PRINTIFY_INTEGRATION.md) for detailed setup instructions.

## Etsy Configuration

To enable Etsy marketplace integration:

### 1. Create an Etsy Seller Account

1. Sign up at [Etsy.com](https://www.etsy.com/sell)
2. Complete your shop setup

### 2. Register Your App

1. Go to [Etsy Developer Portal](https://www.etsy.com/developers/your-apps)
2. Create a new app and get your API key
3. Complete OAuth 2.0 flow to get access token

### 3. Add Credentials to .env.local

```
ETSY_API_KEY=your_etsy_api_key_here
ETSY_SHOP_ID=your_etsy_shop_id_here
ETSY_ACCESS_TOKEN=your_etsy_access_token_here
```

See [ETSY_INTEGRATION.md](./ETSY_INTEGRATION.md) for detailed setup instructions.

**Security Notes for All Platforms:**
- Never commit `.env.local` to version control
- Keep your API tokens secure
- Tokens grant access to your stores - treat them like passwords
- Regenerate tokens if they are ever exposed

### 4. Test the Integration

1. Run the app with `npm run dev`
2. Generate a product mockup
3. Click "Push to Shopify" button
4. Select which platforms to publish to (Shopify, Printify, Etsy)
5. Verify connection status for each platform shows "✓ Connected"
6. Set product details and price
7. Check compliance checkbox
8. Click "Publish" to create products on selected platforms
9. Verify products appear in respective admin panels

## Features

- **AI Image Generation**: Generate product mockups from text prompts using Gemini AI
- **Image Editing**: Apply custom edits, styles, and variations to uploaded images
- **Product Mockups**: Preview designs on various merchandise items
- **Marketing Copy**: Auto-generate product titles, descriptions, and social media content
- **Multi-Platform Publishing**: Push products directly to multiple sales channels
  - **Shopify Integration**: Publish as product drafts to your Shopify store
  - **Printify Integration**: Create print-on-demand products with automatic fulfillment
  - **Etsy Integration**: List products directly on Etsy marketplace
- **Brand Kit**: Maintain brand consistency with custom colors and logos
- **Batch Publishing**: Publish to multiple platforms simultaneously

## Build for Production

```bash
npm run build
npm run preview
```
