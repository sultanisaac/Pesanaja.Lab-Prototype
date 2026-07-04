# Admin Implementation Plan & Record

## Overview
This document records the implemented workflows, features, and Supabase database interactions specific to the **Admin** role within the Pesanaja.Lab platform.

## Supabase Schema & Access
- **Table Access:** Admins have elevated privileges to read and update records across all major tables (`profiles`, `businesses`, `bookings`).
- **RLS Policies:** Supabase Row Level Security (RLS) is configured to allow users with the `role = 'admin'` in the `profiles` table to bypass standard restrictions, enabling them to manage platform-wide data.

## Core Workflows Implemented

### 1. Dashboard Metrics & Overview
*   **Location:** `/dashboard/admin`
*   **Functionality:** Admins have a high-level overview of platform health, including total users, total businesses, and pending verifications.

### 2. Business Verification Management
*   **Location:** `/dashboard/admin/verifications`
*   **Trigger:** When a customer requests a business account, their status is set to `pending`.
*   **Action:** Admins review the submitted business details.
*   **Supabase Interaction:**
    *   Updating `businesses` table: `status` changes from `pending` to `verified`.
    *   Updating `profiles` table: User role becomes `business`.
*   **Notifications Hook:** 
    *   Approving a business triggers the **Business Approval Email** (Scenario 2) via `getBusinessApprovedEmailHtml`.
    *   A corresponding in-app notification is inserted into the `notifications` table for the business owner.

### 3. User & Role Management
*   **Location:** `/dashboard/admin/users`
*   **Functionality:** Admins can view all registered users and modify their roles (e.g., promoting a customer to admin).
*   **Supabase Interaction:** Direct updates to the `profiles` table `role` column.

## Security Considerations
*   Admin-only Server Actions enforce role checks (`supabase.auth.getUser()` + `profile.role === 'admin'`) before executing sensitive database mutations.
*   Admin email notifications (Scenario 1) utilize the secure Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`) to bypass RLS and alert admins when new verification requests are submitted.
