# TASKS

## 2025-07-23
### AI-Generated Questions Review
- [ ] DB: Write migration to add `accept_ai_question`, `decline_ai_question` functions and any supporting triggers.
- [ ] DB: Create `vw_user_review_stats` summarising reviewer counts.
- [ ] Directus Extension: Scaffold `directus-extension-interface-review-ai-questions` (Vue 3 + TS).
  - [ ] Accordion list of `ai_question_staging` rows with meta.
  - [ ] Accept & Decline with reason input.
  - [ ] Call custom REST endpoints invoking SQL procedures.
- [ ] Dashboard Widget: Show review stats on user profile.
- [ ] Tests: pgTAP for procedures; Jest/Vue tests for UI.

## Discovered During Work
*(add new subtasks here)* 