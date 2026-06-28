-- Add operating_hours column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{
  "monday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
  "tuesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
  "wednesday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
  "thursday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
  "friday": {"isOpen": true, "openTime": "09:00", "closeTime": "17:00"},
  "saturday": {"isOpen": false, "openTime": "09:00", "closeTime": "17:00"},
  "sunday": {"isOpen": false, "openTime": "09:00", "closeTime": "17:00"}
}'::jsonb;
