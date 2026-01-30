Railway Deployment Checklist

1. Create a new project on Railway and connect your GitHub repo.
2. Railway will detect the app. If it doesn't, ensure a `Procfile` exists at repo root (this repo has one).
   - The `Procfile` runs: `npm --prefix backend start` which starts the backend server.
3. Set Environment Variables in Railway (Project Settings → Variables):
   - `MONGO_URI` (required): your MongoDB connection string (Atlas or external).
   - `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` (if you use Shiprocket features).
   - `JWT_SECRET`, `JWT_ADMIN_SECRET` (optional, recommended to override defaults).
4. If you want to deploy the frontend separately: create a second Railway service or host it on Vercel/Netlify. The frontend in `frontend/` is a Vite app—build with `npm run build` there.
5. Notes:
   - The server listens on `process.env.PORT` (Railway sets this automatically).
   - Uploaded files are stored in `/uploads` (ephemeral on Railway—use cloud storage for persistence in production).
   - For debugging, check Railway logs and the `MONGO_URI` connectivity.


IMPORTANT: If you are deploying **backend only** (recommended):
- **Do not** run `sh ./start.sh` in your service start command — that script attempts to build the frontend and requires frontend dev dependencies (like Vite) which are not installed in a backend-only service.
- Use `npm --prefix backend start` or point the Procfile to the backend start instead. This will run `node server.js` from the `backend` folder and avoids trying to run the frontend build inside the backend service.

If you prefer to deploy both frontend and backend in one service, this repo includes a `start.sh` and a root `package.json` to support that. The `start.sh` will build the frontend (`frontend/dist`) and then start the backend. The backend also serves the built frontend automatically when the `frontend/dist` folder exists.
