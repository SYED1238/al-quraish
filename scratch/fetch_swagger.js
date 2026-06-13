const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

async function getOpenAPI() {
  try {
    const res = await fetch(`${envUrl}/rest/v1/`, {
      headers: {
        'apikey': envKey,
        'Authorization': `Bearer ${envKey}`
      }
    });
    const schema = await res.json();
    console.log('Error schema:', schema);
  } catch (err) {
    console.error('Error fetching OpenAPI schema:', err);
  }
}

getOpenAPI();
