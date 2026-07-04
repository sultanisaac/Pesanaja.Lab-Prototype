# Database Schema & Structure Record

## Overview
This document records the foundational Supabase PostgreSQL database architecture for the Pesanaja.Lab platform. It outlines the core tables, their relationships, and the Row Level Security (RLS) strategy used to protect user data.

## Core Tables

### 1. `profiles`
The central user table extended from Supabase `auth.users`.
*   **Key Columns:** `id` (UUID, Primary Key), `first_name`, `last_name`, `phone`, `role` (enum: 'customer', 'business_pending', 'business', 'admin'), `created_at`.
*   **Relationships:** References `auth.users(id)`.

### 2. `businesses`
Stores the profiles and operational data for businesses on the platform.
*   **Key Columns:** `id` (UUID), `owner_id` (UUID), `name`, `description`, `category`, `status` (enum: 'pending', 'verified', 'rejected'), `is_subscribed` (boolean), `subscription_id`, `created_at`.
*   **Relationships:** `owner_id` references `profiles(id)`.

### 3. `services`
Catalog of offerings created by businesses for customers to book.
*   **Key Columns:** `id` (UUID), `business_id` (UUID), `name`, `description`, `price` (numeric), `duration_minutes` (integer), `created_at`.
*   **Relationships:** `business_id` references `businesses(id)`.

### 4. `bookings`
The transactional core of the platform, recording appointments between customers and businesses.
*   **Key Columns:** `id` (UUID), `customer_id` (UUID), `business_id` (UUID), `service_id` (UUID), `scheduled_at` (timestamp), `status` (enum: 'pending', 'confirmed', 'completed', 'cancelled'), `total_price`, `notes`.
*   **Relationships:** Links to `profiles` (customer), `businesses`, and `services`.

### 5. `working_hours`
Defines operational availability for a specific business to prevent invalid bookings.
*   **Key Columns:** `id`, `business_id`, `day_of_week` (0-6), `open_time` (time), `close_time` (time), `is_closed` (boolean).
*   **Relationships:** `business_id` references `businesses(id)`.

### 6. `favorites`
Allows customers to save preferred businesses for quick access.
*   **Key Columns:** `id`, `customer_id` (UUID), `business_id` (UUID), `created_at`.
*   **Relationships:** Links to `profiles` and `businesses`.

### 7. `notifications`
Powers the in-app notification bell system.
*   **Key Columns:** `id`, `user_id` (UUID), `title`, `message`, `link`, `is_read` (boolean), `created_at`.
*   **Relationships:** `user_id` references `profiles(id)`.

## Row Level Security (RLS) Strategy

The platform enforces strict data access rules at the database level:
1.  **Profiles:** Users can only update their own profile row.
2.  **Businesses:** Anyone can read businesses where `status = 'verified'` AND `is_subscribed = true`. Only the `owner_id` can edit their business row.
3.  **Bookings:** Customers can only read/insert bookings where they are the `customer_id`. Businesses can only read/update bookings where they are the `business_id`.
4.  **Admin Override:** A global bypass policy allows users with `role = 'admin'` to view and mutate all rows across all tables for administrative workflows.
