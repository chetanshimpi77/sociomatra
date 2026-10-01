# SocioMantra IAS Academy - Backend

Spring Boot 3 + MySQL REST API for the SocioMantra IAS Academy website.

## Requirements

- Java 21 (JDK)
- Maven 3.9+ (or use your IDE's built-in Maven)
- MySQL 8.x running locally (or update `application.yml` to point elsewhere)

## Getting started (local, without Docker)

1. **Create the database.** The app creates the `sociomantra_db` schema
   automatically (`createDatabaseIfNotExist=true` in the JDBC URL) as long as
   the MySQL user can create databases. Otherwise:

   ```sql
   CREATE DATABASE sociomantra_db CHARACTER SET utf8mb4;
   ```

2. **Set your config** via environment variables:

   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=your_mysql_password
   export JWT_SECRET=change-this-to-something-long-and-random
   export CORS_ORIGINS=http://localhost:5173
   ```

3. **Run it:**

   ```bash
   mvn spring-boot:run
   ```

   Or build and run a jar:

   ```bash
   mvn clean package -DskipTests
   java -jar target/backend.jar
   ```

The API starts on `http://localhost:8080`. On first run, `DataSeeder`
populates the admin account, all 6 courses with curriculum, all 6 faculty
profiles, and default settings.

## Getting started (Docker)

See `../docker-compose.yml` at the project root - it wires up MySQL, this
backend, and the frontend together. From the project root:

```bash
cp .env.example .env   # fill in DB_PASSWORD and JWT_SECRET
docker compose up --build
```

## Default admin login

- **Email:** `admin@sociomantrias.com`
- **Password:** `admin123`

**Change this before going live.** Easiest way: sign in as admin on the
website, go to Settings → Security, and use "Change Password" - it calls
`POST /api/auth/change-password` and requires the current password.

## Configuration reference (`application.yml`)

| Setting | Env var | Default | Purpose |
|---|---|---|---|
| DB username | `DB_USERNAME` | `root` | MySQL user |
| DB password | `DB_PASSWORD` | `root` | MySQL password |
| JWT secret | `JWT_SECRET` | (dev default - **change in production**) | Signs JWTs |
| CORS origins | `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| Upload directory | `UPLOAD_DIR` | `uploads` | Where faculty photos / post images are stored on disk |
| Reset token expiry | `RESET_TOKEN_EXPIRY_MINUTES` | `30` | How long a forgot-password token is valid |
| Expose reset token | `EXPOSE_RESET_TOKEN` | `true` | **Dev only** - see "Password reset" below |
| Rate limit capacity | `RATE_LIMIT_CAPACITY` | `20` | Requests per window per IP on auth + enquiry endpoints |
| Rate limit window | `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window length in seconds |

`spring.jpa.hibernate.ddl-auto` is `update`, so tables are created/updated
automatically from the JPA entities. For a larger production system,
consider switching to Flyway/Liquibase migrations.

## Authentication model

A single `users` table holds both students and admins, distinguished by a
`role` column. Passwords are BCrypt-hashed. Login issues a JWT (24h expiry)
with the user's email and role; the frontend sends it back as
`Authorization: Bearer <token>`.

- `POST /api/auth/student/register` - anyone can create a student account
- `POST /api/auth/student/login` / `POST /api/auth/admin/login` - role-checked logins
- `POST /api/auth/change-password` - **requires a valid JWT** (enforced both by a
  precise Spring Security matcher and a manual check in the controller as a
  second layer); changes the signed-in user's own password (needs current password)
- `POST /api/auth/forgot-password` / `POST /api/auth/reset-password` - see below

Unauthorized requests get a clean JSON `401` (missing/invalid/expired token,
via `RestAuthenticationEntryPoint`) or `403` (valid token, wrong role, via
`RestAccessDeniedHandler`) response instead of a stack trace or a generic
error page - the frontend relies on this distinction to detect "your session
expired" versus "you don't have permission" and react accordingly.

There's intentionally no admin self-registration endpoint - the one admin
account is seeded by `DataSeeder`. Add more admins directly in the database
(with a BCrypt-hashed password), or build an "invite admin" endpoint later.

### Password reset flow (⚠️ read this before production)

`forgot-password` generates a random, SHA-256-hashed, time-limited token
stored in the `password_reset_tokens` table, and `reset-password` consumes
it. **This project does not include an email/SMS provider.** Until you wire
one up:

- With `EXPOSE_RESET_TOKEN=true` (the default, intended for local dev and
  demos), the raw token is returned directly in the API response, and the
  frontend's "Forgot password" page shows it on-screen with a "Continue to
  Reset Password" button, so the whole flow is testable end-to-end without
  email.
- **Set `EXPOSE_RESET_TOKEN=false` before deploying anywhere real** (the
  provided `docker-compose.yml` already defaults to `false`). Then wire real
  email delivery: add `spring-boot-starter-mail`, configure an SMTP provider,
  and replace the `// TODO: send rawToken via email/SMS` comment in
  `AuthService.forgotPassword()` with an actual send call. Until you do that,
  resets will silently generate tokens nobody receives - don't ship it that
  way.

## File uploads

`POST /api/uploads` (admin-only, `multipart/form-data`, field name `file`)
accepts JPG/PNG/WEBP up to 5MB, stores it under the `UPLOAD_DIR` directory
with a random filename, and returns `{ "url": "/uploads/<file>" }`. Files are
served back out publicly at `GET /uploads/**` (see `StaticResourceConfig`).
The frontend's faculty photo and post image fields both use this.

For a multi-instance deployment, move this to S3/GCS/Azure Blob instead of
local disk, since local files won't be shared across instances or survive a
container being recreated - the Docker Compose setup mitigates this for a
single instance with a named volume (`backend_uploads`), but that's not a
substitute for object storage at real scale.

## Rate limiting

A lightweight in-memory filter (`RateLimitFilter`) caps requests per IP
against `/api/auth/*` and the public `POST /api/enquiries` endpoint (default:
20 requests/minute). It returns HTTP 429 with a JSON body when exceeded. This
is suitable for a single backend instance; for multiple instances behind a
load balancer, replace it with a shared store (Redis + Bucket4j, or your
reverse proxy/API gateway's rate limiting).

## Curriculum PDF export

`GET /api/courses/{id}/curriculum/pdf` (public) generates and streams a PDF
of the course description, key features, and Prelims/CSAT/Mains subject
lists using Apache PDFBox - no external service required. The frontend's
"Download Curriculum (PDF)" button calls this directly.

## REST API reference

All endpoints are prefixed with `/api`. **Admin** = requires
`Authorization: Bearer <token>` from an admin login.

### Auth
| Method | Path | Access |
|---|---|---|
| POST | `/auth/student/register` | Public |
| POST | `/auth/student/login` | Public |
| POST | `/auth/admin/login` | Public |
| POST | `/auth/change-password` | Authenticated (student or admin) |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |

### Enquiries
| Method | Path | Access |
|---|---|---|
| GET | `/enquiries` | Admin - unpaginated, dashboard summary cards only |
| GET | `/enquiries/search?status=&q=&page=&size=` | Admin - paginated, searchable, filterable (used by the Student Enquiries table) |
| POST | `/enquiries` | Public (rate-limited) |
| PATCH | `/enquiries/{id}` | Admin - body `{ "status": "In Progress" }` |

### Posts (Blog)
| Method | Path | Access |
|---|---|---|
| GET | `/posts` | Public (published only; add `?all=true` - used by the admin dashboard) |
| GET | `/posts/{id}` | Public |
| POST | `/posts` | Admin |
| PUT | `/posts/{id}` | Admin |
| DELETE | `/posts/{id}` | Admin |

### Courses
| Method | Path | Access |
|---|---|---|
| GET | `/courses` | Public |
| GET | `/courses/{id}` | Public |
| GET | `/courses/{id}/curriculum` | Public |
| GET | `/courses/{id}/curriculum/pdf` | Public - streams a generated PDF |
| POST | `/courses` | Admin |
| PUT | `/courses/{id}` | Admin |
| DELETE | `/courses/{id}` | Admin |

### Faculty
| Method | Path | Access |
|---|---|---|
| GET | `/faculty` | Public |
| GET | `/faculty/{id}` | Public - the tap-through profile page uses this |
| POST | `/faculty` | Admin |
| PUT | `/faculty/{id}` | Admin |
| DELETE | `/faculty/{id}` | Admin |

### Settings
| Method | Path | Access |
|---|---|---|
| GET | `/settings` | Public |
| PUT | `/settings` | Admin |

### Uploads
| Method | Path | Access |
|---|---|---|
| POST | `/uploads` | Admin - `multipart/form-data`, field `file` |

## Database schema (auto-created by Hibernate)

- **users** - id, name, email (unique), phone, password (BCrypt hash), role, created_at
- **password_reset_tokens** - id, user_id (FK), token_hash (unique), expires_at, used, created_at
- **enquiries** - id, name, phone, email, course, source, message, status, enquiry_date
- **posts** - id, title, excerpt, content, tag, author, image_url, published, created_at
- **courses** - id (slug, e.g. `foundation`), name, tagline, duration, mode, subjects, hours, description, color, key_features
- **curriculum_subjects** - id, course_id (FK), section (`PRELIMS`/`CSAT`/`MAINS`), name, order_index, total_chapters, total_hours
- **faculty** - id, name, subject, experience, qualification, photo_url, email, bio, subjects_taught, achievements
- **academy_settings** - single row (id=1): academy_name, phone, email, address, facebook/youtube/instagram/telegram/linkedin_url, seo_title, seo_description, hero_headline, hero_subheadline

## Project structure

```
src/main/java/com/sociomantra/backend/
  config/       SecurityConfig, DataSeeder, StaticResourceConfig
  security/     JwtUtil, JwtAuthFilter, CustomUserDetailsService, RateLimitFilter
  entity/       JPA entities
  repository/   Spring Data JPA repositories
  dto/          Request/response DTOs (grouped by feature)
  service/      Business logic (incl. FileStorageService, PdfService)
  controller/   REST controllers
  exception/    ApiException, ResourceNotFoundException, GlobalExceptionHandler
src/test/java/com/sociomantra/backend/
  service/      AuthServiceTest, EnquiryServiceTest (JUnit 5 + Mockito)
```

## Running the tests

```bash
mvn test
```

Covers `AuthService` (registration, login role-checking, password change,
forgot-password's no-account-leak behavior) and `EnquiryService` (status
mapping, validation, not-found handling) using Mockito - no real database
needed. This is a starting point, not full coverage; add controller-level
`@WebMvcTest`/`@SpringBootTest` tests as the app grows.

## Connecting the frontend

The frontend's `src/services/api.js` expects this API at `VITE_API_BASE_URL`
(defaults to `/api`, proxied to `http://localhost:8080` in dev). Uploaded
files are expected at `/uploads/**` on the same host (also proxied in dev -
see the frontend's `vite.config.js`).

## What's already handled for production

- **Concurrency correctness**: every write operation runs inside a proper
  `@Transactional` boundary (multi-step writes like password reset commit
  atomically or not at all); the password-reset token is claimed via an
  atomic `UPDATE ... WHERE used = false` so two simultaneous reset attempts
  with the same token can't both succeed (closes a real race condition).
  The backend is stateless (JWT, no server-side session), so it's safe to
  run multiple instances behind a load balancer once uploads move off local
  disk (see below).
- **Connection pooling**: HikariCP is explicitly tuned (`DB_POOL_MAX_SIZE`,
  default 10) rather than left on defaults that could exhaust MySQL's
  connection limit under concurrent load.
- **Health checks**: `GET /actuator/health` (nothing else from Actuator is
  exposed - see `application.yml`) backs the Docker healthcheck and is
  ready for a load balancer/uptime monitor to poll.
- **Graceful shutdown**: `server.shutdown: graceful` lets in-flight requests
  finish (up to 20s) instead of being cut off on redeploy/restart.
- **Startup safety check**: the app refuses to start with `SPRING_PROFILES_ACTIVE=prod`
  if `JWT_SECRET` is still the default dev value (see `StartupSecurityChecks`).
- **Clean error responses**: no stack traces or internal messages ever reach
  the client, whether the error comes from a controller
  (`GlobalExceptionHandler`), from Spring Security (`RestAuthenticationEntryPoint`/`RestAccessDeniedHandler`),
  or anywhere else (`server.error.include-*: never`).
- **Rate limiter cleanup**: a scheduled task evicts stale IP entries every
  10 minutes so the in-memory limiter can't grow unbounded over the app's
  uptime.
- **Validation on both create and update**: required fields (course name,
  faculty name/subject, post title/content) are enforced with `@Valid` on
  every write endpoint, not just creation.
- **Pagination**: `GET /api/enquiries/search` is paginated and filtered at
  the database level (not loaded into memory and sliced), so the admin
  table stays fast as enquiry volume grows.
- **Log rotation**: file logging with size/age-based rotation is configured
  out of the box (`logging.file.name`, `logging.logback.rollingpolicy.*`).
- **Production Spring profile**: `SPRING_PROFILES_ACTIVE=prod` (already set
  by `docker-compose.yml`) tightens logging verbosity and defaults
  `EXPOSE_RESET_TOKEN` to `false`.
- **DB backup script**: `scripts/backup-db.sh` for scheduled `mysqldump`
  backups with automatic rotation (see "Backups" below).

## What still needs YOUR infrastructure choices

These genuinely can't be done for you from inside this project - they
depend on a real domain, real server, and real accounts:

- [ ] **Change `JWT_SECRET`** to a long random value (the app will refuse to
      start under the `prod` profile until you do - see above)
- [ ] **Change the seeded admin password** (Settings → Security once logged in)
- [ ] **Wire real email sending** for password reset and set
      `EXPOSE_RESET_TOKEN=false` (already the `prod` profile default) - see
      "Password reset flow" above
- [ ] **Put the app behind HTTPS** - see `frontend/nginx-https.conf.example`
      for a Certbot/Let's Encrypt-based example. This app doesn't terminate
      TLS itself.
- [ ] **Point your real domain** at the server and update `CORS_ORIGINS`
      accordingly
- [ ] **Schedule the backup script** (see "Backups" below) and actually test
      restoring from a backup at least once
- [ ] Move uploaded files to S3/GCS/Azure Blob if you'll run more than one
      backend instance (local disk isn't shared across instances)
- [ ] Consider a shared (Redis-backed) rate limiter if you run multiple
      backend instances (the current one is per-instance, in-memory)
- [ ] Adopt Flyway/Liquibase migrations if multiple developers will be
      changing the schema concurrently - `schema-reference.sql` is a ready
      starting point for a `V1` baseline; `ddl-auto: update` (the current
      default in both profiles) is deliberately kept since it's the
      lower-risk, proven-working option for a single-admin site
- [ ] Expand automated test coverage (controller-level `@WebMvcTest`,
      integration tests against a real/Testcontainers MySQL)

## Google Sign-In setup

Students can sign in/up with "Continue with Google" instead of a password.
To enable it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs &
   Services > Credentials > Create Credentials > OAuth client ID.
2. Application type: **Web application**.
3. Authorized JavaScript origins: add your frontend's URL(s), e.g.
   `http://localhost:5173` for dev and `https://www.yourdomain.com` for prod.
4. Copy the generated Client ID.
5. Set it in **both** places (same value):
   - Backend: `GOOGLE_CLIENT_ID` env var (validates the token's audience).
   - Frontend: `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` (renders the button).
6. Restart both services. The button only appears when the frontend env var
   is set - leave it blank to keep Google sign-in disabled.

Accounts created via Google are STUDENT accounts only (matched/created by
email) and get a random, never-shown password under the hood - the person
can still use "forgot password" later if they ever want a password-based
login too.

## Real email delivery for password reset

By default (`MAIL_ENABLED=false`), forgot-password falls back to dev mode
(token shown on screen - see "Password reset flow" above). To actually send
reset emails:

1. **Easiest: Gmail with an App Password** (requires 2-Step Verification
   enabled on the Google account):
   - Go to [Google Account > Security > App Passwords](https://myaccount.google.com/apppasswords).
   - Generate one for "Mail", copy the 16-character password.
   - Set: `MAIL_ENABLED=true`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`,
     `MAIL_USERNAME=youraddress@gmail.com`, `MAIL_PASSWORD=<app password>`.
2. **Alternative**: any transactional email provider (SendGrid, Mailgun,
   Amazon SES, etc.) - they all give you an SMTP host/port/username/password
   to drop into the same four env vars.
3. Set `FRONTEND_URL` to your real site URL so the emailed link points
   somewhere real, e.g. `FRONTEND_URL=https://www.yourdomain.com`.
4. Restart the backend. Test by using "Forgot password" on the site - you
   should receive a real email instead of seeing the token on screen.

There's no SMS option built in (a reset-via-text-message channel) - that
needs a paid provider account (e.g. Twilio) this project can't set up for
you. `EmailService` is a small, self-contained class; an `SmsService`
following the same pattern (inject the Twilio SDK client, send in
`AuthService.forgotPassword()` alongside or instead of email) would be a
reasonably small addition later if you want it.

## Backups

```bash
DB_PASSWORD=yourpassword ./scripts/backup-db.sh /path/to/backup/dir
```

Add to crontab for a nightly 2am backup, keeping 14 days by default:

```
0 2 * * * DB_PASSWORD=yourpassword /path/to/backend/scripts/backup-db.sh /path/to/backups >> /var/log/sociomantra-backup.log 2>&1
```

`schema-reference.sql` documents the exact schema if you ever need to
restore to a fresh MySQL instance by hand.
