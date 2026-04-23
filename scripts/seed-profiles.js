const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProfiles() {
  const profiles = [
    {
      id: 'e8cf0c51-ae64-412d-941c-08277f64baad',
      email: 'mohitraj8503@gmail.com',
      name: 'MOHITRAJ8503',
      avatar_url: '/mohit.png'
    },
    {
      id: '67b2816d-e366-4d02-ac48-e445d5e8dbf4',
      email: 'rishika@me.com',
      name: 'Rishika',
      avatar_url: '/rishika.jpg'
    }
  ];

  console.log('Seeding profiles...');
  const { error } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });

  if (error) {
    console.error('Error seeding profiles:', error);
  } else {
    console.log('Profiles seeded successfully!');
  }
}

seedProfiles();
