# Pesanaja.Lab Email Branding Guide

When creating HTML emails for Pesanaja.Lab (e.g., booking confirmations, welcome emails, notifications), please strictly adhere to the following branding guidelines to ensure a consistent experience across the platform.

## 1. Color Palette

Use these exact hex codes for all inline styles and CSS within the email.

### Primary Colors
*   **Primary (Brand Color):** `#00B6C0` (Use for main buttons, primary links, and key highlights)
*   **Primary Hover:** `#009CA5`
*   **Foreground (Main Text):** `#243746` (Use for all standard body text and headings)
*   **Background (Main):** `#FFFFFF` (Standard white background for email body and cards)

### Secondary & Muted Colors
*   **Secondary / Muted Background:** `#F8FAFB` (Use for footer backgrounds, subtle callout boxes, or alternating sections)
*   **Secondary / Muted Text:** `#61707E` (Use for secondary information, timestamps, footer links, and subtle text)
*   **Brand Light Accent:** `#D4E2EB` (Use for subtle borders or decorative elements)
*   **Border Color:** `#E5ECF0` (Use for dividers and card borders)

### Status Colors
*   **Success (Green):** `#3BB273` (Use for confirmed bookings, successful payments)
*   **Warning (Yellow/Orange):** `#FFB84D` (Use for pending statuses, required actions)
*   **Destructive/Danger (Red):** `#F15B5B` (Use for cancellations, errors, or alerts)

## 2. Typography

Email clients have limited support for custom web fonts. We use our primary fonts as fallbacks, but ensure standard safe fonts are in the stack.

*   **Primary Heading Font:** `Manrope, Arial, Helvetica, sans-serif`
*   **Body Font:** `Inter, Arial, Helvetica, sans-serif`

### Formatting Rules
*   **Headings (`h1`, `h2`, `h3`):** Use the Heading Font. Ensure they are bold and tracking is slightly tight. Color should be `#243746`.
*   **Body Text (`p`):** Use the Body Font. Standard size should be `14px` or `16px`. Line height should be generous (e.g., `1.5` or `150%`) for readability. Color should be `#243746`.

## 3. UI Elements & Spacing

*   **Buttons (Call to Action):** 
    *   Background: `#00B6C0`
    *   Text Color: `#FFFFFF`
    *   Border Radius: `8px` to `12px`
    *   Padding: `12px 24px`
    *   Font Weight: `bold` or `600`
    *   Text Decoration: `none`
*   **Card/Container Borders:** Use `#E5ECF0` with a `1px solid` style. Border radius should be `12px` or `16px` for main content wrappers.
*   **Dividers (`<hr>`):** Use `1px solid #E5ECF0`.

## 4. Example Email Container CSS

```css
/* Example inline style structure */
.email-body {
  font-family: 'Inter', Arial, sans-serif;
  background-color: #F8FAFB;
  color: #243746;
  padding: 20px;
}
.email-container {
  background-color: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E5ECF0;
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
}
.email-header {
  padding: 24px;
  text-align: center;
}
.email-content {
  padding: 24px;
}
.btn-primary {
  display: inline-block;
  background-color: #00B6C0;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
.email-footer {
  background-color: #F8FAFB;
  color: #61707E;
  padding: 24px;
  text-align: center;
  font-size: 12px;
}
```

Keep all CSS fully inline (or in a `<style>` block if using a tool that inlines it automatically) to ensure maximum compatibility across email clients (Gmail, Outlook, Apple Mail).
