# Email Notification System Documentation

## Overview
This document records the implementation details of the Email Notification System for the Pesanaja.Lab platform. The system uses **Nodemailer** with Gmail (`business@asimetrilab.com`) as the SMTP provider. All email logic is fully synchronized with the Supabase database and executed via Next.js Server Actions.

## Security & RLS Bypass
To fetch user emails securely without exposing them to the client side or violating Supabase Row Level Security (RLS), the server actions utilize the `SUPABASE_SERVICE_ROLE_KEY` to create an `adminAuth` client. This allows the backend to securely query the `auth.users` and `profiles` tables.

## Scenarios Implemented

### 1. Admin Verification Request (To Admin)
* **Trigger:** When a user requests to verify their business or switches their profile role to Business.
* **File:** `src/app/dashboard/customer/actions.ts` & `src/app/dashboard/business/settings/actions.ts`
* **Template Function:** `getAdminVerificationRequestEmailHtml` in `src/lib/emailTemplates.ts`
* **Flow:**
  1. The user's profile is updated in Supabase.
  2. The server queries all users with the `admin` role from the `profiles` table.
  3. The server looks up the emails for those admins via `auth.admin.getUserById`.
  4. An email is dispatched to all admins with the subject: `New Business Verification Request: [Business Name]`.

### 2. Business Approval (To Business Owner)
* **Trigger:** When an Admin approves a pending business in the admin dashboard.
* **File:** `src/app/dashboard/admin/verifications/actions.ts`
* **Template Function:** `getBusinessApprovedEmailHtml` in `src/lib/emailTemplates.ts`
* **Flow:**
  1. The admin updates the business status to `verified` in Supabase.
  2. The server retrieves the business owner's email via `adminAuth`.
  3. An email is dispatched to the business owner with the subject: `🎉 Your Business [Business Name] is Approved!`.
  4. The email includes a CTA linking directly to the subscription setup page.

### 3. New Appointment Booking (To Business Owner)
* **Trigger:** When a Customer books an appointment with a business.
* **File:** `src/app/business/[id]/actions.ts` (`createBooking`)
* **Template Function:** `getNewBookingEmailHtml` in `src/lib/emailTemplates.ts`
* **Flow:**
  1. The booking is successfully inserted into the `bookings` table with a `pending` status.
  2. The server fetches the business owner's email securely using `adminAuth`.
  3. The server retrieves the customer's full name from their profile.
  4. An email is dispatched to the business owner with the subject: `📅 New Booking: [Customer Name] has booked an appointment`.

### 4. Appointment Confirmation (To Customer)
* **Trigger:** When a Business Owner confirms a pending booking from their dashboard.
* **File:** `src/app/dashboard/business/appointments/actions.ts` (`updateBookingStatus`)
* **Template Function:** `getAppointmentConfirmedEmailHtml` in `src/lib/emailTemplates.ts`
* **Flow:**
  1. The booking status is updated to `confirmed` in the `bookings` table.
  2. The server fetches the customer's email securely using `adminAuth`.
  3. An email is dispatched to the customer with the subject: `✅ Appointment Confirmed: Your booking at [Business Name]`.
  4. The email includes a CTA linking to the customer's bookings dashboard.

## In-App Synchronization
For every scenario listed above, the email dispatch function (`sendEmail`) is executed immediately after inserting a corresponding record into the `notifications` table. This ensures that the user receives a dashboard bell notification perfectly synchronized with the email delivery.
