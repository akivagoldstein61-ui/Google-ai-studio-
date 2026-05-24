# Web-to-iOS / PWA Claim Qualifier

Trigger: Use for PWA, iOS, App Store, Capacitor, Expo, or native mobile claims.

## Rules

1. Lovable output is web-first.
2. Mobile-friendly web is not native iOS.
3. PWA requires manifest/service-worker/installability tests.
4. Capacitor wrapper requires simulator/device smoke tests: auth, routing, images, safe areas, keyboard behavior, messaging, report/block.
5. Expo/React Native is a separate implementation lane.
6. No App Store claim or submission without release approval and store-readiness evidence.

If tests have not been run, label the claim `UNKNOWN` and downgrade to `mobile-friendly web`.
