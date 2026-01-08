# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
