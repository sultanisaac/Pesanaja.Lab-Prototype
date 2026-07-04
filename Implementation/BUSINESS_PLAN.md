# Business Implementation Plan & Record

## Overview
This document records the implemented workflows, features, and Supabase database interactions specific to the **Business** role within the Pesanaja.Lab platform.

## Supabase Schema & Access
- **Table Access:** Businesses own records in `businesses`, `services`, `working_hours`, and `bookings`.
- **RLS Policies:** Supabase RLS ensures a business owner (`owner_id === auth.uid()`) can only mutate their own business profile, services, and manage bookings attached to their `business_id`.

## Core Workflows Implemented

### 1. Onboarding & Verification Request
*   **Location:** `/dashboard/business/settings` or customer dashboard upgrade.
*   **Functionality:** A user submits their business details for admin review.
*   **Supabase Interaction:** Creates a row in `businesses` with `status = 'pending'` and sets the user's `profiles.role` to `business_pending`.
*   **Notifications Hook:** Triggers the **Admin Verification Request Email** (Scenario 1) and in-app notification alerting admins to review the application.

### 2. Subscription & Payment Wall (Xendit)
*   **Location:** `/dashboard/business/subscription`
*   **Functionality:** Once approved by an admin, the business is "locked" behind a subscription wall. They must complete payment via the Xendit integration to become fully active and visible on the marketplace.
*   **Supabase Interaction:** Updates the `businesses` table to track subscription status and payment states via webhooks.

### 3. Profile & Service Management
*   **Location:** `/dashboard/business/profile` & `/dashboard/business/services`
*   **Functionality:** Owners can update their public-facing business profile, upload portfolio images, and manage working hours. They have full CRUD (Create, Read, Update, Delete) access to their `services` table entries.

### 4. Appointment Management
*   **Location:** `/dashboard/business/appointments`
*   **Functionality:** 
    *   View all incoming `pending` appointments from customers.
    *   Confirm, Cancel, or Complete appointments.
    *   Create manual bookings for walk-in customers.
*   **Supabase Interaction:** Mutates the `status` column in the `bookings` table.
*   **Notifications Hook:** 
    *   Receives **New Booking Email** (Scenario 3) when a customer books.
    *   Confirming an appointment triggers the **Appointment Confirmed Email** (Scenario 4) sent back to the customer.
