# Website Metadata Implementation Plan

This document outlines the complete strategy for configuring robust, production-ready metadata for **Pesanaja.Lab**. The primary goal is to replace the default "Bolt" link previews with a custom, high-quality website snapshot and establish best practices for SEO and social media sharing.

## 1. Global Metadata Configuration (`src/app/layout.tsx`)

The root layout will serve as the source of truth for our global metadata fallback. We will implement Next.js's Metadata API to define comprehensive site-wide settings.

### Targeted Settings:
*   **Basic SEO**: `title` (using a template string to easily append " | Pesanaja.Lab" to child pages), `description`, `keywords`, `authors`.
*   **Open Graph (Facebook, LinkedIn, Discord)**: `type="website"`, `siteName`, global description, and locale (`id_ID` and/or `en_US`).
*   **Twitter Cards**: `card="summary_large_image"`, `creator` (if applicable), and Twitter-specific title/description fallbacks.
*   **Robots & Canonical**: Ensure search engines properly index the production version and avoid crawling duplicate or prototype paths unnecessarily.
*   **Theme Color & Viewport**: Define `themeColor` to match the brand primary color.

## 2. Social Preview Snapshot (Replacing Bolt Preview)

Currently, the URL preview defaults to a generic platform image. Next.js supports special file conventions in the `app` directory to automatically generate `og:image` and `twitter:image` tags.

### Action Items:
1.  **Capture Snapshot**: Capture a clean, high-resolution (1200x630px recommended) screenshot of the Pesanaja.Lab homepage or create a custom branded banner.
2.  **Implementation**: 
    *   Place the image at `src/app/opengraph-image.jpg` (or `.png`).
    *   Place the image at `src/app/twitter-image.jpg`.
    *   (Optional) Generate an `opengraph-image.alt.txt` for accessibility.
    *   This will globally replace the Bolt preview with our custom snapshot.

## 3. Icons and App Assets

Replace any lingering default icons with Pesanaja.Lab branding.

### Action Items:
1.  Verify/Add `src/app/favicon.ico` (standard browser tab icon).
2.  Verify/Add `src/app/icon.png` (high-res standard icon).
3.  Verify/Add `src/app/apple-icon.png` (for iOS home screen shortcuts).

## 4. Page-Specific Metadata Overrides

We will inject targeted metadata into key individual pages to ensure rich snippets are highly relevant to the specific content being shared.

### Target Pages:
*   **`/search` (Browse Services)**: Title "Browse Local Services", description tailored to discovering and filtering categories.
*   **`/faq` (FAQ Page)**: Already implemented (`FAQ | Pesanaja.Lab`), ensuring searchers see accurate summaries of the help page.
*   **`/contact` (Contact Us)**: Focused on support and business inquiries.
*   **`/dashboard` routes**: Implement `robots: { index: false, follow: false }` to prevent search engines from indexing private user areas.
*   **Business Profile Pages (`/business/[id]`)**: Dynamically generate metadata in `generateMetadata()` based on the specific business name and description fetched from Supabase.

## 5. Web App Manifest (`manifest.json` / `manifest.ts`)

Create a web app manifest to control how the application appears when users save it to their device home screens (PWA experience).

### Action Items:
*   Define `name`, `short_name`, `description`.
*   Set `start_url`, `display: "standalone"`, `background_color`, and `theme_color`.
*   Reference the high-res app icons.

## Execution Strategy

Once approved, the implementation will proceed in the following order:
1. Generate/Capture the 1200x630 snapshot for the `opengraph-image.png`.
2. Apply the global `layout.tsx` metadata updates.
3. Update dynamic metadata for individual routes.
4. Final verification of Open Graph tags using social preview testing tools (like metatags.io or local inspection).
