-- 20260630000002_add_notifications.sql

-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);


-- 2. Trigger Function for Bookings
CREATE OR REPLACE FUNCTION notify_on_booking()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    business_owner_id UUID;
    business_name TEXT;
    service_name TEXT;
BEGIN
    -- Get business info
    SELECT owner_id, name INTO business_owner_id, business_name FROM public.businesses WHERE id = NEW.business_id;
    -- Get service info
    SELECT name INTO service_name FROM public.services WHERE id = NEW.service_id;

    IF TG_OP = 'INSERT' THEN
        -- Notify business owner of new booking
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            business_owner_id,
            'New Booking Request',
            'You have a new booking request for ' || service_name || ' on ' || TO_CHAR(NEW.scheduled_at, 'Mon DD, YYYY HH24:MI') || '.',
            'booking_request',
            '/dashboard/business/appointments'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            IF NEW.status = 'confirmed' THEN
                -- Notify customer that booking is confirmed
                INSERT INTO public.notifications (user_id, title, message, type, link)
                VALUES (
                    NEW.customer_id,
                    'Booking Confirmed',
                    'Your appointment at ' || business_name || ' for ' || service_name || ' has been confirmed.',
                    'booking_confirmed',
                    '/dashboard/customer/bookings'
                );
            ELSIF NEW.status = 'cancelled' THEN
                -- Notify customer that booking is cancelled
                INSERT INTO public.notifications (user_id, title, message, type, link)
                VALUES (
                    NEW.customer_id,
                    'Booking Cancelled',
                    'Your appointment at ' || business_name || ' has been cancelled.',
                    'booking_cancelled',
                    '/dashboard/customer/bookings'
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_booking ON public.bookings;
CREATE TRIGGER trg_notify_booking
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_booking();


-- 3. Trigger Function for Business Verification
CREATE OR REPLACE FUNCTION notify_on_verification_request()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    -- If a business is inserted with status 'pending' OR updated to 'pending'
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'pending') THEN
        -- Notify all admins
        FOR admin_record IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                admin_record.id,
                'Business Verification Request',
                'Business "' || NEW.name || '" has requested verification.',
                'verification_request',
                '/dashboard/admin/verifications'
            );
        END LOOP;
    END IF;

    -- Optional: Notify business owner if admin approves/rejects
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'verified' THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.owner_id,
                'Business Verified!',
                'Your business "' || NEW.name || '" has been successfully verified.',
                'business_verified',
                '/dashboard/business'
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.owner_id,
                'Business Verification Rejected',
                'Your business "' || NEW.name || '" failed verification. Please update your details.',
                'business_rejected',
                '/dashboard/business/settings'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_verification ON public.businesses;
CREATE TRIGGER trg_notify_verification
    AFTER INSERT OR UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_verification_request();


-- 4. Trigger Function for Customer Business Upgrade Requests
CREATE OR REPLACE FUNCTION notify_on_upgrade_request()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    admin_record RECORD;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'pending') THEN
        -- Notify all admins
        FOR admin_record IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                admin_record.id,
                'Business Upgrade Request',
                'A customer has requested to become a business owner for "' || NEW.business_name || '".',
                'upgrade_request',
                '/dashboard/admin/upgrade-requests'
            );
        END LOOP;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        IF NEW.status = 'approved' THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.user_id,
                'Business Account Approved!',
                'Your request to become a business owner has been approved. Welcome!',
                'upgrade_approved',
                '/dashboard/business'
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                NEW.user_id,
                'Business Account Rejected',
                'Your request to become a business owner was declined by an admin.',
                'upgrade_rejected',
                '/dashboard'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_upgrade_request ON public.business_upgrade_requests;
CREATE TRIGGER trg_notify_upgrade_request
    AFTER INSERT OR UPDATE ON public.business_upgrade_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_upgrade_request();
