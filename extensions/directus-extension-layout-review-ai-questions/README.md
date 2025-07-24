# Directus Interface – AI Questions Review

Custom Directus interface that lists rows from `ai_question_staging` and lets moderators accept or decline each question.

## Build / Dev
```bash
pnpm i
pnpm dev
```

## Features
- Accordion list of pending questions.
- Green highlight for correct answers.
- Accept → calls `accept_ai_question` procedure.
- Decline → prompts for reason, calls `decline_ai_question` procedure.

## TODO
- Paginate results.
- Replace prompt() with proper modal textarea. 