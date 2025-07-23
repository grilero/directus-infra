# Project Planning – directus-infra

## Purpose
Manage Directus infrastructure for Grile.ro, including custom extensions, database migrations, and automation helpers.  Today we add the “AI-Generated Questions Review” feature.

## Key Domains
1. **AI Question Staging** (`ai_question_staging`, `ai_answer_options_staging`)
2. **Production Questions** (`questions`, `answer_options`)
3. **User Review Process** – moderators review AI content.
4. **Directus Extensions** – custom Vue interfaces, dashboards, widgets.

## Architectural Decisions
- **Database source of truth**: Postgres managed by Supabase.  We keep staging tables separate; approved rows are migrated via stored procedures.
- **Directus UX**: custom interface `interface-review-ai-questions` renders accordion list, actions call endpoints.
- **Naming conventions**: kebab-case for extension folders; snake_case for DB columns; TypeScript for extension code.
- **File structure**:
  ```
  extensions/
    directus-extension-interface-review-ai-questions/
      src/
        interface.vue
        api.ts
  migrations/
    YYYYMMDD_ai_review_procedures.sql
  ```
- **RLS**: Staging tables have `rls_enabled = false` so reviewers can access; production tables keep Directus default RLS.

## Review Flow
1. Scheduled job inserts rows into `ai_question_staging` + answers.
2. Reviewer opens “AI Questions Review”.
3. For each record:
   • Inspect prompt, answers, meta.
   • Accept → `select accept_ai_question(<id>, <user_id>);`
   • Decline → `select decline_ai_question(<id>, <user_id>, <reason>);`
4. Procedure copies/moves data and updates status.
5. Dashboard widget shows counts of reviewed questions on user profile (view `vw_user_review_stats`).

## Migrations
- Create `accept_ai_question`, `decline_ai_question` SQL functions.
- (Optional) triggers to cascade delete staging answers when parent deleted.

## Testing Strategy
- Jest + @testing-library/vue for interface logic.
- pgTAP for PL/pgSQL functions.

## TODO (see TASK.md for granular list) 