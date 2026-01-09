# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Printify Integration**: Full print-on-demand integration with Printify API
  - Upload designs directly to Printify
  - Create products with multiple variants (sizes, colors)
  - Automatic publishing to connected sales channels
  - Support for multiple product types (T-shirts, hoodies, mugs, posters, etc.)
  - Configurable print providers and pricing
  - See [PRINTIFY_INTEGRATION.md](./PRINTIFY_INTEGRATION.md) for setup
- **Etsy Integration**: Direct marketplace integration with Etsy
  - Create product listings programmatically
  - Upload product images
  - Support for product categories (taxonomy)
  - Automatic tag management (up to 13 tags)
  - Made-to-order product support
  - See [ETSY_INTEGRATION.md](./ETSY_INTEGRATION.md) for setup
- **Multi-Platform Publishing**: New unified publishing modal
  - Select multiple platforms to publish simultaneously
  - Real-time connection status for each platform
  - Independent error handling per platform
  - Success tracking with direct links to created products
  - Platform-specific configuration validation
- **Enhanced Environment Configuration**: Added support for Printify and Etsy credentials
  - `PRINTIFY_API_TOKEN` - Printify API authentication
  - `PRINTIFY_SHOP_ID` - Printify shop identifier
  - `ETSY_API_KEY` - Etsy API key
  - `ETSY_SHOP_ID` - Etsy shop identifier
  - `ETSY_ACCESS_TOKEN` - Etsy OAuth access token
- **Product Pricing**: Added price configuration field in publish modal
- **Comprehensive Documentation**: 
  - Printify integration guide with troubleshooting
  - Etsy integration guide with compliance checklist
  - Updated README with all platform configurations

### Changed
- Renamed `ShopifyModal` to `PublishModal` for multi-platform support
- Updated UI to show multiple platform options
- Enhanced platform status indicators with real-time feedback
- Improved error messaging for platform-specific issues

### Technical
- Created `printifyService.ts` with complete Printify API integration
- Created `etsyService.ts` with Etsy Open API v3 support
- Updated `vite.config.ts` to include new environment variables
- Maintained backward compatibility with existing Shopify integration

### Security
- All new API integrations use HTTPS-only connections
- Environment variables for all sensitive credentials
- HTML sanitization for product descriptions across all platforms
- Input validation for titles, descriptions, and pricing
- Platform-specific error handling prevents information leakage

## [0.1.0] - Previous Release

### Added
- **Shopify Store Integration**: Real Shopify Admin API integration to push AI-generated products to your store
  - Products created as drafts for manual review before publishing
  - Configuration via environment variables (SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_API_TOKEN)
  - Connection status indicator in product modal
  - Direct link to Shopify admin after product creation
  - Comprehensive error handling with user-friendly messages
- Documentation for Shopify configuration in README.md
- `.env.local.example` template file for easy credential setup
- `SHOPIFY_INTEGRATION.md` documentation with security and implementation notes

### Changed
- Updated `ShopifyModal` component to use real API instead of mock setTimeout flow
- Enhanced environment variable configuration in `vite.config.ts` to support Shopify credentials
- Improved product creation flow with real-time progress indicators

### Security
- Implemented HTML sanitization for product descriptions to prevent XSS attacks
- Added input validation for product titles (max 255 characters)
- Type-safe error handling with proper type guards
- All API calls use HTTPS (enforced by Shopify)
- Credentials stored in environment variables and never logged
- Passed CodeQL security scan with 0 vulnerabilities

## [0.0.0] - 2025-11-18

### Initial Features
- AI-powered image generation using Gemini AI
- Product mockup creation with customizable templates
- Image editing and style transfer capabilities
- Marketing copy generation (titles, descriptions, social media captions)
- Brand kit management for consistent branding
- Background and color variation generation
- Upscaling and style transfer features
- News integration with Google Search grounding
- Multiple product mockup presets (T-Shirt, Mug, Poster, etc.)
