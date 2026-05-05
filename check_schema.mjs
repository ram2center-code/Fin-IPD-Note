import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiudthpeyttiubtcrepd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdWR0aHBleXR0aXVidGNyZXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDkzNDEsImV4cCI6MjA5MjU4NTM0MX0.OzOJBRzUP2ih9qFGVjGz19pNGCiQJguu04Sp8CR-T04';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('ipd_records').select('*').limit(1);
  if (error) {
    console.error('Error fetching data:', error);
  } else {
    if (data && data.length > 0) {
      console.log('Fields:', Object.keys(data[0]));
    } else {
      console.log('No data found to infer schema.');
    }
  }
}

checkSchema();
