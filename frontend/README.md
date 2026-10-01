# SocioMantra IAS Academy - Frontend

React + Vite + Tailwind CSS frontend for SocioMantra IAS Academy. Talks to
the real **Spring Boot + MySQL backend** (`../backend`) - there is no
mock/localStorage data layer. Every page is dynamic and every admin action
(add, edit, delete, upload) is wired to a real API call.

## What's included

**Public website**
- Home (hero headline/subheadline editable from Settings → Website)
- About
- Courses (listing, from the database)
- Curriculum (Prelims / Mains / Subject-wise / Weekly Plan tabs, fetched live, with a working "Download Curriculum (PDF)" button)
- Faculty - **tap any faculty card to open their full profile page**, fetched by id
- Blog (listing + detail, fetched by id)
- Contact / Enroll Now (submit real enquiries to the backend)

**Authentication**
- Student Sign Up / Sign In
- Admin Sign In
- Forgot Password / Reset Password (see the note in `../backend/README.md`
  about email delivery not being wired up yet - the dev flow works
  end-to-end via an on-screen token)

**Admin dashboard** (protected, requires a real admin JWT)
- Dashboard overview (live stats + recent enquiries)
- Student Enquiries (server-side search/filter/pagination, view detail, update status - stays fast as enquiry volume grows)
- Posts & Content - **create, edit, delete**, with a real image upload (drag-and-drop or click), draft/publish toggle
- Manage Courses - **add, edit, delete** courses
- Faculty - **add, edit, delete** faculty profiles, with real photo upload
- Settings - General / Email / Social Media / **Website** (SEO + homepage hero copy) / **Security** (change password)

## Getting started

Requires [Node.js](https://nodejs.org) 18+ and the backend running first
(see `../backend/README.md`) - otherwise pages will show "Cannot reach the
server" errors.

```bash
npm install
cp .env.example .env   # defaults to /api, proxied to the backend - usually no edits needed
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev proxy in
`vite.config.js` forwards both `/api/*` and `/uploads/*` requests to
`http://localhost:8080`, so uploaded faculty photos/post images render
correctly in dev too.

To build for production:

```bash
npm run build
npm run preview   # preview the production build locally
```

Before deploying, set `VITE_API_BASE_URL` to your deployed backend's URL. If
you deploy behind the provided Docker/Nginx setup, `/api` and `/uploads` are
reverse-proxied to the backend automatically and you can leave it as `/api`.

## Demo login

- **Admin:** `admin@sociomantrias.com` / `admin123` (seeded automatically -
  change it from Settings → Security once you're in)
- **Student:** create your own account via Sign Up

## Project structure

```
src/
  components/     Navbar, Footer, AdminLayout, AuthLayout, ImageUpload,
                  ErrorBoundary (catches render crashes), PageTitle (sets
                  document.title per route), ProtectedRoute/PublicOnlyRoute, icons
  context/        AuthContext - signed-in user + JWT
  pages/          Public pages
  pages/auth/     Sign in / sign up / forgot / reset password
  pages/admin/    Admin dashboard pages (full CRUD)
  services/api.js Single data-access layer - every fetch() call goes through here
```

## Authentication architecture

Students and admins are **two completely independent identities**, each
stored under its own `localStorage` key (`sm_student_session` /
`sm_admin_session`) with its own JWT. You can be signed in as both at once
in the same browser - signing into one never overwrites or logs out the
other, and refreshing `/login` or `/admin/login` always shows the correct,
consistent state for that role.

This matters because of a real bug that existed earlier: both roles used to
share a single `sm_session` key, so whichever role logged in most recently
silently overwrote the other's session - refreshing a page could appear to
"flip" between admin and student state depending on what you'd logged into
last, anywhere in the browser. That's fixed by the per-role keys above.

Two route guards enforce this:
- **`ProtectedRoute`** (`src/components/ProtectedRoute.jsx`) - wraps
  `/admin/*` pages; redirects to `/admin/login` if no valid admin session
  exists.
- **`PublicOnlyRoute`** (`src/components/PublicOnlyRoute.jsx`) - wraps
  `/login`, `/signup`, `/admin/login`; if that role is already signed in, it
  redirects straight to the right place instead of re-showing the form.

Tokens carry their own expiry (`exp` claim); `api.js` decodes and checks it
client-side before ever treating a stored session as valid, and if the
backend ever rejects a token as expired/invalid (401/403) mid-session,
`api.js` clears that role's session and fires a `sm:session-expired` event
that `AuthContext` listens for, so the UI reflects "signed out" immediately
rather than after the next full reload.

## How the frontend talks to the backend

`src/services/api.js` is the **only** file that calls `fetch()`. It attaches
`Authorization: Bearer <token>` automatically for calls that need it (each
one specifies `authRole: 'ADMIN'` or omits it for public/self-service
calls), and throws a normal `Error` with the backend's message on failure
(every form already shows this inline).

File uploads (`uploadFile`) POST a `FormData` with the image to
`/api/uploads` and return the stored URL, which is then saved as
`photoUrl`/`imageUrl` on the faculty/post record - see
`src/components/ImageUpload.jsx` for the reusable widget both admin forms
use.

If you add a new page backed by a new endpoint, add one function to
`api.js` rather than calling `fetch()` from the page directly, to keep auth
headers and error handling consistent. See `../backend/README.md` for the
full endpoint list.
