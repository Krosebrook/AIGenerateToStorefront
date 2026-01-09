# Etsy Integration Guide

This guide explains how to set up and use the Etsy marketplace integration to publish AI-generated products directly to your Etsy shop.

## What is Etsy?

Etsy is a global marketplace for unique, creative goods. It's perfect for selling custom merchandise, art prints, and handmade items. With this integration, you can publish AI-generated product listings directly to your Etsy shop.

## Setup Instructions

### 1. Create an Etsy Seller Account

1. Go to [Etsy.com](https://www.etsy.com) and sign up
2. Click **Sell on Etsy** to create a seller account
3. Complete your shop profile and preferences
4. Note your Shop ID (found in Shop Settings or URL)

### 2. Register Your App

1. Go to [Etsy Developer Portal](https://www.etsy.com/developers/your-apps)
2. Click **Create a New App**
3. Fill in app details:
   - App Name: "AI Merch Generator" (or your choice)
   - App Description: Describe your use case
   - App URL: Your app URL or `http://localhost:3000`
4. Submit and wait for approval (usually instant for personal use)

### 3. Configure OAuth 2.0

Etsy uses OAuth 2.0 for authentication. You'll need:

- **API Key** (also called "keystring")
- **Shop ID** (your Etsy shop ID)
- **Access Token** (obtained via OAuth flow)

#### Getting Your API Key

1. Go to your app in the [Developer Dashboard](https://www.etsy.com/developers/your-apps)
2. Copy the **Keystring** (this is your API Key)

#### Getting Your Shop ID

Option A: From Shop URL
- Your shop URL looks like: `https://www.etsy.com/shop/YourShopName`
- Or in settings: `https://www.etsy.com/your/shops/XXXXXX/dashboard`
- The number `XXXXXX` is your Shop ID

Option B: Via API
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://openapi.etsy.com/v3/application/users/me/shops
```

#### Getting Your Access Token

⚠️ **Important**: Etsy OAuth requires a server-side implementation for security. For development/personal use, you can use the [Etsy OAuth Token Tool](https://www.etsy.com/developers/documentation/getting_started/oauth).

**Required OAuth Scopes**:
- `listings_w` - Create and edit listings
- `listings_r` - Read listing data

For production applications, implement a proper OAuth 2.0 flow with PKCE.

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Etsy Configuration
ETSY_API_KEY=your_api_key_here
ETSY_SHOP_ID=12345678
ETSY_ACCESS_TOKEN=your_oauth_access_token_here
```

⚠️ **Security Note**: Access tokens expire. For production, implement token refresh logic.

### 5. Restart the Application

```bash
npm run dev
```

## How to Use

### Publishing a Product to Etsy

1. **Generate or Upload an Image**: Create your product mockup
2. **Click "Push to Shopify"** (will show multi-platform options)
3. **Select "Etsy"**: Check the Etsy platform checkbox
4. **Configure Product**:
   - **Title**: Max 140 characters (will be auto-truncated)
   - **Description**: Detailed product description
   - **Price**: Set your price in USD
   - **Hashtags**: Add up to 13 tags (max 20 chars each)
5. **Check Compliance**: Confirm you have rights to use the design
6. **Click "Publish"**: The app will:
   - Create the listing on Etsy as "draft" status
   - Upload your product image
   - Return a direct link to your listing

### Etsy Listing Best Practices

1. **Title**: Include keywords customers search for (e.g., "Astronaut T-Shirt Space Art Print on Demand")
2. **Description**: Be detailed about:
   - What the product is
   - Materials and quality
   - Size information
   - Shipping details
   - That it's made-to-order via print-on-demand
3. **Tags**: Use all 13 tags with relevant keywords
4. **Images**: Use high-quality mockups (at least 2000x2000px recommended)

### Product Categories

The integration uses taxonomy IDs for categorization. Common categories:

- **T-Shirts**: 1964
- **Mugs**: 1066
- **Posters**: 1066
- **Home Decor**: 1063
- **Bags**: 1065
- **Phone Cases**: 2093

You can find more taxonomy IDs in the [Etsy Seller Taxonomy](https://www.etsy.com/developers/documentation/reference/taxonomy).

## Etsy Policies for Print-on-Demand

⚠️ **Important**: Etsy has specific rules for POD sellers:

### 1. Disclose Your Production Partner

You **must** disclose that you use a production partner (like Printify) in your listing:

1. Go to your listing settings
2. Under **Production Partners**, add your POD provider
3. This is visible to customers and required by Etsy policy

### 2. "Who Made It" Selection

- Choose **"A member of my shop"** if you design and another company prints
- Do NOT choose **"I did"** unless you physically make the item

### 3. "When Made" Selection

- Choose **"Made to order"** for print-on-demand products

### 4. Handmade vs. Designed

- Your items must have a **handmade or design element**
- Simply uploading stock designs is not allowed
- AI-generated custom designs are acceptable if you customize them

### 5. Copyright and Trademark

- You must own the rights to all designs
- No copyrighted characters, logos, or trademarks
- No fan art without proper licensing
- Original AI-generated designs are generally safe

## Pricing Strategy

When pricing Etsy listings, consider:

1. **Etsy Fees**:
   - Listing fee: $0.20 per listing
   - Transaction fee: 6.5% of sale price
   - Payment processing: 3% + $0.25
   - Offsite Ads: 15% (if applicable)
2. **Production Cost**: Printify or fulfillment partner cost
3. **Shipping**: Offer free shipping or charge separately
4. **Your Profit Margin**: Aim for 30-50% margin after all costs

Example T-Shirt Pricing:
- Production Cost: $10
- Etsy Fees (~10%): $3
- Shipping: $5 (if not free)
- Total Cost: $18
- Suggested Price: $28-35
- Your Profit: $10-17

## Troubleshooting

### "Etsy is not configured"

**Solution**: Verify your `.env.local` has all three variables: `ETSY_API_KEY`, `ETSY_SHOP_ID`, and `ETSY_ACCESS_TOKEN`.

### "Etsy authentication failed"

**Solutions**:
- Verify API key is correct
- Check access token hasn't expired
- Ensure OAuth scopes include `listings_w` and `listings_r`
- Regenerate access token if needed

### "Etsy access forbidden"

**Solutions**:
- Verify OAuth scopes include `listings_w` permission
- Check that your app is approved by Etsy
- Ensure you're using the correct Shop ID

### "Invalid listing data"

**Solutions**:
- Check title is not empty and under 140 characters
- Verify price is a positive number
- Ensure taxonomy ID is valid
- Check that tags don't exceed 20 characters each

### "Title too long"

**Solution**: Etsy limits titles to 140 characters. The app auto-truncates, but you may want to manually shorten for better readability.

### Listing not appearing in shop

**Solutions**:
- Listings are created as **drafts** by default
- Go to your Etsy Shop Manager → Listings → Drafts
- Edit and publish manually after review
- Verify all required fields are filled

## Etsy Shop Optimization

### SEO Best Practices

1. **Keywords in Title**: Front-load important keywords
2. **Complete All Fields**: Fill out materials, occasion, style, etc.
3. **Use All 13 Tags**: Include long-tail keywords
4. **High-Quality Images**: Use mockups and lifestyle photos
5. **Detailed Descriptions**: Answer common questions
6. **Reviews**: Encourage satisfied customers to leave reviews

### Shop Policies

Set up clear shop policies for:
- **Shipping**: Timeline and carriers
- **Returns**: Print-on-demand items are often final sale
- **Production Time**: Be honest about made-to-order timelines
- **Custom Orders**: Whether you accept custom requests

### Shipping Profiles

Create shipping profiles in Etsy for:
- Domestic shipping rates
- International shipping rates
- Processing time (include print production time)

## Integration with Printify

If you're using both Etsy and Printify:

1. **Connect Printify to Etsy**:
   - In Printify dashboard, add Etsy as a sales channel
   - Authorize the connection
2. **Create products in Printify first**:
   - Products sync automatically to Etsy
   - Orders are fulfilled automatically
3. **Alternative flow**:
   - Create listing via this app
   - Manually create matching Printify product
   - Link them in Printify dashboard

## API Rate Limits

Etsy enforces rate limits:
- **10,000 requests per day** per app
- Burst limits may apply
- Requests throttled if limits exceeded

The app handles rate limiting with user-friendly error messages.

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Keep access tokens secret** - treat like passwords
3. **Implement token refresh** for production apps
4. **Use HTTPS** for all API calls (enforced by Etsy)
5. **Monitor API usage** in Etsy developer dashboard

## Advanced Configuration

### Custom Taxonomy Selection

To use different product categories:

```typescript
await createEtsyProductWithImage(
  title,
  description,
  price,
  imageUrl,
  ETSY_TAXONOMIES.HOME_DECOR, // Change category
  tags
);
```

### Production Partner Disclosure

After creating listings, manually add your production partner:
1. Go to Shop Manager → Listings
2. Edit listing → Production Partners
3. Add "Printify" or your partner's name

## Resources

- [Etsy Developer Documentation](https://www.etsy.com/developers/documentation)
- [Etsy Seller Handbook](https://www.etsy.com/seller-handbook)
- [Etsy Seller Policies](https://www.etsy.com/legal/sellers/)
- [Etsy Forums](https://www.etsy.com/forums)
- [Print on Demand on Etsy Guide](https://www.etsy.com/seller-handbook/article/22677246736)

## Support

For integration issues, open a GitHub issue.

For Etsy-specific questions, contact [Etsy Support](https://help.etsy.com/hc/en-us).

## Compliance Checklist

Before publishing to Etsy, verify:

- [ ] I own the rights to this design
- [ ] No copyrighted characters or logos
- [ ] Production partner will be disclosed in listing
- [ ] "Who Made" is set correctly (member of shop, not "I did")
- [ ] "When Made" is set to "Made to order"
- [ ] Product description is accurate and complete
- [ ] Price includes all costs and fees
- [ ] Shipping information is accurate
