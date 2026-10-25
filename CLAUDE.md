# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

Only the Mutual NDA is supported so far, and there is no AI chat yet. See "Implementation status" below.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation status

Done (SCRUM-5, SCRUM-6, SCRUM-7):
- `templates/` holds the Common Paper templates listed in `catalog.json`.
- Frontend: Next.js 16 + Tailwind, statically exported (`output: "export"`, `trailingSlash: true`) to `frontend/out`.
  - `/` – placeholder sign-in (`components/LoginForm.tsx`); accepts any input and goes to `/nda/`, no real auth yet.
  - `/nda/` – Mutual NDA creator: form + live preview + PDF download via `window.print()` (`components/Nda*.tsx`, logic in `lib/nda.ts`). The NDA templates are read from `templates/` at build time.
- Backend: uv + FastAPI in `backend/app/`. `GET /api/health` only; serves the static frontend at `/` from `STATIC_DIR` (default `static`).
  - `db.py` deletes and recreates the SQLite DB (`DB_PATH`, default `prelegal.db`) on startup with a `users` table (`id`, `email`, `password_hash`, `created_at`). No sign-up/sign-in endpoints yet.
- Docker: multi-stage `Dockerfile` (Node builds frontend, Python image runs uvicorn on port 8000). `scripts/start-*` build the image and run container `prelegal` with `--env-file .env`; `scripts/stop-*` stop it.
- Tests: backend `cd backend && uv run pytest`; frontend `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run test:e2e` (Playwright, runs against the real backend). CI: `.github/workflows/frontend-ci.yml` runs all of these.

Not yet done: real sign-up/sign-in, AI chat (LiteLLM/Cerebras), and documents other than the Mutual NDA.
