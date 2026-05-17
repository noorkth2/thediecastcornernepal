const fs = require('fs');
let content = fs.readFileSync('supabase/migrations/99999999999999_seed_dummy_data.sql', 'utf8');

// Replace Wikimedia thumb URLs with direct Unsplash/Amazon or working Wikimedia URLs
// A simpler way: we can just use valid Unsplash source URLs or placeholder images that actually work.
// Since Unsplash Source API is deprecated, let's use a stable dummy image service like dummyimage.com or fakeimg.pl
// Or simply placehold.co but without Next.js proxying it.
// The user already had placehold.co in next.config.ts. Let's revert the seed script to placehold.co, since it's just dummy data anyway, OR use valid URLs.
// Wait, placehold.co was working, but returning 404 in the Next.js logs because the Next.js app was requesting `/placeholder-car.jpg` (the local fallback), NOT `placehold.co`!
// Ah! The `placeholder-car.jpg` was 404ing because it didn't exist in the `public/` folder!

content = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/[^/]+\/[^/]+\/([^/]+)\/[^'"]+/g, 'https://upload.wikimedia.org/wikipedia/commons/e/e1/510BluebirdSSS.jpg');

fs.writeFileSync('supabase/migrations/99999999999999_seed_dummy_data.sql', content);
console.log('Done');
