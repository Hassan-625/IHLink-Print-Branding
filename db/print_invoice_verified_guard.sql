-- Verified settlement owns paid state; staff manage unpaid invoice documents.
create or replace function private.print_invoice_verified_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.amount is null or new.amount::text in ('NaN','Infinity','-Infinity') or new.amount<=0 or new.amount<>round(new.amount,2)
 or new.amount_paid is null or new.amount_paid::text in ('NaN','Infinity','-Infinity') or new.amount_paid<0 or new.amount_paid>new.amount
 then raise exception 'A finite positive invoice amount and valid paid balance are required';end if;
 if current_user='authenticated' then
  if tg_op='INSERT' then
   if new.amount_paid<>0 or new.status<>'unpaid' then raise exception 'Verified settlement is required for invoice payment state';end if;
  else
   if new.amount_paid is distinct from old.amount_paid or (new.status is distinct from old.status and (new.status in ('paid','partial') or old.amount_paid>0))
   then raise exception 'Verified settlement is required for invoice payment state';end if;
   if (new.amount is distinct from old.amount or new.currency is distinct from old.currency or new.order_id is distinct from old.order_id)
   and (old.amount_paid>0 or exists(select 1 from public.print_payment_intents i where i.invoice_id=old.id))
   then raise exception 'Payment-linked invoice amounts and ownership cannot be changed';end if;
  end if;
 end if;return new;
end $$;
create trigger print_invoice_verified_guard before insert or update on public.print_invoices for each row execute function private.print_invoice_verified_guard();
