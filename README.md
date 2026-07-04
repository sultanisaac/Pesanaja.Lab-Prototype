# Pesanaja.Lab - Service Booking Platform

Pesanaja.Lab is a comprehensive B2B2C marketplace for discovering and booking services. It features a complete multi-role system (Admin, Business, Customer), a secure payment gateway integration (Xendit), and an automated email notification system synchronized with in-app alerts.

## 🚀 Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Setup `.env` file with your Supabase, Xendit, and Nodemailer credentials.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 End-to-End Testing Guide

To test the entire workflow of the platform, you will need to simulate the interactions between three different roles: **Admin**, **Business Owner**, and **Customer**. 

We recommend using different browser profiles (or Incognito tabs) to log in to different accounts simultaneously.

### Phase 1: Setup the Accounts
1. Register **Account A**: This will be your Admin account. *(Note: You must manually change the `role` column for this user to `admin` in your Supabase `profiles` table to grant them admin privileges).*
2. Register **Account B**: This will be the Business Owner account.
3. Register **Account C**: This will be the normal Customer account.

### Phase 2: Business Application (Account B)
1. Log in to **Account B**.
2. Go to `Dashboard` -> `Settings`.
3. Scroll down to the "Business Upgrade" section and fill out the details for your new business.
4. Click **Submit**. 
   * *System Action:* This sets the business to `pending`. **(Email Scenario 1 sent to Admin)**

### Phase 3: Admin Approval (Account A)
1. Log in to **Account A** (Admin).
2. Go to the Admin Dashboard and navigate to `Verifications`.
3. You will see the pending business request from Account B.
4. Click **Approve**.
   * *System Action:* This sets the business to `verified` but keeps it hidden from the public until they pay. **(Email Scenario 2 sent to Business Owner)**

### Phase 4: Payment & Activation (Account B)
1. Log in to **Account B** (Business Owner).
2. The system will automatically detect you are approved but unpaid, and lock you on the `Subscription` page.
3. Click the button to pay via the Xendit Payment Gateway.
4. Complete the dummy checkout in the Xendit testing environment.
   * *System Action:* A background webhook tells the server payment was successful. Your business is now unlocked, active, and publicly searchable on the homepage!

### Phase 5: Setting up the Shop (Account B)
1. In the Business Dashboard, navigate to `Services`.
2. Create at least one service (e.g., "Premium Haircut - $50").
3. Navigate to `Profile` and set up your working hours.

### Phase 6: Customer Booking (Account C)
1. Log in to **Account C** (Customer).
2. Go to the Homepage or Search page and find the newly created business.
3. View their profile, select the service you just created, pick a valid date/time, and click **Book Appointment**.
   * *System Action:* The booking is saved as `pending`. **(Email Scenario 3 sent to Business Owner)**

### Phase 7: Business Confirmation (Account B)
1. Log in to **Account B** (Business Owner).
2. Navigate to `Appointments`. You will see the new pending booking from Account C.
3. Click **Confirm**.
   * *System Action:* The booking is finalized. **(Email Scenario 4 sent to Customer)**

### Phase 8: Final Review (Account C)
1. Log in to **Account C** (Customer).
2. Check your dashboard notifications and the `Bookings` page to see that the appointment has been officially confirmed and the email notification was successfully received!

---

## 📚 Documentation
For deeper technical details, please review the documentation files located in the `/Implementation` folder:
- `ADMIN_PLAN.md` - Admin security & workflows.
- `BUSINESS_PLAN.md` - Business onboarding & management workflows.
- `CUSTOMER_PLAN.md` - Search & booking workflows.
- `DATABASE_SCHEMA.md` - Supabase tables & RLS policies.
- `PAYMENT_GATEWAY.md` - Xendit integration architecture.
- `EMAIL_NOTIFICATION.md` - Nodemailer system architecture.
