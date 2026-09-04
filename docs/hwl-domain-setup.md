# hwlbysmd.com — Domain Setup

Owner-selected domain, September 4, 2026. This record now includes the approved
Preview CNAME, verified Resend sending DNS, and the restricted Preview sending
credential. No Production deployment or `main` push was performed.

## Website

Canonical: `https://www.hwlbysmd.com`. Keep the existing Vercel HTTP 308
redirect from `https://hwlbysmd.com` to `https://www.hwlbysmd.com`.

At 10:38 AM PDT, Vercel confirmed both domains are verified and assigned to
`whole-body-earth/hwl-by-smd`. Authoritative Porkbun DNS matched Vercel:

| Type  | Host  | Value                                 |
| ----- | ----- | ------------------------------------- |
| A     | `@`   | `216.198.79.1`                        |
| CNAME | `www` | `e662837722e1e8d4.vercel-dns-017.com` |

These website records already exist. Do not add duplicates or replace them.
Correct DNS does not deploy the new application candidate.

`preview.hwlbysmd.com` is now verified in Vercel and assigned only to
`checkpoint/platform-overhaul-2026-08-20`. Authoritative and public DNS return
`CNAME cname.vercel-dns.com`; Vercel reports `misconfigured:false`, and TLS
validates for the hostname. It maps to READY deployment
`dpl_9uzHczDpUXxWXwQcKUwsZakxDJCy` for the exact application-source commit
`96809cf5cbc12f2b23387c1d68f166618e1baa0f`, and later READY deployment
`dpl_3oXc5J2HSotSFymRrpdDNrAamk6P` for documentation-only checkpoint
`e4ebaf0`. The branch-bound hostname follows later READY checkpoint builds, so
its current deployment ID must be resolved externally after each push.
Deployment Protection remains enabled; anonymous access redirects to Vercel
SSO.

## Resend sending — DNS verified, delivery test pending

The new domain was added in the signed-in **HWLbySMD** Resend team. Its status
is now **Verified**. Domain ID:
`74f41a20-cb2c-4902-a9bb-378ed2049143`.

- [Resend domain and verification](https://resend.com/domains/74f41a20-cb2c-4902-a9bb-378ed2049143)
- [Porkbun domain DNS](https://porkbun.com/account/domainsSpeedy/hwlbysmd.com)

The records below were copied from this exact new domain's Resend page and now
resolve publicly. They differ from the old domain's Amazon SES records. These
are public DNS values, not API secrets. Domain verification is configuration
authority only; a real accepted send and human mailbox receipt remain separate
launch evidence.

| Required                      | Type  | Host in Porkbun     | Content                       | TTL          |
| ----------------------------- | ----- | ------------------- | ----------------------------- | ------------ |
| Yes                           | TXT   | `resend._domainkey` | The complete DKIM value below | Auto/default |
| Yes                           | CNAME | `rsend`             | `rsend.forge.rmta.net`        | Auto/default |
| Yes                           | CNAME | `send`              | `send.forge.rmta.net`         | Auto/default |
| Optional; owner policy choice | TXT   | `_dmarc`            | `v=DMARC1; p=none;`           | Auto/default |

DKIM TXT content (one continuous value):

```text
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDSzvZi1L51xpgBNHjNQNQZML7UbG7w1DO2OOg29kRBBwQgduoszxGe+XLpGAGt/OTvEnQJZ2k/WzrdqIntpRJ5fPmZLgVo40xJBrcf8ACgkWfVBuxjCdxLGjspoPvqEN9B7bVi+1ltEO51AaXwOVJUj1M+2s2b75+70+A/4hw7BQIDAQAB
```

Preserve the existing apex Porkbun MX/SPF forwarding configuration. Do not
add a second root SPF record, change nameservers, turn on Resend receiving,
replace stricter DMARC policy, or delete the old unverified Resend domain as
part of this sending setup. If an exact hostname already has a record, inspect
it before editing; do not overwrite a conflicting record blindly.

Completed configuration and remaining proof:

1. **Complete:** exact TXT/CNAME records verified through authoritative and
   public DNS.
2. **Complete:** Resend reports the exact new domain verified/sending-ready.
3. **Complete:** an approved sending-only replacement key restricted to
   `hwlbysmd.com` was created and stored as a sensitive checkpoint-branch
   Preview variable.
   Never paste it into this document, chat, source, or an API URL.
4. **Complete:** use `HWL by SMD <hello@hwlbysmd.com>` as
   `CONTACT_FROM_EMAIL`; retain
   Shannon's existing `CONTACT_TO_EMAIL` destination.
5. **Pending:** verify a real inquiry's DB receipt, notification audit, stable
   retry, and Shannon's inbox arrival.
   Supabase Auth SMTP and confirmation/recovery delivery are separate tests.

No real inquiry delivery is claimed complete here. No Production promotion or
`main` push is authorized by this document.
