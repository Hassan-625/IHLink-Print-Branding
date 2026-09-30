create or replace function public.print_admin() returns boolean language sql stable security invoker set search_path='' as $$
select exists(select 1 from public.profiles p where p.id=auth.uid() and p.status::text='active' and (p.role::text='super_admin' or (p.role::text in ('platform_admin','support','finance') and exists(select 1 from public.admin_product_access a where a.user_id=auth.uid() and a.product='print' and a.can_view))));
$$;
create or replace function private.print_staff_permission(action text) returns boolean language sql stable security invoker set search_path='' as $$
select exists(select 1 from public.profiles p where p.id=auth.uid() and p.status::text='active' and (p.role::text='super_admin' or (p.role::text in ('platform_admin','support','finance') and exists(select 1 from public.admin_product_access a where a.user_id=auth.uid() and a.product='print' and case action when 'edit' then a.can_edit or a.can_manage when 'approve' then a.can_approve or a.can_manage when 'delete' then a.can_delete or a.can_manage when 'manage' then a.can_manage else false end))));
$$;
revoke all on function private.print_staff_permission(text) from public,anon;
grant execute on function private.print_staff_permission(text) to authenticated;
do $$
declare t text;
begin
 foreach t in array array['print_artworks','print_audit_logs','print_deliveries','print_inventory','print_invoices','print_jobs','print_notifications','print_order_items','print_orders','print_products','print_proofs','print_qc_checks','print_quotes','print_stock_movements','print_support_tickets','print_team_members'] loop
 execute format('drop policy if exists print_admin_all on public.%I',t);
 execute format('create policy print_staff_read on public.%I for select to authenticated using ((select public.print_admin()))',t);
 execute format('create policy print_staff_insert on public.%I for insert to authenticated with check ((select private.print_staff_permission(%L)))',t,case when t='print_team_members' then 'manage' else 'edit' end);
 execute format('create policy print_staff_update on public.%I for update to authenticated using ((select private.print_staff_permission(%L))) with check ((select private.print_staff_permission(%L)))',t,case when t='print_team_members' then 'manage' else 'edit' end,case when t='print_team_members' then 'manage' else 'edit' end);
 execute format('create policy print_staff_delete on public.%I for delete to authenticated using ((select private.print_staff_permission(%L)))',t,case when t='print_team_members' then 'manage' else 'delete' end);
 end loop;
end $$;
