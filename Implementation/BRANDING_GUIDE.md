# PesanajaLab Email Branding Guide

This guide establishes the visual language and technical best practices for all automated emails sent from PesanajaLab. Since email clients (Gmail, Outlook, Apple Mail) have varying support for modern CSS, these guidelines balance a **premium, modern aesthetic** with rock-solid email client compatibility.

## 1. Design Aesthetics & Philosophy
Our emails should feel as premium and dynamic as our web application. Every email should evoke trust, clarity, and professionalism. 
- **Vibe:** Sleek, Premium, Trustworthy, and Modern.
- **Space:** Use generous whitespace to let content breathe. Avoid cluttered layouts.
- **Focus:** Every email should have one clear primary Call-To-Action (CTA).

## 2. Color Palette
Use these exact hex codes for inline styling. Avoid using CSS variables as they are not supported in many email clients.

| Color Role | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Brand** | `#2563EB` (Royal Blue) | Primary buttons, important links, brand highlights. |
| **Primary Dark** | `#0F172A` (Slate 900) | Headers, footers, and high-contrast hero backgrounds. |
| **Background** | `#F8FAFC` (Slate 50) | The outer background of the email body. |
| **Content Card** | `#FFFFFF` (White) | The background of the central 600px content wrapper. |
| **Primary Text** | `#334155` (Slate 700) | Main body text. Never use pure black (`#000000`). |
| **Muted Text** | `#64748B` (Slate 500) | Footer text, disclaimers, timestamps, and secondary info. |
| **Success Accent** | `#10B981` (Emerald) | Order confirmations, successful payments, checkmarks. |

## 3. Typography
Email clients are notoriously bad at rendering custom web fonts. We must use a robust font stack.
- **Primary Font Stack:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Headings (H1, H2, H3):** Bold (700 weight), `#0F172A`. Line-height: 1.3.
- **Body Text:** Normal (400 weight), `#334155`, 16px size. Line-height: 1.6 for excellent readability.

## 4. Layout & Structure Guidelines
- **Max Width:** Constrain the main email content to a maximum width of **600px**. This ensures the email doesn't stretch awkwardly on wide desktop screens and fits nicely on mobile.
- **Centering:** Center the 600px wrapper within a slightly off-white background (`#F8FAFC`).
- **Padding:** Use generous padding (e.g., `32px` or `40px` on desktop, `20px` on mobile) inside the main white content card.
- **Dividers:** Use subtle borders to separate sections. E.g., `border-top: 1px solid #E2E8F0;`.

## 5. UI Elements
### Buttons (CTAs)
Buttons must be built using HTML tables or highly compatible inline CSS to ensure they look like buttons on all clients (especially Outlook).
- **Style:** Background `#2563EB`, Text `#FFFFFF`, rounded corners (`border-radius: 6px`), bold text.
- **Padding:** `12px 24px` for comfortable tapping on mobile devices.
- **Link Styling:** Ensure `text-decoration: none` so the button text doesn't get underlined.

### Images & Logos
- Always include `alt` text for all images.
- Define explicit `width` and `height` attributes (not just CSS) to prevent layout shifts if images are blocked.
- Use `display: block; border: 0;` on all images to remove weird spacing in Gmail.

## 6. HTML Email Technical Best Practices
1. **Inline CSS is King:** While some modern clients support `<style>` blocks in the `<head>`, inline styles (e.g., `<div style="...">`) are the only 100% reliable way to style emails. 
2. **Table Layouts:** When complex multi-column layouts are needed, use HTML `<table>` structures rather than CSS Grid or Flexbox, which fail in Outlook.
3. **Responsive Design:** Use media queries in the `<head>` specifically targeting mobile screens (max-width: 600px) to stack columns and increase font sizes for readability.
4. **Dark Mode Considerations:** Many users use dark mode. Ensure text has sufficient contrast and avoid using transparent PNGs with dark text that will disappear on dark backgrounds. Add a subtle white stroke or glow to logos if necessary.

---
*Reference this guide whenever drafting HTML templates for Nodemailer.*
