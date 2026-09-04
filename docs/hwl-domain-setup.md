# hwlbysmd.com — Domain Setup

Owner-selected domain, September 4, 2026. No paid plan, DNS edit, credential
creation, or Production deployment was performed for this record.

## Website

Canonical: `https://www.hwlbysmd.com`. Keep the existing Vercel HTTP 308
redirect from `https://hwlbysmd.com` to `https://www.hwlbysmd.com`.

At 10:38 AM PDT, Vercel confirmed both domains are verified and assigned to
`whole-body-earth/hwl-by-smd`. Authoritative Porkbun DNS matched Vercel:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `216.198.79.1` |
| CNAME | `www` | `e662837722e1e8d4.vercel-dns-017.com` |

These website records already exist. Do not add duplicates or replace them.
Correct DNS does not deploy the new application candidate.

`preview.hwlbysmd.com` still needs an explicitly approved checkpoint-branch
assignment. Read Vercel's exact target after assignment, then add only that
record. Keep the existing branch-alias sandbox webhook until the hostname,
environment, Auth callback, and webhook destination can be verified together.

## Resend sending — DNS pending

The new domain was added in the signed-in `jesse.gawlik` Resend team; a later
September 4 browser read shows that team's name as **HWLbySMD** under the same
signed-in account. The domain status remains **Not Started**. Domain ID:
`74f41a20-cb2c-4902-a9bb-378ed2049143`.

- [Resend domain and verification](https://resend.com/domains/74f41a20-cb2c-4902-a9bb-378ed2049143)
- [Porkbun domain DNS](https://porkbun.com/account/domainsSpeedy/hwlbysmd.com)

The records below were copied from this exact new domain's Resend page on
September 4. They differ from the old domain's Amazon SES records. Recheck
the domain page before applying them. These are public DNS values, not API
secrets. Domain creation alone does not authorize email sending.

| Required | Type | Host in Porkbun | Content | TTL |
| --- | --- | --- | --- | --- |
| Yes | TXT | `resend._domainkey` | The complete DKIM value below | Auto/default |
| Yes | CNAME | `rsend` | `rsend.forge.rmta.net` | Auto/default |
| Yes | CNAME | `send` | `send.forge.rmta.net` | Auto/default |
| Optional; owner policy choice | TXT | `_dmarc` | `v=DMARC1; p=none;` | Auto/default |

DKIM TXT content (one continuous value):

```text
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDSzvZi1L51xpgBNHjNQNQZML7UbG7w1DO2OOg29kRBBwQgduoszxGe+XLpGAGt/OTvEnQJZ2k/WzrdqIntpRJ5fPmZLgVo40xJBrcf8ACgkWfVBuxjCdxLGjspoPvqEN9B7bVi+1ltEO51AaXwOVJUj1M+2s2b75+70+A/4hw7BQIDAQAB
```

Preserve the existing apex Porkbun MX/SPF forwarding configuration. Do not
add a second root SPF record, change nameservers, turn on Resend receiving,
replace stricter DMARC policy, or delete the old unverified Resend domain as
part of this sending setup. If an exact hostname already has a record, inspect
it before editing; do not overwrite a conflicting record blindly.

After owner-approved DNS changes:

1. Verify the exact TXT/CNAME records through authoritative DNS.
2. Click **Verify DNS Records** in this new domain's Resend page.
3. Require Resend's verified/sending-ready state, not just submitted DNS.
4. Create an approved sending-only key restricted to `hwlbysmd.com`. Store it
   privately in local and sensitive checkpoint-branch Preview configuration.
   Never paste it into this document, chat, source, or an API URL.
5. Use `HWL by SMD <hello@hwlbysmd.com>` as `CONTACT_FROM_EMAIL`; retain
   Shannon's existing `CONTACT_TO_EMAIL` destination.
6. Verify a real inquiry's DB receipt, notification audit, and inbox arrival.
   Supabase Auth SMTP and confirmation/recovery delivery are separate tests.

No new key, mail verification, or delivery is claimed complete here. No
Production promotion or `main` push is authorized by this document.
