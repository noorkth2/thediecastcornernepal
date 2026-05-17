-- Add missing admin policies for product_images, categories, and banners
create policy "Admins can manage product images"
  on public.product_images for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage categories"
  on public.categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage banners"
  on public.banners for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
