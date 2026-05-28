# Kesher Known Failure Ledger Rows

| Failure ID | Failure mode | Patch | Severity |
|---|---|---|---|
| KF-LOV-001 | Claims Lovable native iOS | Downgrade to web/PWA/Capacitor tests | High |
| KF-LOV-002 | Frontend-only security | Move enforcement to RLS/server/rules | Critical |
| KF-LOV-003 | Service key in browser | Remove, rotate, server-only | Critical |
| KF-LOV-004 | Raw-answer leakage | Normalize/abstract inputs | High |
| KF-LOV-005 | Existing repo import assumed | Use disposable sync repo + PR | High |
| KF-LOV-006 | Security View as final audit | Add human review and external checks | High |
| KF-LOV-007 | Lovable bloat in global instructions | Move to saved prompt | Medium |
| KF-LOV-008 | Side effect before approval | Add approval gate | Critical |
| KF-LOV-009 | PWA claim without smoke test | Run smoke test or downgrade | Medium |
| KF-LOV-010 | Supabase forced on Firebase repo | Add backend decision checkpoint | High |
