\set ON_ERROR_STOP on

begin;

insert into auth.users (id, email, raw_user_meta_data)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'commerce-isolation@example.invalid',
  '{}'::jsonb
);

do $assertions$
declare
  first_claim_count integer;
  preview_order_id uuid;
  second_claim_count integer;
begin
  insert into public.purchases (
    user_id,
    product_type,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    amount_paid,
    status,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    stripe_product_id,
    stripe_price_id,
    catalog_version,
    currency
  )
  values
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_sharedNamespace12345678',
      'pi_sharedNamespace12345678',
      11.11,
      'active',
      'development',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'lift-complete-v2',
      'usd'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_sharedNamespace12345678',
      'pi_sharedNamespace12345678',
      11.11,
      'active',
      'preview',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'lift-complete-v2',
      'usd'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_sharedNamespace12345678',
      'pi_sharedNamespace12345678',
      11.11,
      'active',
      'preview',
      'acct_secondSandbox456',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'lift-complete-v2',
      'usd'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_sharedNamespace12345678',
      'pi_sharedNamespace12345678',
      11.11,
      'active',
      'preview',
      'acct_sharedSandbox123',
      true,
      'prod_launchProduct123',
      'price_launchPrice123',
      'lift-complete-v2',
      'usd'
    );

  if (
    select count(*)
    from public.purchases
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and deployment_target = 'preview'
      and stripe_account_id = 'acct_sharedSandbox123'
      and stripe_livemode = false
      and status = 'active'
  ) <> 1 then
    raise exception 'Preview purchase query did not isolate one exact target row.';
  end if;

  if (
    select count(*)
    from public.purchases
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and stripe_account_id = 'acct_sharedSandbox123'
      and stripe_livemode = false
      and status = 'active'
  ) <> 2 then
    raise exception 'Development and Preview fixtures did not coexist.';
  end if;

  if (
    select count(*)
    from public.purchases
    where stripe_checkout_session_id = 'cs_test_sharedNamespace12345678'
      and stripe_payment_intent_id = 'pi_sharedNamespace12345678'
  ) <> 4 then
    raise exception 'Target, account, and mode purchase namespaces did not coexist.';
  end if;

  begin
    insert into public.purchases (
      user_id,
      product_type,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      amount_paid,
      status,
      deployment_target,
      stripe_account_id,
      stripe_livemode,
      stripe_product_id,
      stripe_price_id,
      catalog_version,
      currency
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_sharedNamespace12345678',
      'pi_sharedNamespace12345678',
      11.11,
      'active',
      'preview',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'lift-complete-v2',
      'usd'
    );
    raise exception 'An exact purchase namespace duplicate was accepted.';
  exception
    when unique_violation then null;
  end;

  insert into public.memberships (
    user_id,
    stripe_subscription_id,
    status,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
  values
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'sub_sharedNamespace12345678',
      'active',
      'development',
      'acct_sharedSandbox123',
      false
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'sub_sharedNamespace12345678',
      'active',
      'preview',
      'acct_sharedSandbox123',
      false
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'sub_sharedNamespace12345678',
      'active',
      'preview',
      'acct_secondSandbox456',
      false
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'sub_sharedNamespace12345678',
      'active',
      'preview',
      'acct_sharedSandbox123',
      true
    );

  if (
    select count(*)
    from public.memberships
    where stripe_subscription_id = 'sub_sharedNamespace12345678'
  ) <> 4 then
    raise exception 'Target, account, and mode membership namespaces did not coexist.';
  end if;

  begin
    insert into public.memberships (
      user_id,
      stripe_subscription_id,
      status,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'sub_sharedNamespace12345678',
      'active',
      'preview',
      'acct_sharedSandbox123',
      false
    );
    raise exception 'An exact membership namespace duplicate was accepted.';
  exception
    when unique_violation then null;
  end;

  insert into public.stripe_customers (
    user_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    stripe_customer_id
  )
  values
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'development',
      'acct_sharedSandbox123',
      false,
      'cus_sharedCustomer123'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'acct_sharedSandbox123',
      false,
      'cus_sharedCustomer123'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'acct_secondSandbox456',
      false,
      'cus_sharedCustomer123'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'acct_sharedSandbox123',
      true,
      'cus_sharedCustomer123'
    );

  insert into public.stripe_events (
    id,
    event_type,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
  values
    (
      'evt_sharedEvent123',
      'checkout.session.completed',
      'development',
      'acct_sharedSandbox123',
      false
    ),
    (
      'evt_sharedEvent123',
      'checkout.session.completed',
      'preview',
      'acct_sharedSandbox123',
      false
    ),
    (
      'evt_sharedEvent123',
      'checkout.session.completed',
      'preview',
      'acct_secondSandbox456',
      false
    ),
    (
      'evt_sharedEvent123',
      'checkout.session.completed',
      'preview',
      'acct_sharedSandbox123',
      true
    );

  if (
    select count(*) from public.stripe_customers
    where stripe_customer_id = 'cus_sharedCustomer123'
  ) <> 4 or (
    select count(*) from public.stripe_events
    where id = 'evt_sharedEvent123'
  ) <> 4 then
    raise exception 'Customer or Event target, account, and mode namespaces did not coexist.';
  end if;

  begin
    insert into public.stripe_customers (
      user_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode,
      stripe_customer_id
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'acct_sharedSandbox123',
      false,
      'cus_sharedCustomer123'
    );
    raise exception 'An exact customer namespace duplicate was accepted.';
  exception
    when unique_violation then null;
  end;

  begin
    insert into public.stripe_events (
      id,
      event_type,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    )
    values (
      'evt_sharedEvent123',
      'checkout.session.completed',
      'preview',
      'acct_sharedSandbox123',
      false
    );
    raise exception 'An exact Event namespace duplicate was accepted.';
  exception
    when unique_violation then null;
  end;

  insert into public.checkout_orders (
    user_id,
    deployment_target,
    product_type,
    catalog_version,
    checkout_attempt_id,
    stripe_account_id,
    stripe_livemode,
    stripe_product_id,
    stripe_price_id,
    customer_email,
    site_url,
    stripe_checkout_session_id,
    expires_at
  )
  values
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'development',
      'lift_guide',
      'lift-complete-v2',
      'development-attempt-0001',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'commerce-isolation@example.invalid',
      'http://localhost:3000',
      'cs_test_orderNamespace12345678',
      now() + interval '1 hour'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'preview-attempt-000000001',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_orderNamespace12345678',
      now() + interval '1 hour'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'preview-second-account-0001',
      'acct_secondSandbox456',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_orderNamespace12345678',
      now() + interval '1 hour'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'preview-live-attempt-0001',
      'acct_sharedSandbox123',
      true,
      'prod_launchProduct123',
      'price_launchPrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_orderNamespace12345678',
      now() + interval '1 hour'
    );

  if (
    select count(*)
    from public.checkout_orders
    where stripe_checkout_session_id = 'cs_test_orderNamespace12345678'
  ) <> 4 then
    raise exception 'Target, account, and mode order namespaces did not coexist.';
  end if;

  begin
    insert into public.checkout_orders (
      user_id,
      deployment_target,
      product_type,
      catalog_version,
      checkout_attempt_id,
      stripe_account_id,
      stripe_livemode,
      stripe_product_id,
      stripe_price_id,
      customer_email,
      site_url,
      stripe_checkout_session_id,
      status,
      expires_at
    )
    values (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'preview-duplicate-paid-001',
      'acct_sharedSandbox123',
      false,
      'prod_launchProduct123',
      'price_launchPrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_orderNamespace12345678',
      'paid',
      now() + interval '1 hour'
    );
    raise exception 'An exact order namespace duplicate was accepted.';
  exception
    when unique_violation then null;
  end;

  select id into preview_order_id
  from public.checkout_orders
  where deployment_target = 'preview'
    and stripe_checkout_session_id = 'cs_test_orderNamespace12345678'
    and stripe_account_id = 'acct_sharedSandbox123'
    and stripe_livemode = false;

  -- Simulate the non-atomic failure boundary directly: the verified purchase
  -- committed, but the corresponding order/provenance write did not.
  insert into public.purchases (
    user_id,
    product_type,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    amount_paid,
    status,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    stripe_product_id,
    stripe_price_id,
    catalog_version,
    currency
  )
  values (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'lift_guide',
    'cs_test_orderNamespace12345678',
    'pi_repairedOrder12345678',
    11.11,
    'active',
    'preview',
    'acct_sharedSandbox123',
    false,
    'prod_launchProduct123',
    'price_launchPrice123',
    'lift-complete-v2',
    'usd'
  );

  update public.checkout_orders
  set
    reconciliation_attempt_count = reconciliation_attempt_count + 1,
    last_reconciliation_attempt_at = now()
  where id = preview_order_id
    and deployment_target = 'preview'
    and stripe_account_id = 'acct_sharedSandbox123'
    and stripe_livemode = false
    and reconciliation_attempt_count = 0;
  get diagnostics first_claim_count = row_count;

  update public.checkout_orders
  set
    reconciliation_attempt_count = reconciliation_attempt_count + 1,
    last_reconciliation_attempt_at = now()
  where id = preview_order_id
    and deployment_target = 'preview'
    and stripe_account_id = 'acct_sharedSandbox123'
    and stripe_livemode = false
    and reconciliation_attempt_count = 0;
  get diagnostics second_claim_count = row_count;

  if first_claim_count <> 1 or second_claim_count <> 0 then
    raise exception 'Reconciliation compare-and-swap admitted more than one claim.';
  end if;

  -- Simulate a committed purchase followed by a failed order write, then run
  -- the replay repair twice. The purchase remains singular and provenance is
  -- first-writer-wins.
  update public.checkout_orders
  set
    status = 'paid',
    stripe_payment_intent_id = 'pi_repairedOrder12345678'
  where id = preview_order_id;

  update public.checkout_orders
  set
    fulfillment_source = 'authenticated_reconciliation',
    fulfilled_at = now()
  where id = preview_order_id
    and fulfillment_source is null;

  update public.checkout_orders
  set
    status = 'paid',
    stripe_payment_intent_id = 'pi_repairedOrder12345678'
  where id = preview_order_id;

  update public.checkout_orders
  set
    fulfillment_source = 'webhook',
    fulfilled_at = now()
  where id = preview_order_id
    and fulfillment_source is null;

  if not exists (
    select 1
    from public.checkout_orders
    where id = preview_order_id
      and status = 'paid'
      and stripe_payment_intent_id = 'pi_repairedOrder12345678'
      and fulfillment_source = 'authenticated_reconciliation'
      and fulfilled_at is not null
  ) then
    raise exception 'Replay did not repair order state and stable provenance.';
  end if;

  if (
    select count(*)
    from public.purchases
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and product_type = 'lift_guide'
      and stripe_checkout_session_id = 'cs_test_orderNamespace12345678'
      and stripe_payment_intent_id = 'pi_repairedOrder12345678'
      and deployment_target = 'preview'
      and stripe_account_id = 'acct_sharedSandbox123'
      and stripe_livemode = false
      and status = 'active'
  ) <> 1 then
    raise exception 'Replay did not preserve exactly one matching committed purchase.';
  end if;

  update public.purchases
  set status = 'refunded'
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    and deployment_target = 'preview';

  update public.purchases
  set status = 'disputed'
  where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    and deployment_target = 'preview'
    and status <> 'refunded';

  if not exists (
    select 1 from public.purchases
    where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and deployment_target = 'preview'
      and status = 'refunded'
  ) then
    raise exception 'A dispute transition resurrected a refunded purchase.';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('memberships', 'purchases', 'stripe_events')
      and column_name = 'deployment_target'
      and column_default is not null
  ) then
    raise exception 'A commerce deployment_target column retained a default.';
  end if;

  if exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'service_role'
      and table_name in (
        'checkout_orders',
        'memberships',
        'purchases',
        'stripe_customers'
      )
      and privilege_type not in ('INSERT', 'SELECT', 'UPDATE')
  ) or exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'service_role'
      and table_name = 'stripe_events'
      and privilege_type not in ('INSERT', 'SELECT')
  ) then
    raise exception 'A commerce service-role table retained an unnecessary privilege.';
  end if;

  if has_table_privilege('authenticated', 'public.purchases', 'SELECT')
    or has_table_privilege('authenticated', 'public.memberships', 'SELECT') then
    raise exception 'An authenticated browser role retained direct commerce-table access.';
  end if;

  if (
    select count(*)
    from (
      select table_name
      from information_schema.role_table_grants
      where table_schema = 'public'
        and grantee = 'service_role'
        and table_name in (
          'checkout_orders',
          'memberships',
          'purchases',
          'stripe_customers'
        )
        and privilege_type in ('INSERT', 'SELECT', 'UPDATE')
      group by table_name
      having count(distinct privilege_type) = 3
    ) as fully_granted_commerce_table
  ) <> 4 or (
    select count(distinct privilege_type)
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'service_role'
      and table_name = 'stripe_events'
      and privilege_type in ('INSERT', 'SELECT')
  ) <> 2 then
    raise exception 'A required commerce service-role privilege is missing.';
  end if;
end
$assertions$;

do $reconciliation_assertions$
declare
  active_order_id constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  cancelled_order_id constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
  active_claim_token uuid;
  cancelled_claim_token uuid;
  expired_claim_token uuid;
  retry_claim_token uuid;
  claimed_count integer;
  reported_count integer;
  completed boolean;
begin
  insert into public.checkout_orders (
    id,
    user_id,
    deployment_target,
    product_type,
    catalog_version,
    checkout_attempt_id,
    stripe_account_id,
    stripe_livemode,
    stripe_product_id,
    stripe_price_id,
    customer_email,
    site_url,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    fulfillment_source,
    fulfilled_at,
    status,
    expires_at
  ) values
    (
      active_order_id,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'scheduled-active-attempt-0001',
      'acct_reconcileSandbox123',
      false,
      'prod_reconcileProduct123',
      'price_reconcilePrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_reconcileActive12345678',
      'pi_reconcileActive12345678',
      'webhook',
      now(),
      'paid',
      now() + interval '1 hour'
    ),
    (
      cancelled_order_id,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'preview',
      'lift_guide',
      'lift-complete-v2',
      'scheduled-cancel-attempt-0001',
      'acct_reconcileSandbox123',
      false,
      'prod_reconcileProduct123',
      'price_reconcilePrice123',
      'commerce-isolation@example.invalid',
      'https://preview.example.invalid',
      'cs_test_reconcileCancel12345678',
      'pi_reconcileCancel12345678',
      'scheduled_reconciliation',
      now(),
      'paid',
      now() + interval '1 hour'
    );

  insert into public.purchases (
    user_id,
    product_type,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    amount_paid,
    status,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    stripe_product_id,
    stripe_price_id,
    catalog_version,
    currency
  ) values
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_reconcileActive12345678',
      'pi_reconcileActive12345678',
      11.11,
      'active',
      'preview',
      'acct_reconcileSandbox123',
      false,
      'prod_reconcileProduct123',
      'price_reconcilePrice123',
      'lift-complete-v2',
      'usd'
    ),
    (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      'lift_guide',
      'cs_test_reconcileCancel12345678',
      'pi_reconcileCancel12345678',
      11.11,
      'cancelled',
      'preview',
      'acct_reconcileSandbox123',
      false,
      'prod_reconcileProduct123',
      'price_reconcilePrice123',
      'lift-complete-v2',
      'usd'
    );

  if (
    select count(*)
    from public.checkout_reconciliation_jobs
    where order_id in (active_order_id, cancelled_order_id)
      and state = 'pending'
      and next_attempt_at is not null
  ) <> 2 then
    raise exception 'Session binding did not enqueue exactly one durable job per order.';
  end if;

  begin
    update public.checkout_orders
    set stripe_checkout_session_id = null
    where id = active_order_id;
    raise exception 'A bound Checkout Session was cleared.';
  exception
    when check_violation then null;
  end;

  if (
    select stripe_checkout_session_id
    from public.checkout_orders
    where id = active_order_id
  ) is distinct from 'cs_test_reconcileActive12345678' then
    raise exception 'The failed Session-clear assertion changed order authority.';
  end if;

  update public.checkout_reconciliation_jobs
  set next_attempt_at = now() - interval '1 minute'
  where order_id = active_order_id;

  select count(*) into reported_count
  from public.report_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    10
  );

  if reported_count <> 1 or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'pending'
      and claim_count = 0
      and claim_token is null
  ) then
    raise exception 'Report mode mutated or failed to return the one due job.';
  end if;

  perform public.report_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    10
  );

  if (
    select count(*)
    from public.checkout_reconciliation_attempts
    where order_id = active_order_id
      and run_id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'
      and mode = 'report'
      and outcome = 'reported'
  ) <> 1 then
    raise exception 'A repeated report run created duplicate audit evidence.';
  end if;

  if (
    select count(*)
    from public.get_checkout_reconciliation_status(
      'preview',
      'acct_reconcileSandbox123',
      false,
      50
    )
  ) <> 2 then
    raise exception 'The exact-namespace status RPC omitted a reconciliation job.';
  end if;

  select claims.claim_token
  into active_claim_token
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    1,
    120
  ) as claims;

  if active_claim_token is null or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'leased'
      and claim_count = 1
      and claim_token = active_claim_token
  ) then
    raise exception 'The due reconciliation job was not leased exactly once.';
  end if;

  select count(*) into claimed_count
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
    1,
    120
  );

  if claimed_count <> 0 then
    raise exception 'A leased job was admitted by a second claim.';
  end if;

  select public.finish_checkout_reconciliation_claim(
    active_order_id,
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'verified_active',
    null
  ) into completed;

  if completed then
    raise exception 'A foreign lease token completed reconciliation work.';
  end if;

  select public.finish_checkout_reconciliation_claim(
    active_order_id,
    active_claim_token,
    'verified_active',
    null
  ) into completed;

  if not completed or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'monitoring'
      and consecutive_failure_count = 0
      and next_attempt_at > now()
      and last_outcome = 'verified_active'
  ) then
    raise exception 'A coherent active purchase did not enter periodic monitoring.';
  end if;

  if (
    select count(*)
    from public.checkout_reconciliation_attempts
    where order_id = active_order_id
      and claim_token = active_claim_token
  ) <> 2 then
    raise exception 'A completed lease did not retain one claim and one closing event.';
  end if;

  begin
    update public.checkout_reconciliation_attempts
    set error_code = 'rewritten_history'
    where order_id = active_order_id
      and claim_token = active_claim_token;
    raise exception 'Append-only reconciliation evidence was updated.';
  exception
    when object_not_in_prerequisite_state then null;
  end;

  update public.checkout_reconciliation_jobs
  set next_attempt_at = now() - interval '1 minute'
  where order_id = active_order_id;

  select claims.claim_token
  into retry_claim_token
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
    1,
    120
  ) as claims;

  select public.finish_checkout_reconciliation_claim(
    active_order_id,
    retry_claim_token,
    'retryable_error',
    'provider_timeout'
  ) into completed;

  if not completed or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'retry_wait'
      and consecutive_failure_count = 1
      and next_attempt_at > now()
      and claim_token is null
  ) then
    raise exception 'A retryable failure did not release and reschedule its lease.';
  end if;

  update public.checkout_reconciliation_jobs
  set next_attempt_at = now() - interval '1 minute'
  where order_id = active_order_id;

  select claims.claim_token
  into expired_claim_token
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc5',
    1,
    120
  ) as claims;

  update public.checkout_reconciliation_jobs
  set lease_expires_at = now() - interval '1 minute'
  where order_id = active_order_id
    and claim_token = expired_claim_token;

  select count(*) into claimed_count
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc6',
    1,
    120
  );

  if claimed_count <> 0 or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'retry_wait'
      and consecutive_failure_count = 2
      and claim_token is null
      and next_attempt_at > now()
  ) or not exists (
    select 1
    from public.checkout_reconciliation_attempts
    where order_id = active_order_id
      and claim_token = expired_claim_token
      and outcome = 'lease_expired'
      and error_code = 'lease_expired'
  ) then
    raise exception 'An expired lease was not durably closed and rescheduled.';
  end if;

  select public.finish_checkout_reconciliation_claim(
    active_order_id,
    expired_claim_token,
    'verified_active',
    null
  ) into completed;

  if completed then
    raise exception 'An expired lease token completed after reclamation.';
  end if;

  update public.checkout_reconciliation_jobs
  set next_attempt_at = now() - interval '1 minute'
  where order_id = active_order_id;

  select claims.claim_token
  into retry_claim_token
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc7',
    1,
    120
  ) as claims;

  select public.finish_checkout_reconciliation_claim(
    active_order_id,
    retry_claim_token,
    'inconsistent',
    'provider_identity_mismatch'
  ) into completed;

  if not completed or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = active_order_id
      and state = 'manual_review'
      and alert_pending
      and alert_required_at is not null
      and manual_review_reason = 'provider_identity_mismatch'
      and next_attempt_at is null
      and claim_token is null
  ) then
    raise exception 'An inconsistent provider result did not require durable review.';
  end if;

  select count(*) into reported_count
  from public.report_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc8',
    10
  ) as reports
  where reports.order_id = active_order_id
    and reports.alert_pending
    and reports.manual_review_reason = 'provider_identity_mismatch';

  if reported_count <> 1 then
    raise exception 'Report mode did not surface the durable manual-review alert.';
  end if;

  update public.checkout_reconciliation_jobs
  set next_attempt_at = now() - interval '1 minute'
  where order_id = cancelled_order_id;

  select claims.claim_token
  into cancelled_claim_token
  from public.claim_due_checkout_reconciliations(
    'preview',
    'acct_reconcileSandbox123',
    false,
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc9',
    1,
    120
  ) as claims;

  select public.finish_checkout_reconciliation_claim(
    cancelled_order_id,
    cancelled_claim_token,
    'terminal',
    null
  ) into completed;

  if not completed or not exists (
    select 1
    from public.checkout_reconciliation_jobs
    where order_id = cancelled_order_id
      and state = 'complete'
      and completed_at is not null
      and last_outcome = 'terminal'
  ) or not exists (
    select 1
    from public.checkout_orders
    where id = cancelled_order_id
      and fulfillment_source = 'scheduled_reconciliation'
  ) then
    raise exception 'A coherent cancelled tombstone did not complete safely.';
  end if;

  if has_table_privilege(
    'service_role',
    'public.checkout_reconciliation_jobs',
    'SELECT'
  ) or has_table_privilege(
    'service_role',
    'public.checkout_reconciliation_attempts',
    'SELECT'
  ) or has_table_privilege(
    'authenticated',
    'public.checkout_reconciliation_jobs',
    'SELECT'
  ) or has_table_privilege(
    'authenticated',
    'public.checkout_reconciliation_attempts',
    'SELECT'
  ) then
    raise exception 'A browser or service role retained direct reconciliation-table access.';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.report_due_checkout_reconciliations(text,text,boolean,uuid,integer)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.get_checkout_reconciliation_status(text,text,boolean,integer)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.claim_due_checkout_reconciliations(text,text,boolean,uuid,integer,integer)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.finish_checkout_reconciliation_claim(uuid,uuid,text,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.report_due_checkout_reconciliations(text,text,boolean,uuid,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.get_checkout_reconciliation_status(text,text,boolean,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.claim_due_checkout_reconciliations(text,text,boolean,uuid,integer,integer)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.finish_checkout_reconciliation_claim(uuid,uuid,text,text)',
    'EXECUTE'
  ) then
    raise exception 'Reconciliation RPC execution privileges are not least-privilege.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'checkout_reconciliation_jobs_order_namespace_fkey'
      and contype = 'f'
  ) or not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'checkout_reconciliation_jobs_due_idx'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'checkout_orders_fulfillment_source_check'
      and pg_get_constraintdef(oid) like '%scheduled_reconciliation%'
  ) then
    raise exception 'A required reconciliation namespace, index, or source invariant is missing.';
  end if;
end
$reconciliation_assertions$;

rollback;

select 'commerce database isolation, replay, and reconciliation assertions passed' as result;
