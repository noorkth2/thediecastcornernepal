const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files
const files = execSync('find src -name "*.ts" -o -name "*.tsx"').toString().split('\n').filter(Boolean);

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Only process if it imports from server or queries
  if (!content.includes('@/lib/supabase/server') && 
      !content.includes('import { createClient } from "@/lib/supabase/server"') &&
      !file.includes('server.ts') && !file.includes('queries')) {
      
      // Wait, queries use server.ts but might not import it explicitly if they use alias? 
      // All queries import server.ts. So let's check if it includes 'createClient'
  }
  
  if (!content.includes('createClient')) continue;

  // In server.ts, change the definition
  if (file.endsWith('server.ts')) {
    content = content.replace('export function createClient()', 'export async function createClient()');
    content = content.replace('const cookieStore = cookies() as any', 'const cookieStore = await cookies()');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    changedFiles++;
    continue;
  }

  // If it imports from client, skip
  if (content.includes('@/lib/supabase/client')) continue;

  // Otherwise, it's a server component/action using the server client.
  // Replace `createClient()` with `await createClient()`
  if (content.includes('createClient()') && !content.includes('await createClient()')) {
    content = content.replace(/createClient\(\)/g, 'await createClient()');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    changedFiles++;
  }
}
console.log(`Changed ${changedFiles} files.`);
