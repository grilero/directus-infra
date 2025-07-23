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