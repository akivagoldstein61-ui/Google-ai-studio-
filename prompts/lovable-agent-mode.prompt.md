# Lovable Agent Mode Prompt - Bounded Vertical Slice

Implement only the approved vertical slice.

## Constraints

- Do not implement unrelated features.
- Do not introduce real user data.
- Do not place secrets or service-role keys in frontend code.
- Do not rely on frontend-only authorization.
- Preserve report/block/moderation/deletion/audit posture.
- Use synthetic seed data only.
- If backend is Supabase, use RLS/edge-function enforcement.
- If backend is existing Firebase/Gemini continuity, do not silently switch to Supabase.

Stop if the task requires migrations, secrets, production publish, GitHub connection, billing, or native mobile packaging unless explicit approval has been given.
