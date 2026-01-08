# Shopify Integration - Security & Implementation Notes

## Security Considerations

### Credentials Management
- **Storage**: All Shopify credentials stored in environment variables via `.env.local`
- **Never logged**: Admin API tokens are never written to console logs
- **Client-side**: Credentials are bundled at build time via Vite's `define` - they exist in the browser bundle
  - ⚠️ **Important**: This is acceptable for personal/single-user apps but NOT for multi-tenant SaaS
  - For production multi-user apps, credentials should be stored server-side
- **Git safety**: `.env.local` is in `.gitignore` to prevent accidental commits
- **Token rotation**: Users should regenerate tokens periodically

### API Security
- **HTTPS only**: All Shopify API calls use HTTPS (enforced by Shopify)
- **No CSRF concerns**: Direct API calls, not cookie-based authentication
- **Input validation**: Product titles limited to 255 chars, descriptions sanitized
- **HTML sanitization**: User content stripped of `<script>` tags and event handlers
- **Rate limiting**: Shopify enforces rate limits; app provides user-friendly error messages

### Attack Vectors Considered
1. **XSS via product description**: Mitigated by HTML sanitization
2. **Token theft**: Tokens in bundle can be extracted - acceptable risk for personal use
3. **Data validation**: Backend validation by Shopify API
4. **Image size attacks**: Shopify enforces image size limits

## Implementation Details

### API Integration
- **Endpoint**: Shopify Admin REST API `/admin/api/2024-01/products.json`
- **Method**: POST for product creation
- **Authentication**: `X-Shopify-Access-Token` header
- **Image upload**: Base64 images sent via `attachment` field in product payload

### Product Creation Flow
1. User clicks "Create Shopify Draft" in modal
2. Validation: Check credentials configured
3. API call: POST product with title, description, image, and metadata
4. Product created as **draft** (not published)
5. Success: Display link to Shopify admin
6. Error: User-friendly message with retry option

### Draft vs Published
- Products created as **drafts** for manual review
- Allows users to:
  - Review AI-generated content before going live
  - Add pricing, inventory, shipping details
  - Adjust images or add variants
- User publishes manually from Shopify admin

### Error Handling
- **401/403**: Authentication/authorization errors → Check credentials
- **422**: Validation errors → Check product data
- **429**: Rate limit → Ask user to wait
- **Network errors**: Connection issues → Retry suggestion
- **Unexpected errors**: Generic error with console log for debugging

### Data Mapping
| App Field | Shopify Field | Notes |
|-----------|---------------|-------|
| title | product.title | Max 255 chars |
| description | product.body_html | HTML content, sanitized |
| imageDataURL | product.images[0].attachment | Base64 encoded |
| productName | product.product_type | E.g., "T-Shirt" |
| (hardcoded) | product.vendor | Set to "AI Generated" |
| (hardcoded) | product.status | Set to "draft" |

## Performance Considerations

### API Call Performance
- **Network bound**: Typical response time 2-5 seconds
- **Image upload**: Base64 images increase payload size (~33% larger than binary)
- **No optimization needed**: One-time operation, acceptable latency
- **User feedback**: Progress messages during API call

### Bundle Size Impact
- **New service file**: ~7KB (minified ~2KB)
- **Updated component**: Minimal size increase
- **No new dependencies**: Uses fetch API (built-in)

## Future Enhancements

### Recommended Next Steps
1. **Server-side integration**: Move credentials to backend for multi-user support
2. **Printify integration**: Connect to POD fulfillment service
3. **Product variants**: Support size/color variants
4. **Bulk operations**: Upload multiple products at once
5. **Pricing management**: Set prices directly in the app
6. **Inventory tracking**: Sync with Printify inventory
7. **Auto-publish option**: Allow users to publish directly (with confirmation)
8. **Etsy integration**: Add Etsy API support
9. **TikTok Shop integration**: Add TikTok Shop API support
10. **Webhook listeners**: Receive notifications from Shopify

### Testing Notes
- **Manual testing required**: Needs real Shopify credentials
- **Test store recommended**: Use Shopify Partner test store for development
- **Rate limits**: Be mindful when testing (Shopify has rate limits)

## Compatibility

### Browser Support
- Modern browsers with fetch API support
- ES2022+ JavaScript features
- No polyfills needed for target audience

### Shopify API Version
- Currently using: `2024-01`
- Shopify maintains API versions for at least 12 months
- Update `SHOPIFY_API_VERSION` env var to use newer versions

### Backward Compatibility
- App still works without Shopify credentials (graceful degradation)
- Existing mock flow available for users without Shopify
- No breaking changes to existing features
