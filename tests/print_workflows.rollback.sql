-- Run after the migration. The explicit transaction keeps every fixture temporary.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('d690a16b-0091-4b8e-a22c-e5beedb4dced','workflow-editor@example.invalid','{"requested_service":"print"}'),
('9ec4356a-e4f5-40f1-b263-745609f63891','workflow-customer@example.invalid','{"requested_service":"print"}'),
('70cc80e4-ecfe-42e9-b80e-6bc15e4691b6','workflow-other@example.invalid','{"requested_service":"print"}');
update public.profiles set role='platform_admin' where id='d690a16b-0091-4b8e-a22c-e5beedb4dced';
insert into public.admin_product_access(user_id,product,can_view,can_edit) values('d690a16b-0091-4b8e-a22c-e5beedb4dced','print',true,true);
insert into public.print_orders(id,user_id,title,status,fulfillment) values('6da07f10-3ac0-49df-a3ee-64650a8e1df1','9ec4356a-e4f5-40f1-b263-745609f63891','Rollback workflow test','request','pickup');
insert into public.print_artworks(id,order_id,user_id,title,file_path) values('36c57945-ea89-4a32-9f91-818377c50642','6da07f10-3ac0-49df-a3ee-64650a8e1df1','9ec4356a-e4f5-40f1-b263-745609f63891','Rollback proof','rollback/not-a-real-upload.pdf');
insert into public.print_inventory(id,item_name,quantity,unit) values('e078f608-de44-4d81-8ff1-d41d60d6c858','Rollback stock',10,'sheet');
set local role authenticated;
select set_config('request.jwt.claim.sub','d690a16b-0091-4b8e-a22c-e5beedb4dced',true);
select public.print_issue_quote('6da07f10-3ac0-49df-a3ee-64650a8e1df1',1000,100,50,0,current_date+7);
select public.print_issue_artwork_proof('36c57945-ea89-4a32-9f91-818377c50642');
do $$begin
 begin perform public.print_invoice_accepted_quote('6da07f10-3ac0-49df-a3ee-64650a8e1df1'); raise exception 'TEST: unaccepted quote invoiced'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
 begin update public.print_proofs set status='approved' where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1'; raise exception 'TEST: staff approved customer proof'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','70cc80e4-ecfe-42e9-b80e-6bc15e4691b6',true);
do $$begin
 if exists(select 1 from public.print_orders where id='6da07f10-3ac0-49df-a3ee-64650a8e1df1') then raise exception 'TEST: cross-customer order visible'; end if;
 begin perform public.print_issue_quote('6da07f10-3ac0-49df-a3ee-64650a8e1df1',1,0,0,0,current_date+7); raise exception 'TEST: customer issued quote'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub','9ec4356a-e4f5-40f1-b263-745609f63891',true);
do $$begin
 begin update public.print_quotes set total=1 where user_id=auth.uid(); raise exception 'TEST: customer changed quote total'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
update public.print_quotes set status='accepted' where user_id=auth.uid();
update public.print_proofs set status='approved' where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1';
select set_config('request.jwt.claim.sub','d690a16b-0091-4b8e-a22c-e5beedb4dced',true);
select public.print_invoice_accepted_quote('6da07f10-3ac0-49df-a3ee-64650a8e1df1');
do $$begin
 if not exists(select 1 from public.print_invoices where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1' and amount=950 and amount_paid=0) then raise exception 'TEST: invoice differs from accepted total'; end if;
 begin update public.print_invoices set status='paid',amount_paid=amount where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1'; raise exception 'TEST: staff manually paid invoice'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
 begin perform public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','prepress'); raise exception 'TEST: unpaid production started'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
-- Fixture only: emulate the server settlement result, not a live payment.
reset role;
update public.print_invoices set status='paid',amount_paid=amount where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1';
set local role authenticated;
select public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','prepress');
do $$begin
 begin perform public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','qc'); raise exception 'TEST: production stage skipped'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
select public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','production');
select public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','finishing');
select public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','qc');
do $$begin
 begin perform public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','ready'); raise exception 'TEST: ready without QC'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
select public.print_record_qc(id,true,'Rollback passed check') from public.print_jobs where order_id='6da07f10-3ac0-49df-a3ee-64650a8e1df1';
select public.print_advance_job('6da07f10-3ac0-49df-a3ee-64650a8e1df1','ready');
select public.print_dispatch_order('6da07f10-3ac0-49df-a3ee-64650a8e1df1','collected','Rollback recipient');
select public.print_adjust_stock('e078f608-de44-4d81-8ff1-d41d60d6c858','use',3,'Rollback job materials');
do $$begin
 if not exists(select 1 from public.print_inventory where id='e078f608-de44-4d81-8ff1-d41d60d6c858' and quantity=7) then raise exception 'TEST: stock was not adjusted'; end if;
 begin perform public.print_adjust_stock('e078f608-de44-4d81-8ff1-d41d60d6c858','use',8,'Rollback overdraw'); raise exception 'TEST: stock went negative'; exception when others then if sqlerrm like 'TEST:%' then raise; end if; end;
 if not exists(select 1 from public.print_orders where id='6da07f10-3ac0-49df-a3ee-64650a8e1df1' and status='completed') then raise exception 'TEST: pickup not completed'; end if;
end $$;
reset role;
select 'PASS: ownership, customer consent, exact invoice, verified payment guard, sequential production, QC, pickup and nonnegative stock' as checks;
rollback;
