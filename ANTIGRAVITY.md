# ANTIGRAVITY.md

## Project Overview

Full-stack personal developer portfolio with a self-service administrative control panel.

- **Frontend**: **Angular 20 (SSR)** standalone architecture, **Tailwind CSS v4**, **Angular Material** (CDK, SnackBar, Paginator, Datepicker), and **Lucide Angular** icons.
- **Backend**: **Express 5 (ESM)** REST API with **MongoDB / Mongoose**, **Multer + Cloudinary** media uploads, **Nodemailer** contact notifications, and **JWT** admin authentication.

All portfolio content (profile, about, skills, experience, education, projects, articles, contact messages, and FAQs) is stored in MongoDB and managed via the `/admin` portal.

---

## 1. Directory Structure & Quick Commands

```
portfolio-root/
├── backend/                  # Express 5 REST API ("type": "module")
│   ├── config/               # db.js, cloudinary.js
│   ├── controllers/          # Resource controllers
│   ├── middleware/           # auth.middleware.js, upload.js
│   ├── models/               # Mongoose schemas & models
│   ├── routes/               # Express route definitions
│   ├── utils/                # queryFilters.js, slug.js, emails/
│   └── server.js             # Entry point (:5000)
├── frontend/                 # Angular 20 Standalone SSR Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/        # Admin portal (dashboard, pages, components, layout)
│   │   │   ├── components/   # Public sections (hero, about, skills, footer, loaders)
│   │   │   ├── core/         # Guards, interceptors, services
│   │   │   ├── models/       # TypeScript interfaces & API models
│   │   │   ├── pages/        # Public pages (home, projects, articles, contact)
│   │   │   ├── pipes/        # timeAgo, truncate, safeHtml
│   │   │   ├── shared/       # Reusable UI (data-table, filter-drawer, buttons, markdown-toolbar/-preview)
│   │   │   ├── utils/        # Pure helpers: filter, code-highlight, slug, jwt (*.utils.ts)
│   │   │   ├── app.config.ts # Providers, router, Lucide icon registry
│   │   │   └── app.routes.ts # App routing definition
│   │   ├── styles.css        # Tailwind v4 import & custom properties
│   │   └── main.ts           # Client bootstrap
│   └── angular.json
├── ANTIGRAVITY.md            # Antigravity agent guide & reference map
├── CLAUDE.md                 # Claude reference map
└── README.md                 # Project README
```

### Dev Commands

```bash
# Backend (Port 5000)
cd backend && npm run dev

# Frontend (Port 4200)
cd frontend && npm start

# Frontend Production Build (Browser + SSR bundles into dist/)
cd frontend && npm run build

# Windows PowerShell note:
# If script execution is restricted for npm, execute via cmd:
cmd.exe /c "npm run build"
```

### Environment Configuration

`backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
```

`frontend/src/environments/`:

- `environment.ts`: Points to `http://localhost:5000/api` for local development.
- `environment.prod.ts`: Points to production Render API URL (`fileReplacements` in `angular.json`).

---

## 2. Backend Architecture & Conventions

### Resource 3-File Pattern

Every API resource strictly follows a uniform 3-file pattern:

| Resource             | Base Endpoint      | Router File                          | Controller File                                | Model File                                           |
| -------------------- | ------------------ | ------------------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| **Admin (Auth)**     | `/api/admin`       | `backend/routes/admin.route.js`      | `backend/controllers/admin.controller.js`      | `backend/models/admin.model.js`                      |
| **Profile & Resume** | `/api/profile`     | `backend/routes/profile.route.js`    | `backend/controllers/profile.controller.js`    | `backend/models/profile.model.js`, `resume.model.js` |
| **About**            | `/api/about`       | `backend/routes/about.route.js`      | `backend/controllers/about.controller.js`      | `backend/models/about.model.js`                      |
| **Skills**           | `/api/skills`      | `backend/routes/skills.route.js`     | `backend/controllers/skills.controller.js`     | `backend/models/skills.model.js`                     |
| **Experiences**      | `/api/experiences` | `backend/routes/experience.route.js` | `backend/controllers/experience.controller.js` | `backend/models/experience.model.js`                 |
| **Educations**       | `/api/educations`  | `backend/routes/education.route.js`  | `backend/controllers/education.controller.js`  | `backend/models/education.model.js`                  |
| **Projects**         | `/api/projects`    | `backend/routes/project.route.js`    | `backend/controllers/project.controller.js`    | `backend/models/project.model.js`                    |
| **Articles**         | `/api/articles`    | `backend/routes/article.route.js`    | `backend/controllers/article.controller.js`    | `backend/models/article.model.js`                    |
| **Contacts**         | `/api/contacts`    | `backend/routes/contact.route.js`    | `backend/controllers/contact.controller.js`    | `backend/models/contact.model.js`                    |
| **FAQs**             | `/api/faqs`        | `backend/routes/faq.routes.js`       | `backend/controllers/faq.controller.js`        | `backend/models/faq.model.js`                        |
| **Comments**         | `/api/comments`    | `backend/routes/comment.route.js`    | `backend/controllers/comment.controller.js`    | `backend/models/comment.model.js`                    |

### Controller & Response Rules

- Top-level `try/catch` per controller function returning JSON with explicit HTTP status codes (`res.status(200).json(...)`).
- Projects & Articles: Read/query by `slug`, mutations (update/delete) by MongoDB `_id`.
- Singletons (`profile`, `about`): Single document retrieved with `findOne()`.
- Search & Pagination Envelopes: `/api/projects` and `/api/articles` return `{ items: [...], total, page, limit, totalPages, filters: { ... } }`.
- Multer Cloudinary storage writes to `portfolio/<resource>` folders.
- Article engagement: `POST /api/articles/:slug/view` and `/like` bump the `views` / `likes`
  counters (likes are remembered per browser in `localStorage`, not per user). Comments are
  anonymous, publish immediately, and nest one level deep — `GET /api/comments?article=<id|slug>`
  returns the thread (emails stripped for non-admin callers), `GET /api/comments` with no
  article is the admin-only moderation list, and `PUT` / `DELETE /api/comments/:id` are
  admin-only — the delete removes the comment's replies too.
- Realtime: socket.io is attached to the HTTP server (`backend/config/socket.js`), so `server.js`
  uses `createServer(app)` + `server.listen`. Comment writes broadcast `comments:changed`
  `{ articleId }`; the Angular `SocketService` listens browser-only and the comments component
  refetches when the id matches its own article.

---

## 3. Frontend Architecture & Rules

### Core Development Principles

1. **Standalone Components**: No `NgModules`. All components declare their explicit `imports: [...]`.
2. **Signals for State**: Use `signal()`, `computed()`, and `linkedSignal()` for state management.
3. **Modern Control Flow**: Always use `@if`, `@else`, `@for (item of list; track item.id)` syntax instead of legacy `*ngIf` / `*ngFor`.
4. **Dependency Injection**: Use `inject()` in field initializers (e.g. `private http = inject(HttpClient)`). Avoid constructor parameter injection.
5. **Subscription Lifecycle**: Clean up subscriptions using `DestroyRef`:
   ```ts
   private destroyRef = inject(DestroyRef);
   // ...
   this.destroyRef.onDestroy(() => sub.unsubscribe());
   ```
6. **SSR & Browser Safety**: Code referencing `window`, `document`, `localStorage`, or `performance` **must** be guarded:
   ```ts
   private platformId = inject(PLATFORM_ID);
   if (isPlatformBrowser(this.platformId)) {
     // safe browser access
   }
   ```
7. **Lucide Icons**:
   - **Important**: Any Lucide icon used in a template must be imported from `lucide-angular` and added to `LucideAngularModule.pick({...})` in [app.config.ts](frontend/src/app/app.config.ts).
   - Wrap `<lucide-icon>` inside a positioned `<span>` wrapper rather than applying positioning classes directly to the icon tag to avoid duplicate class rendering.

---

## 4. Admin Management Center (`/admin`)

The Admin section provides complete control over portfolio content:

- **Dashboard (`/admin/dashboard`)**:
  - Greeting hero with live operational indicator and quick actions (`+ Add Project`, `+ New Article`, `Refresh`, `Live Site ↗`).
  - 6 Key Metric Cards: Projects, Articles, Inquiries, Skills Stack, Career Milestones, and FAQs.
  - Recent Inquiries Live Feed with optimistic 1-click **Mark as Read**.
  - Recent Projects & Articles showcase cards with direct edit links.
  - Portfolio Setup Completeness Score & Checklist.
  - Project Category Distribution bars.
  - Quick Management Hub shortcuts.
- **Profile (`/admin/profile`)**: Manage hero gradient text, heading, introduction, bio, picture, resume, skills, experience, and education.
- **Projects (`/admin/projects`)**: List with search/filter drawer, creation form (`/add`), edit form (`/edit/:slug`), and detail preview (`/:slug`).
- **Articles (`/admin/articles`)**: Blog article manager with rich formatting, tags, published state, and reading time.
- **Contacts (`/admin/contacts`)**: View and manage visitor submissions from the contact form.
- **FAQs (`/admin/faqs`)**: Manage client frequently asked questions and display order.

---

## 5. Styling & Theme System

- **Tailwind CSS v4**: Loaded via `@import 'tailwindcss'` in [styles.css](frontend/src/styles.css).
- **Dark Mode**: Configured via `@custom-variant dark (&:where(.dark-theme, .dark-theme *))` toggled on `<html>`.
- **Z-Index Layering**:
  - Navbar: `999`
  - Mobile Menu: `1000`
  - Filter Drawer Backdrop: `1300`
  - Filter Drawer Panel: `1310`
  - Overlay Container (Popups, Datepickers, SnackBar): `1400`
  - Loaders: `9999` / `99999`
