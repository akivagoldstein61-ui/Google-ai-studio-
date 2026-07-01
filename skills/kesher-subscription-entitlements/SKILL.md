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


## Implementation Workflow
1. **Checkout Session:** Implement a server route to create a Stripe Checkout session.
2. **Webhook Handler:** Implement `server/billingRoutes.ts` to handle Stripe webhooks (e.g., `checkout.session.completed`, `customer.subscription.updated`).
3. **Entitlement Update:** Update the user's entitlement status in Firestore based on the webhook payload.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement Stripe checkout sessions and webhook handlers to manage subscription entitlements.
