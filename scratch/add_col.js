const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:5veaOFMXS7XHu0FJ@db.sswpdvecrjydnfdtyrty.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  try {
    await client.query(`ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;`);
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
