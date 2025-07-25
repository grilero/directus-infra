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

## Session Update (2025-07-24 - Continued)

### Major Infrastructure Improvements Completed ✅
1. **SSL Certificate Auto-Renewal Fixed**
   - Updated `docker-compose.yml` certbot service to check every 12 hours instead of 24
   - Added proper service dependencies for certbot → nginx

2. **Comprehensive Documentation Created**
   - Completely rewrote `README.md` with full setup instructions, environment variables, troubleshooting
   - Added architecture overview, quick start guide, and common operations
   - Included project structure and version information

3. **GitHub Actions Deployment Pipeline Setup**
   - Created `.github/workflows/deploy.yml` for automated deployment to dev/main branches
   - Created `.github/workflows/test.yml` for PR testing and extension builds
   - Supports dual environment deployment (production/development)
   - Includes health checks and rollback capabilities

4. **AI Review Layout Extension Debugging**
   - Fixed field name mapping: `ai_answer_options_staging` instead of `answer_options`
   - Corrected status filter from `'pending_review'` to `'pending'`
   - Extension builds successfully and loads in Directus logs
   - Issue: Layout dropdown not appearing in Directus interface

5. **AWS Optimization Guide Created**
   - Documented free tier optimization strategies
   - Included alternatives like Railway.app, Fly.io, DigitalOcean
   - Created resource monitoring and dual-environment setup guides

### Remaining Issues Identified ❌
1. **Directus Collection Warnings**
   - Collections like `flashcards`, `quiz_instance_questions`, `subchapters`, `user_settings` appear greyed out
   - Fields show "database only: click to configure" requiring manual intervention
   - Multiple SQL scripts created but user prefers different approach

2. **AI Review Layout Not Visible**
   - Extension loads correctly but doesn't appear in layout dropdown
   - May need test data or different extension type (Interface vs Layout)
   - Needs investigation into collection requirements

### Files Created This Session
- `README.md` - Comprehensive setup documentation
- `.github/workflows/deploy.yml` - Automated deployment pipeline
- `.github/workflows/test.yml` - Extension testing workflow
- `aws-optimization.md` - AWS free tier optimization guide
- `setup-ai-review.md` - AI review system setup instructions
- `fix-directus-collections.sql` - Database metadata fix (multiple versions)
- `fix-collections-script.sh` - Automation script for field configuration
- `fix-all-database-fields.sql` - Comprehensive field auto-configuration (not executed)

### Next Session Priority
- Resolve "database only" field warnings using alternative approach
- Get AI review layout to appear in Directus interface
- Add test data to verify layout functionality

## Session Update (2025-07-25)

### Goal: Create a Local Development Environment

We successfully set up a complete, isolated local development environment that mirrors your production setup. This allows for safe testing and development without affecting your live data.

### Key Accomplishments

1.  **Local Supabase Instance Created:**
    *   We used the Supabase CLI to create a full local instance of your Supabase project, including the database, Auth, and Storage, all running in Docker on your machine.
    *   We pulled the schema from your remote database to ensure the local one has an identical structure.

2.  **Critical Schema Bug Fixed:**
    *   We discovered the process was failing because of invalid security policies in your database schema. These policies referenced a function (`auth.user_has_selected_domain()`) that does not exist.
    *   We fixed this by editing the **local** migration script to remove the broken function calls from the policies. **Your production database was not altered.**

3.  **Environment-Specific Configuration Implemented:**
    *   We created two separate environment files: `.env.local` for your local machine and `.env.production` for your EC2 server.
    *   We modified the `docker-compose.yml` file to dynamically select the correct `.env` file based on an `ENV` variable (`ENV=production` for production, default for local).
    *   This is a critical best practice for separating development and production settings.

4.  **Secure Production Workflow Designed:**
    *   We established that production secrets (`DIRECTUS_KEY`, `DIRECTUS_SECRET`, etc.) must be generated manually and **never** committed to Git.
    *   We updated your `.github/workflows/deploy.yml` to use **GitHub Environments** and **Environment Secrets**. This is the most secure method, as it prevents production secrets from ever being used in a development context.

### Where We Left Off / Next Steps

Your local development environment is fully configured and ready to use. The next steps are for you to complete the production setup:

1.  **Generate Production Secrets:** Use the `openssl rand -hex 32` command (twice) to generate your unique `DIRECTUS_KEY` and `DIRECTUS_SECRET`.
2.  **Configure GitHub Environments:**
    *   In your GitHub repository settings, create two environments: `production` and `development`.
    *   Add your production secrets (the ones you just generated, plus your production database credentials) to the `production` environment.
    *   Add your development secrets to the `development` environment.
3.  **Start Local Development:** Run `docker-compose up -d` in your project directory to start your local Directus and Supabase instances.
4.  **Deploy to Production:** When you are ready, push your changes to the `main` branch. The updated GitHub Actions workflow will handle the rest, securely deploying your application with the correct production secrets.
