import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  const { data: products } = await supabase.from('products').select('id, title, brand')
  const { data: brands } = await supabase.from('brands').select('id, name, slug')
  console.log('PRODUCTS BRANDS:')
  const distinctProductBrands = [...new Set(products?.map(p => p.brand).filter(Boolean))]
  console.log(distinctProductBrands)
  console.log('BRANDS TABLE:')
  console.log(brands?.map(b => b.name))
}
main()
