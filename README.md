# SocioMantra IAS Academy

Full website for SocioMantra IAS Academy - a React frontend and a Spring
Boot + MySQL backend, kept as two projects in one folder so they can be run,
deployed and version-controlled independently.

```
sociomantra/
  frontend/           React + Vite + Tailwind CSS website
  backend/             Spring Boot 3 + MySQL REST API
  docker-compose.yml   Runs MySQL + backend + frontend together
  .env.example          Copy to .env before using docker-compose
```

## What's in the box

- Full public site (Home, About, Courses, Curriculum with PDF export,
  Faculty with tap-through profiles, Blog, Contact, Enroll Now)
- Student sign up/sign in, admin sign in, forgot/reset password, change
  password - student and admin sessions are fully independent (separate
  storage, separate tokens), so signing into one never affects the other,
  and refreshing any login page always shows consistent state (see
  "Authentication architecture" in `frontend/README.md` for the full
  explanation of a real bug this fixes)
- Admin dashboard with **complete CRUD**: add/edit/delete faculty and
  courses, create/edit/delete/draft blog posts, real image uploads (no more
  placeholder upload boxes), enquiry management, and a Settings area
  covering general info, email, social links, SEO/homepage copy, and
  security
- JWT auth, role-based access control (with clean 401 vs 403 JSON
  responses), rate limiting on auth/enquiry endpoints, and a documented (if
  not yet email-connected) password reset flow
- Docker setup for all three services plus an Nginx reverse proxy config
- A couple of backend JUnit test classes as a starting point

See `frontend/README.md` and `backend/README.md` for full details -
including an honest "production checklist" at the bottom of the backend
README of what's still worth doing before a real launch (email delivery for
password resets, HTTPS termination, migrations, more test coverage, etc).

## Running it locally

### Option A: Docker Compose (recommended - runs all three services)

```bash
cp .env.example .env
# edit .env: set DB_PASSWORD and JWT_SECRET to real values
docker compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`
- MySQL: `localhost:3306`

The frontend container's Nginx reverse-proxies `/api/*` and `/uploads/*` to
the backend container, so there's no CORS configuration to worry about in
this setup.

### Option B: Run each service directly

You need both running at the same time - the frontend calls the backend
over HTTP.

**1. Start the backend** (needs MySQL running locally):

```bash
cd backend
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
mvn spring-boot:run
```

It listens on `http://localhost:8080` and seeds the database with an admin
account, all courses/curriculum, all faculty profiles, and default settings
on first run.

**2. Start the frontend:**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

It listens on `http://localhost:5173` and proxies `/api/*` and `/uploads/*`
to the backend.

## Demo login

- **Admin:** `admin@sociomantrias.com` / `admin123` (seeded automatically -
  change it from Settings → Security once logged in, or before going live)
- **Student:** create your own account via Sign Up

## A note on verification

I've hand-checked both projects for structural correctness (matching
package declarations, balanced braces, every imported function/icon/route
actually existing) since this sandbox has no internet access to run
`mvn compile` or `npm run dev` myself. That catches a lot of mistakes but
not everything a real compiler/bundler would. Please run it locally (Option
A above is the fastest way to smoke-test everything at once) and send me
any errors - I'll fix them quickly.

## Deploying to a real server

1. **Get a server and point your domain at it** (a $6-12/month VPS from any
   provider is plenty for a small academy site - just needs Docker
   installed).
2. **Copy this project to the server** and `cd sociomantra`.
3. **Fill in `.env`** with real values - a long random `JWT_SECRET`, a
   strong `DB_PASSWORD`, and `CORS_ORIGINS` set to your real domain(s).
4. **Start it**: `docker compose up --build -d` (the `-d` runs it in the
   background). The backend runs with `SPRING_PROFILES_ACTIVE=prod`
   automatically (set in `docker-compose.yml`), which refuses to start if
   you forgot to change `JWT_SECRET`.
5. **Add HTTPS** - see `frontend/nginx-https.conf.example` for a
   Certbot/Let's Encrypt walkthrough. Until you do this, don't send real
   passwords over the connection (i.e. don't treat it as launched yet).
6. **Change the admin password** (seeded as `admin123` - sign in, go to
   Settings → Security).
7. **Schedule database backups** - see "Backups" in `backend/README.md`.
8. **Verify the health check**: `curl http://localhost:8080/actuator/health`
   should return `{"status":"UP"}`. `docker compose ps` shows each
   service's health status too.

The two projects can also deploy independently instead of via Docker
Compose, if you'd rather host them separately (e.g. frontend on a CDN,
backend on a VM):

- `frontend/` builds to a static site (`npm run build` → `frontend/dist/`)
  hostable anywhere static files are served.
- `backend/` builds to a runnable jar (`mvn clean package` →
  `backend/target/backend.jar`).

In that case, point the frontend's `VITE_API_BASE_URL` at wherever you
deploy the backend, and set `CORS_ORIGINS` on the backend to wherever you
deploy the frontend.

**Scaling beyond one server**: the backend is stateless (JWT-based auth, no
server-side sessions) so you can run multiple instances behind a load
balancer - but first move uploaded files to S3/GCS/Azure Blob (currently
local disk, which isn't shared across instances) and switch the rate
limiter to a shared store (see `backend/README.md`). For a typical single
IAS academy's traffic, one instance is plenty.
