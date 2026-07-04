# Customer Implementation Plan & Record

## Overview
This document records the implemented workflows, features, and Supabase database interactions specific to the **Customer** role within the Pesanaja.Lab platform.

## Supabase Schema & Access
- **Table Access:** Customers have read access to verified businesses and services. They have insert/read access to their own `bookings`, `favorites`, and `notifications`.
- **RLS Policies:** Supabase RLS ensures customers can only read and manage data directly tied to their `auth.uid()`, strictly protecting other users' data and business owner metrics.

## Core Workflows Implemented

### 1. Marketplace Discovery & Search
*   **Location:** `/` (Home) & `/search`
*   **Functionality:** Customers can browse through the directory of active businesses.
*   **Supabase Interaction:** Read-only queries to the `businesses` table, filtered by `status = 'verified'` and active subscription states. Includes search filtering and category matching.

### 2. Appointment Booking Flow
*   **Location:** `/business/[id]`
*   **Functionality:** Customers view a business profile, select a specific service, choose a valid date and time, and submit a booking request. The system validates against past dates and overlapping time slots.
*   **Supabase Interaction:** Inserts a new row into the `bookings` table with `status = 'pending'`.
*   **Notifications Hook:** This action triggers the **New Booking Email** (Scenario 3) and an in-app notification sent to the business owner to review the request.

### 3. Customer Dashboard & Booking History
*   **Location:** `/dashboard/customer/bookings`
*   **Functionality:** Customers can track the status of all their appointments (`pending`, `confirmed`, `completed`, `cancelled`).
*   **Notifications Hook:** When a business owner confirms the appointment, the customer receives the **Appointment Confirmed Email** (Scenario 4) and an in-app notification.

### 4. Favorites System
*   **Location:** Business profiles & `/dashboard/customer/favorites`
*   **Functionality:** Customers can save businesses to their favorites list for quick access later.
*   **Supabase Interaction:** Toggles rows (Insert/Delete) in the `favorites` table linking `customer_id` and `business_id`.

### 5. Profile & Settings
*   **Location:** `/dashboard/profile`
*   **Functionality:** Customers can update their personal information, change passwords, and manage sessions (with multi-device login support). Updates persist directly to the `profiles` table.
