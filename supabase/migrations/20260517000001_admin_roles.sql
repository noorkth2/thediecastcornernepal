-- Update handle_new_user trigger to auto-assign admin role to specific emails
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  is_admin boolean;
begin
  is_admin := new.email in ('kayastha.noor1100@gmail.com', 'thediecastcornernepal@gmail.com');
  
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    case when is_admin then 'admin' else 'customer' end
  );
  return new;
end;
$$;

-- Also update existing profiles if they have already signed up
update public.profiles 
set role = 'admin' 
where id in (
  select id from auth.users 
  where email in ('kayastha.noor1100@gmail.com', 'thediecastcornernepal@gmail.com')
);
