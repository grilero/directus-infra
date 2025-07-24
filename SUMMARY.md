# Project Summary

Grile.ro Directus Infrastructure provides content management for medical exam prep questions, books, and quizzes – running on Supabase Postgres with Directus as the CMS layer plus custom extensions.

## Key Collections
- `questions`, `answer_options` – production question bank.
- `ai_question_staging`, `ai_answer_options_staging` – ML-generated content awaiting human review.
- `books`, `chapters`, `subchapters` – hierarchical source metadata.

## New Feature (2025-07-23)
1. Added **PLANNING.md** with architecture decisions for “AI-Generated Questions Review”.
2. Defined database flow: accept / decline procedures, reviewer stats view.
3. Outlined new Directus interface extension `interface-review-ai-questions` (accordion list, accept/decline actions).

These changes lay groundwork; actual migrations & UI code will be implemented in subsequent tasks recorded in `TASK.md`. 

## Session Update (2025-07-24)

### What we tackled
- Implemented and applied SQL migration `migrations/20250723_ai_review_procedures.sql` to add `accept_ai_question`, `decline_ai_question`, and `vw_user_review_stats`.
- Scaffolded custom Directus extension, iteratively refined:
  - Switched from *interface* to **layout** (`directus-extension-layout-review-ai-questions`).
  - Replaced `@directus/sdk` with `@directus/extensions-sdk` and used `defineLayout`.
  - Added proper `directus:extension` manifest, `types: ['collection']`, and Vite/TS configs.
  - Fixed bundle-loading issues, renamed folder & package, ensured build output in `dist/`.
- Removed unused `binary-answer` extension to clean boot warnings.
- Enabled hot-reload via `EXTENSIONS_AUTO_RELOAD=true`.

### Infrastructure & Ops
- Upgraded Directus container from **11.2.1 → 11.9.3** using Docker Compose v2 (`docker compose`).
- Documented safe upgrade/rollback and recommended pinning the image tag.
- Clarified difference between legacy `docker-compose` and modern `docker compose` on EC2.

### Where we left off / Next steps
- Re-build extension (`pnpm build`) & restart Directus → ensure layout shows in `ai_question_staging` picker.
- Polish UI (modal for decline reason, pagination, toast on action).
- Add dashboard widget displaying reviewer stats.
- Write pgTAP tests for SQL procedures & unit tests for Vue layout.
- Pin Directus image (`image: directus/directus:11.9.3`) in `docker-compose.yml` and commit. 