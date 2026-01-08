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

**Security Notes:**
- Never commit `.env.local` to version control
- Keep your API tokens secure
- Tokens grant access to your store - treat them like passwords
- Regenerate tokens if they are ever exposed

### 4. Test the Integration

1. Run the app with `npm run dev`
2. Generate a product mockup
3. Click "Push to Shopify" button
4. Verify the modal shows "✓ Shopify Connected"
5. Create a product draft - it will appear in your Shopify admin under Products (as a draft)

## Features

- **AI Image Generation**: Generate product mockups from text prompts using Gemini AI
- **Image Editing**: Apply custom edits, styles, and variations to uploaded images
- **Product Mockups**: Preview designs on various merchandise items
- **Marketing Copy**: Auto-generate product titles, descriptions, and social media content
- **Shopify Integration**: Push products directly to your Shopify store as drafts
- **Brand Kit**: Maintain brand consistency with custom colors and logos

## Build for Production

```bash
npm run build
npm run preview
```
