-- Keep verified paid and disputed LIFT orders inside the one-checkout boundary.
-- Paid LIFT is a one-time purchase, while disputed access stays suspended for
-- manual review; refunded orders leave the boundary so a legitimate repurchase
-- remains possible. Without this guard, a purchase-write failure can release
-- the creating/open uniqueness boundary after Stripe has charged the customer
-- and permit a second Session.

begin;

set local lock_timeout = '5s';

lock table public.checkout_orders in access exclusive mode;

do $paid_order_guard$
begin
  if exists (
    select 1
    from public.checkout_orders
    where product_type = 'lift_guide'
      and status in ('creating', 'open', 'paid', 'disputed')
    group by
      user_id,
      product_type,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'Duplicate payable checkout orders must be reconciled before migration 021.';
  end if;
end
$paid_order_guard$;

create unique index checkout_orders_one_unsettled_lift_per_namespace_idx
  on public.checkout_orders (
    user_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
  where product_type = 'lift_guide'
    and status in ('creating', 'open', 'paid', 'disputed');

comment on index public.checkout_orders_one_unsettled_lift_per_namespace_idx is
  'Prevents a second LIFT Checkout Session while an exact creating, open, verified paid, or disputed order remains unresolved.';

commit;
