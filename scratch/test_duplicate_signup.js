const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

const supabase = createClient(envUrl, envKey);

async function testDuplicateSignup() {
  console.log('Attempting signup for existing email syedhamza1238@gmail.com...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'syedhamza1238@gmail.com',
      password: 'SomeDummyPassword123!',
      options: {
        data: {
          full_name: 'Duplicate Test'
        }
      }
    });

    if (error) {
      console.log('Signup error returned:', error);
    } else {
      console.log('Signup success returned.');
      console.log('User Object:', JSON.stringify(data.user, null, 2));
      console.log('Identities Array:', data.user?.identities);
      console.log('Session Object:', data.session);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDuplicateSignup();
