-- Customers request a price; only authorized Print staff set quotation amounts.
drop policy print_quotes_owner on public.print_quotes;
create policy print_quotes_owner_read on public.print_quotes for select to authenticated using(user_id=auth.uid());
alter policy print_orders_owner_insert on public.print_orders with check(
 user_id=auth.uid() and status='request' and quote_id is null
 and exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active')
 and (private.print_staff_permission('edit') or exists(select 1 from public.customer_service_access a where a.user_id=auth.uid() and a.product='print' and a.status='active')));
create policy print_order_items_customer_request on public.print_order_items for insert to authenticated with check(
 unit_price=0 and total=0 and quantity>=1 and quantity=trunc(quantity)
 and exists(select 1 from public.print_orders o where o.id=order_id and o.user_id=auth.uid() and o.status='request')
 and exists(select 1 from public.print_products p where p.id=product_id and p.active));
create or replace function public.submit_print_request(p_product uuid,p_description text,p_quantity integer,p_fulfillment text,p_address text,p_options jsonb default '{}')
returns uuid language plpgsql security invoker set search_path='' as $$ declare product public.print_products;request_id uuid;begin
 if auth.uid() is null or p_quantity<1 or p_quantity>100000 or length(trim(p_description))<5 or p_fulfillment not in ('pickup','delivery')
 or (p_fulfillment='delivery' and nullif(trim(p_address),'') is null) or jsonb_typeof(p_options)<>'object' or octet_length(p_options::text)>16000 then raise exception 'Invalid print specifications';end if;
 select * into product from public.print_products where id=p_product and active;if product.id is null then raise exception 'Active print service required';end if;
 insert into public.print_orders(user_id,title,fulfillment,delivery_address,status) values(auth.uid(),product.name,p_fulfillment,case when p_fulfillment='delivery' then trim(p_address) else null end,'request') returning id into request_id;
 insert into public.print_order_items(order_id,product_id,description,quantity,options,unit_price,total) values(request_id,product.id,trim(p_description),p_quantity,p_options||jsonb_build_object('service',product.name),0,0);
 return request_id;end $$;
revoke all on function public.submit_print_request(uuid,text,integer,text,text,jsonb) from public,anon;
grant execute on function public.submit_print_request(uuid,text,integer,text,text,jsonb) to authenticated;
