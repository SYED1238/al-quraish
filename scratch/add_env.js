const { execSync } = require('child_process');

const vars = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', env: 'preview', value: 'https://eoltanruhujjygqcxsct.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', env: 'development', value: 'https://eoltanruhujjygqcxsct.supabase.co' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', env: 'production', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHRhbnJ1aHVqanlncWN4c2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTI0MzYsImV4cCI6MjA5Njg4ODQzNn0.A16xhRQQ_PEc4jTnr-kdwi4XnIVP1MOdgV_a_QxvjvY' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', env: 'preview', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHRhbnJ1aHVqanlncWN4c2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTI0MzYsImV4cCI6MjA5Njg4ODQzNn0.A16xhRQQ_PEc4jTnr-kdwi4XnIVP1MOdgV_a_QxvjvY' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', env: 'development', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbHRhbnJ1aHVqanlncWN4c2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMTI0MzYsImV4cCI6MjA5Njg4ODQzNn0.A16xhRQQ_PEc4jTnr-kdwi4XnIVP1MOdgV_a_QxvjvY' }
];

for (const item of vars) {
  console.log(`Adding ${item.name} to ${item.env}...`);
  try {
    const cmd = `npx vercel env add ${item.name} ${item.env} --value "${item.value}" --yes`;
    const out = execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to add ${item.name} to ${item.env}:`, err.message);
  }
}
console.log('All variables processed.');
