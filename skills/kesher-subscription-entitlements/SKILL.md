---
name: kesher-subscription-entitlements
description: Implement Kesher subscriptions, premium gates, quotas, billing webhooks, refunds, and abuse-resistant trials.
---

# Kesher Subscription Entitlements

Use this skill for commercial readiness.

## Requirements

- Entitlement checks must run server-side and be reflected in client state.
- Premium access cannot bypass safety, identity, privacy, or consent gates.
- Webhook handlers must be idempotent and auditable.
- Refunds, cancellations, trials, and charge disputes must update entitlements predictably.

## Acceptance

- Premium UI reads from canonical entitlement state.
- Trial abuse controls are documented and tested.
- Billing records avoid storing unnecessary sensitive dating data.
