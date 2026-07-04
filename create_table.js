const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:5veaOFMXS7XHu0FJ@db.sswpdvecrjydnfdtyrty.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        title text NOT NULL,
        message text NOT NULL,
        link text,
        is_read boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now()
      );

      ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
        ) THEN
            CREATE POLICY "Users can view their own notifications"
              ON notifications FOR SELECT
              USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
        ) THEN
            CREATE POLICY "Users can update their own notifications"
              ON notifications FOR UPDATE
              USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `);
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
