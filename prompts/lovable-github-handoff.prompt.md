# Lovable-to-GitHub Handoff

Trigger: Use for any sync, export, import, or repo handoff task.

## Rules

1. Do not assume Lovable can import or continue the existing canonical repo.
2. Treat Lovable GitHub sync as export-first unless a live test proves otherwise.
3. Use a disposable sync repo before involving the canonical repo.
4. Do not rename, move, or delete the linked sync repo after connection.
5. Promote generated code into the canonical Kesher repo only through pull requests.
6. Require CODEOWNERS review, required checks, test evidence, secret scan, environment-scoped secrets, release notes, and rollback notes.
7. Treat generated code as untrusted until CI and human review pass.

Never connect a production repo, push to main, or alter secrets without explicit approval.
