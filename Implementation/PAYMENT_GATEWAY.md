# Payment Gateway Implementation Record

## Overview
This document outlines the architecture for the B2B payment gateway integration used to monetize the Pesanaja.Lab platform. The system uses **Xendit** to manage subscriptions and payment collections from Business owners before they are allowed to operate publicly on the platform.

## The Subscription Wall Workflow

The onboarding pipeline enforces a strict "Verification + Payment" gate to ensure quality and monetization.

### Phase 1: Verification
1. A customer upgrades their account to a Business profile.
2. The Admin reviews the submitted details.
3. Upon approval, the business `status` becomes `verified` in Supabase, but `is_subscribed` remains `false`.
4. Due to marketplace filtering logic, the business is **not visible** to customers yet.

### Phase 2: Checkout & Invoice Creation
1. The business owner logs in and is immediately redirected to the `/dashboard/business/subscription` locking page.
2. The owner initiates the payment process.
3. A secure server action communicates with the Xendit API to generate a unique Invoice URL.
4. The business owner is redirected to the Xendit hosted checkout page to complete payment.

### Phase 3: Webhook Fulfillment
1. Once the owner successfully pays via Xendit, Xendit fires an asynchronous HTTP POST request (Webhook) back to the Pesanaja.Lab API (`/api/webhooks/xendit`).
2. The Webhook endpoint verifies the authenticity of the incoming request (via security tokens/callbacks).
3. The server extracts the `external_id` (which maps to the Supabase `business_id`).
4. The server securely updates the Supabase `businesses` table:
   * `is_subscribed = true`
5. The business is instantly unlocked, gains full dashboard access, and becomes visible in the public customer marketplace.

## Webhook Security Considerations
- **No Client-Side Trust:** The application never trusts client-side success redirects. The business is only unlocked when the secure, server-to-server webhook confirmation is received from Xendit.
- **Service Role Bypass:** Because webhooks are unauthenticated external requests, the webhook handler uses the `SUPABASE_SERVICE_ROLE_KEY` to securely bypass RLS and update the `is_subscribed` flag for the targeted business.

## Environment Variables Required
To maintain the payment infrastructure, the following environment variables are required in production:
* `XENDIT_SECRET_KEY`: Used to generate invoices.
* `XENDIT_WEBHOOK_TOKEN`: Used to verify incoming webhook authenticity.
