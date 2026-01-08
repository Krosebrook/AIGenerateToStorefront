# Testing and Verification Guide

## Manual Testing Steps

### Prerequisites
1. Node.js installed
2. Gemini API key configured in `.env.local`
3. (Optional) Shopify test store for integration testing

### 1. Build Verification

```bash
npm install
npm run build
```

**Expected Result**: Build completes successfully with no errors.

### 2. Development Server

```bash
npm run dev
```

**Expected Result**: Server starts on http://localhost:3000

### 3. Basic Functionality (No Shopify)

1. **Image Upload**:
   - Upload a logo or design image
   - Verify image preview displays correctly

2. **Product Mockup Generation**:
   - Select "Edit Mode"
   - Choose a product preset (e.g., T-Shirt)
   - Click "Generate" or "Apply Mockup"
   - Verify mockup generates successfully

3. **Marketing Copy Generation**:
   - Generate or upload an image
   - Click "Push to Shopify" button
   - Modal should open and show marketing copy
   - **Expected**: "⚠️ Shopify Not Configured" warning displayed

### 4. Shopify Integration Testing

**Setup**:
1. Create a Shopify Partner account (free): https://partners.shopify.com/
2. Create a development store
3. Create a custom app in the store:
   - Go to Settings → Apps and sales channels → Develop apps
   - Create new app with name "AI Merch Generator Test"
   - Configure API scopes: `write_products`, `read_products`
   - Install app and get Admin API token
4. Add credentials to `.env.local`:
   ```
   SHOPIFY_SHOP_DOMAIN=your-dev-store.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxx
   ```
5. Restart dev server

**Test Cases**:

#### Test Case 1: Connection Status
1. Open Shopify modal after generating a mockup
2. **Expected**: "✓ Shopify Connected" message appears
3. **Expected**: Shows shop domain in connection message

#### Test Case 2: Product Creation - Success
1. Generate a product mockup
2. Click "Push to Shopify"
3. Review auto-generated marketing copy (title, description, etc.)
4. Check compliance checkbox
5. Click "Create Shopify Draft"
6. **Expected**: Progress messages appear (Validating → Uploading → Creating)
7. **Expected**: Success message with link to Shopify admin
8. Click link to verify product exists in Shopify
9. **Expected**: Product appears as draft in Shopify admin
10. **Expected**: Product has correct title, description, and image

#### Test Case 3: Product Creation - Validation Errors
1. Generate a mockup
2. Open Shopify modal
3. Clear the product title field
4. Check compliance checkbox
5. Click "Create Shopify Draft"
6. **Expected**: Error message about missing title

#### Test Case 4: Product Creation - Invalid Credentials
1. Set invalid SHOPIFY_ADMIN_API_TOKEN in `.env.local`
2. Restart server
3. Try to create a product
4. **Expected**: Error message about authentication failure

#### Test Case 5: XSS Prevention
1. Generate a mockup
2. Open Shopify modal
3. Add HTML/script tags to description: `<script>alert('xss')</script>`
4. Create product
5. Check Shopify admin
6. **Expected**: Script tags are escaped, not executed

### 5. Error Handling Tests

#### Test Case 6: Network Failure
1. Disconnect from internet
2. Try to create a Shopify product
3. **Expected**: Network error message displayed

#### Test Case 7: Long Title
1. Generate a mockup
2. Edit title to be > 255 characters
3. Try to create product
4. **Expected**: Error about title length (validation happens before API call)

### 6. UI/UX Verification

1. **Loading States**:
   - Verify spinner/loading message appears during generation
   - Verify button is disabled during API calls

2. **Error Display**:
   - Verify error messages are visible and readable
   - Verify errors don't break the UI

3. **Success Feedback**:
   - Verify success message is clear
   - Verify link to Shopify admin is clickable and opens new tab

4. **Responsive Design**:
   - Test on mobile viewport (< 768px)
   - Test on tablet viewport (768-1024px)
   - Verify modal is scrollable on small screens

## Automated Testing (Future)

Currently, no automated tests exist. Recommended additions:

### Unit Tests (Recommended)
- `shopifyService.ts` functions
- HTML sanitization
- Input validation
- Error handling logic

### Integration Tests (Recommended)
- Shopify API mocking
- End-to-end product creation flow
- Error scenarios

### Example Test Framework Setup
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## Performance Testing

### Metrics to Monitor
1. **Build Time**: Should be < 5 seconds
2. **Product Creation**: Should complete in 3-10 seconds (network dependent)
3. **Image Upload**: Should handle images up to 10MB
4. **Bundle Size**: Currently ~570KB (acceptable for this app)

### Load Testing
- Not applicable for single-user personal app
- If deploying as SaaS, test with multiple concurrent users

## Security Testing

### CodeQL Scan
```bash
# Run CodeQL scan (if configured in GitHub Actions)
# Should report 0 vulnerabilities
```

**Current Status**: ✅ 0 vulnerabilities found

### Manual Security Checks
- [x] Credentials not in git repository
- [x] API tokens not logged to console
- [x] HTML in descriptions is escaped
- [x] Input validation on title length
- [x] HTTPS for all API calls
- [x] No SQL injection (no database)
- [x] No CSRF (no cookies)

## Verification Checklist

Before merging to main:
- [ ] Build completes without errors
- [ ] Dev server starts successfully
- [ ] Basic image generation works
- [ ] Shopify modal opens and displays marketing copy
- [ ] With credentials: Product creation succeeds
- [ ] Product appears in Shopify admin as draft
- [ ] Error messages display correctly
- [ ] CodeQL scan passes (0 vulnerabilities)
- [ ] README is updated with clear instructions
- [ ] CHANGELOG is updated
- [ ] All git commits have clear messages

## Known Limitations

1. **Credentials in Bundle**: Shopify credentials are bundled in client-side code. This is acceptable for personal use but NOT for multi-tenant SaaS.
2. **No Undo**: Product creation cannot be undone from the app (must delete from Shopify admin).
3. **Single Variant**: Only creates basic product, no size/color variants.
4. **No Pricing**: Prices must be set manually in Shopify admin.
5. **Draft Only**: Products created as drafts, must be published manually.

## Troubleshooting

### Issue: "Shopify Not Configured" Warning
**Solution**: Add credentials to `.env.local` and restart dev server.

### Issue: "Authentication Failed" Error
**Solution**: 
1. Verify API token is correct
2. Check token has `write_products` scope
3. Ensure app is installed in your store

### Issue: Product Created But No Image
**Solution**: 
1. Check image size (< 20MB)
2. Verify image is valid PNG/JPEG
3. Check Shopify admin for error messages

### Issue: Rate Limit Error
**Solution**: Wait 1-2 minutes before retrying. Shopify limits API calls.

## Support and Documentation

- **Shopify API Docs**: https://shopify.dev/docs/api/admin-rest
- **Gemini AI Docs**: https://ai.google.dev/docs
- **Project Issues**: https://github.com/Krosebrook/AIGenerateToStorefront/issues
