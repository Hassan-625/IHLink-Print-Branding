-- Publish only activated catalogue fields to visitors; production and pricing administration stay protected.
grant select(id,name,category,description,base_price,active) on public.print_products to anon;
create policy print_products_public_catalog on public.print_products for select to anon using(active=true);
