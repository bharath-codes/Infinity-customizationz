Render Deployment Notes

Problem observed:
- Error: Cannot find module 'express' during runtime.
- Cause: Render ran `npm start` at runtime but backend dependencies were not installed in the backend folder. The root `start` runs `npm --prefix backend start` but install step did not install backend/node_modules.

Two fixes (pick one):

Option A — (Recommended) Let render run `npm install` and use the `postinstall` hook
- The repo now has a root `postinstall` script that runs:
  ```
  npm --prefix backend ci --silent
  ```
- This runs automatically during `npm install` on Render and will ensure backend dependencies like `express` are installed before `npm start` runs.

Option B — Configure the Render service explicitly
- In your Render service settings set:
  - Build Command: `npm --prefix backend ci`
  - Start Command: `npm --prefix backend start`
- This avoids any dependence on root-level `postinstall` scripts and keeps build/start commands explicit.

Notes & best practices:
- Keep backend and frontend separate on Render. Deploy frontend as a static web service (Vercel/Netlify/Render static) or a separate Render service that runs `npm --prefix frontend run build` during its build step.
- Alternatively, a single-service approach is possible but requires a dedicated build step that installs both frontend and backend deps (not recommended for most setups).

If you'd like, I can also:
- Remove `start.sh` to avoid confusion (it’s harmless but can mislead), or
- Create GitHub Actions to build + deploy frontend automatically to a static host and keep backend deployment separate.
