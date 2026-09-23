# CLAUDE.md

Personal portfolio site with a self-service admin panel. **Angular 20 (SSR) frontend** +
**Express 5 / MongoDB REST API**. All page content (profile, about, skills, experience,
education, projects, articles, FAQs) is stored in MongoDB and edited through `/admin`.

This file is a **project map** — use it to jump straight to the right files instead of
re-scanning the tree.

[ANTIGRAVITY.md](ANTIGRAVITY.md) is a second, differently-worded map of the same repo for
another agent tool. It is **not** kept in sync with this file — trust this one.

---

## 1. Repo layout & commands

```
backend/     Express 5 + Mongoose, ESM ("type": "module")
frontend/    Angular 20 standalone app, SSR, Tailwind v4 + Angular Material
```

```bash
cd backend  && npm run dev     # nodemon server.js  → :5000
cd frontend && npm start       # ng serve           → :4200
cd frontend && npm run build   # ng build (browser + SSR bundles into dist/)
cd frontend && npm test        # karma/jasmine — specs are unmodified CLI scaffolds
cd frontend && npm run mobile:sync   # build + copy into the Capacitor Android project (§6)
```

There is **no linter and no real test suite**. Backend `npm test` is a stub that exits 1.
Prettier config lives in [frontend/package.json](frontend/package.json) (100 cols, single
quotes, `angular` parser for HTML). Backend files use double quotes.

**Env vars** (`backend/.env`): `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER`,
`EMAIL_PASS`.

Deploy: frontend → Vercel ([frontend/vercel.json](frontend/vercel.json) rewrites all paths to
`index.csr.html`), backend → Render.

---

## 2. Backend

Entry: [backend/server.js](backend/server.js) — loads dotenv, `express.json()`, CORS
(`CLIENT_URL`, `http://localhost:4200`, plus the Capacitor origins — see §6), mounts routers,
then `connectDB()` before `listen`.

### Resource pattern

Every resource is exactly three files with matching names; **follow this when adding one**:

| Resource | Mount | Route | Controller | Model |
|---|---|---|---|---|
| admin (auth) | `/api/admin` | [admin.route.js](backend/routes/admin.route.js) | [admin.controller.js](backend/controllers/admin.controller.js) | [admin.model.js](backend/models/admin.model.js) |
| about | `/api/about` | [about.route.js](backend/routes/about.route.js) | [about.controller.js](backend/controllers/about.controller.js) | [about.model.js](backend/models/about.model.js) |
| profile + resume | `/api/profile` | [profile.route.js](backend/routes/profile.route.js) | [profile.controller.js](backend/controllers/profile.controller.js) | [profile.model.js](backend/models/profile.model.js), [resume.model.js](backend/models/resume.model.js) |
| skills | `/api/skills` | [skills.route.js](backend/routes/skills.route.js) | [skills.controller.js](backend/controllers/skills.controller.js) | [skills.model.js](backend/models/skills.model.js) |
| experiences | `/api/experiences` | [experience.route.js](backend/routes/experience.route.js) | [experience.controller.js](backend/controllers/experience.controller.js) | [experience.model.js](backend/models/experience.model.js) |
| educations | `/api/educations` | [education.route.js](backend/routes/education.route.js) | [education.controller.js](backend/controllers/education.controller.js) | [education.model.js](backend/models/education.model.js) |
| projects | `/api/projects` | [project.route.js](backend/routes/project.route.js) | [project.controller.js](backend/controllers/project.controller.js) | [project.model.js](backend/models/project.model.js) |
| articles | `/api/articles` | [article.route.js](backend/routes/article.route.js) | [article.controller.js](backend/controllers/article.controller.js) | [article.model.js](backend/models/article.model.js) |
| contacts | `/api/contacts` | [contact.route.js](backend/routes/contact.route.js) | [contact.controller.js](backend/controllers/contact.controller.js) | [contact.model.js](backend/models/contact.model.js) |
| faqs | `/api/faqs` | [faq.routes.js](backend/routes/faq.routes.js) | [faq.controller.js](backend/controllers/faq.controller.js) | [faq.model.js](backend/models/faq.model.js) |
| comments | `/api/comments` | [comment.route.js](backend/routes/comment.route.js) | [comment.controller.js](backend/controllers/comment.controller.js) | [comment.model.js](backend/models/comment.model.js) |
| notifications | `/api/notifications` | [notification.route.js](backend/routes/notification.route.js) | [notification.controller.js](backend/controllers/notification.controller.js) | [notification.model.js](backend/models/notification.model.js) |

[backend/routes/upload.route.js](backend/routes/upload.route.js) and
[upload.controller.js](backend/controllers/upload.controller.js) are **fully commented out and
unmounted** — uploads happen inline on each resource route. Ignore them.

### Schema fields (all have `timestamps: true`)

- **Admin** `name, email, password` (bcrypt-hashed) — single admin user, no signup endpoint.
- **Profile** `imageUrl, heroGradientText, heroHeading, introduction, profileDescription` — a
  singleton doc. **Resume** `resumeUrl`.
- **About** `description, email, location, images[]` (up to 4) — also a singleton (upsert).
- **Skills** `name, imageUrl, websiteUrl, category, percentage` (0–100; edited in the admin
  skills form, but **not displayed on the public site** — see §7)
- **Experience** `company, role, years` · **Education** `school, degree, years`
- **Project** `title, slug, projectDate, overview, description, category, projectCardImage,
  image, technologies[], liveUrl, githubUrl`
- **Article** `title, slug, excerpt, content, image, tags[], published, estimatedReadingTime,
  views, likes` (the last two are counters, never edited in the article form)
- **Comment** `article` (ref Article), `parent` (ref Comment, `null` for a top-level comment),
  `name, email, message, isAuthor`
- **Contact** `firstName, lastName, email, subject, message, isRead`
- **FAQ** `question, answer, isActive, order`
- **Notification** `type` (`like`/`comment`/`contact`), `title, message, link` (admin route to open), `isRead`

### Auth

[backend/middleware/auth.middleware.js](backend/middleware/auth.middleware.js) — default export
`protectAdmin`. Reads `Authorization: Bearer <token>`, verifies against `JWT_SECRET`, loads the
admin (minus password) into `req.admin`, else 401.

⚠️ **Auth coverage is inconsistent.** Protected: about, contacts, projects, articles (mutations
only), `admin/profile`. **Unprotected mutations**: all of `skills`, `experiences`, `educations`,
`faqs`, and `profile` (including `PUT /` and image/resume upload). If you touch those routes,
adding `protectAdmin` is almost certainly the intended fix.

### Uploads

[backend/middleware/upload.js](backend/middleware/upload.js) exports per-resource multer
instances (`uploadProject`, `uploadProfile`, `uploadSkill`, `uploadArticle`) backed by
`CloudinaryStorage` writing to `portfolio/<resource>` folders, formats jpg/jpeg/png/webp.
Cloudinary client: [backend/config/cloudinary.js](backend/config/cloudinary.js).
Projects use `.fields([projectCardImage, image])`; about uses `.array("images", 4)`; the rest
use `.single("image")`.

### Controller conventions

- Plain `async (req, res)` with a top-level `try/catch`; each returns JSON and its own status.
  There is **no shared error-handling middleware** — don't `throw`, respond directly.
- Projects/articles: read by **`slug`**, update/delete by **`_id`**. Slugs are generated and
  de-duplicated by local `generateSlug` / `createUniqueSlug` helpers at the top of
  [project.controller.js](backend/controllers/project.controller.js) and
  [article.controller.js](backend/controllers/article.controller.js).
- Singletons (profile, about) use `findOne()` / `deleteMany()`+`create` rather than ids.
- Contact form: `createContact` is public and fires
  [sendContactMail](backend/utils/emails/sendMail.js) (nodemailer, templates in
  [emailTemplates.js](backend/utils/emails/emailTemplates.js)) to `EMAIL_USER`.

### Article engagement (views, likes, comments)

Readers have no accounts, so everything here is anonymous and public:

- `POST /api/articles/:slug/view` (`registerArticleView`) `$inc`s `views` and answers
  `{ views }`. The public page fires it **browser-only** (an SSR render must not count a read)
  and only once per article per browser — the slugs already counted are kept in `localStorage`
  under `viewedArticles`, otherwise every refresh inflates the number.
- `POST /api/articles/:slug/like` (`toggleArticleLike`) takes `{ liked: boolean }`, `$inc`s by
  ±1 and floors the counter at 0. "Who liked what" lives only in the visitor's `localStorage`
  (`likedArticles`), so likes are per-browser, not per-person.
- `POST /api/articles/:slug/reset-stats` (`resetArticleStats`, **`protectAdmin`**) zeroes both
  counters — `{ views: false }` / `{ likes: false }` in the body keeps one of them. It backs the
  "Clear" button on the admin article detail page. Visitors' `likedArticles` entries survive the
  reset, so a reader who liked before can only unlike (floored at 0) afterwards.
- Comments: `GET /api/comments?article=<id|slug>` returns `{ items, total }` where `items` is a
  **thread** — top-level comments each carrying a `replies[]` array (`buildThread`). The query
  sorts oldest-first so replies read in order, then `buildThread` reverses the top level so the
  newest comment leads. Without the
  param it returns every comment, newest first, with `article` populated — that is the
  moderation view, so it **401s unless the request carries an admin token**. `POST /` is public;
  `PUT /:id` (edit the message) and `DELETE /:id` are `protectAdmin`, and the delete removes the
  comment **and its replies**. Replies are capped at one level: replying to a reply re-parents to
  its parent.
- The commenter's email is **stripped from the response** (`withoutEmail`) unless the caller is
  the admin — the form promises it is never shown, so it must not reach a reader's browser at
  all, not merely go unrendered.
- The "Author" badge needs **both** `isAuthor: true` in the body (sent only by
  `<app-article-comments [isAdmin]="true">`) **and** a valid admin token (`adminFromRequest`) —
  the flag alone buys nothing. Posting from the public page while logged into admin is therefore
  an ordinary comment, and an author comment is stored under the **admin's own `name`**, which
  overrides whatever name the client sent.
- Comments post immediately — there is no approval queue.
- **Live updates (socket.io).** [config/socket.js](backend/config/socket.js) attaches socket.io to
  the HTTP server — `server.js` therefore wraps the app in `createServer(app)` and calls
  `server.listen`, **not** `app.listen`; the socket CORS list is the same `allowedOrigins` array.
  Create / update / delete each call `emitCommentsChanged(articleId)`, which broadcasts
  `comments:changed` with `{ articleId }` (a no-op when sockets aren't running, so scripts and
  tests can import the controller).
  [socket.service.ts](frontend/src/app/core/services/socket.service.ts) holds one lazy
  connection — `on<T>(event)` returns an Observable and yields nothing on the server, so SSR
  never opens a socket. The URL is `environment.apiUrl` minus the trailing `/api`.
  ⚠️ `<app-article-comments>` must be given the article **`_id`**, not the slug, or the event
  won't match and the thread won't live-refresh. Live refreshes call `load(true)`, which skips
  the loading skeleton so the list updates in place.

### Admin notifications (bell)

- `notify({ type, title, message, link })` in
  [notification.controller.js](backend/controllers/notification.controller.js) is called by
  `toggleArticleLike` (an unlike calls `unnotify`, which deletes that article's newest like
  notification and pushes `notification:removed` so the bell drops it live), `createComment` (skipped for author comments)
  and `createContact`. It never throws, so a failed notification can't fail the visitor's request.
- It saves the doc and pushes `notification:new` with `emitToAdmin` — to the socket.io
  **`admins` room only**, never a broadcast, because the payload carries visitors' names and
  messages. A socket joins by emitting `admin:join` with its JWT (checked by `adminFromToken`);
  [socket.service.ts](frontend/src/app/core/services/socket.service.ts) `joinAdmin()` re-sends it
  on every reconnect, and `leaveAdmin()` runs on logout.
- All REST routes are `protectAdmin`: `GET /` → `{ items (latest 30), unreadCount }`,
  `?all=true` drops the limit (the notifications page), `PATCH /:id/read`, `PATCH /read-all`,
  `DELETE /:id`, `DELETE /` (clear all).
- UI state lives in **one store**, [notification.service.ts](frontend/src/app/core/services/notification.service.ts)
  (an exception to "services are thin HTTP"): `notifications` / `unreadCount` / `latest` signals,
  `connect(token)` (joins the admin room and starts the live feed once), `load(all?)` and
  optimistic `markRead` / `markAllRead` / `remove` / `clearAll`. The badge is adjusted, never
  recounted (the bell loads only 30), and a late 30-row load never trims an `all` load.
  Type labels/icons/badges are `NOTIFICATION_TYPES` in `notification.model.ts`.
- Both views just read the store: [admin-notifications](frontend/src/app/admin/components/admin-notifications/)
  (bell left of the avatar in `admin-header`, shows the first 30, "See all notifications" →
  `/admin/notifications`) and
  [admin-notification-list](frontend/src/app/admin/pages/notifications-admin/admin-notification-list/)
  (`app-data-table` with type/status/date filters, view / mark-read / delete actions, "Mark all
  read" primary button). Neither subscribes to the socket itself.

### Searchable list endpoints (projects, articles)

`GET /api/projects` and `GET /api/articles` do search / filter / count / pagination server-side
and answer with an envelope, **not a bare array**:

```jsonc
{ "items": [...], "total": 23, "page": 1, "limit": 4, "totalPages": 6,
  "filters": { "categories": [{ "value": "angular", "label": "Angular", "count": 3 }], ... } }
```

- Shared param helpers: [backend/utils/queryFilters.js](backend/utils/queryFilters.js)
  (`parseList`, `anyOfRegex`, `buildDateRange`, `parsePagination`, `totalPages`, `isTrue`).
  List params accept `a,b` or repeated keys; string matches are case-insensitive regexes with
  the input escaped; date bounds are UTC (`buildDateRange` uses `setUTCHours`, so `…To` covers
  the whole UTC day regardless of server timezone).
- Projects: `search, category, technology, dateFrom, dateTo, createdFrom, createdTo, page,
  limit, sort, countOnly`. Articles: `search, tag, readingTime, createdFrom, createdTo,
  published, page, limit, sort, countOnly`.
- `filters` keys differ per resource: projects → `categories` + `technologies`, articles →
  `tags` + `readingTimes`. Facets are `$group` aggregations over the **whole collection** (not
  the current query) so the drawer can show every option with its count. `value` is lower-cased
  (it is what the client sends back); `label` keeps the original casing.
- Reading-time buckets (`under-3` / `3-6` / `over-6`) are the `READING_TIME_BUCKETS` constant at
  the top of [article.controller.js](backend/controllers/article.controller.js); the bucket
  `$or` is wrapped in `$and` so it cannot clash with the search `$or`.
- **Drafts are admin-only.** Without an admin token (`adminFromRequest`, exported from
  [auth.middleware.js](backend/middleware/auth.middleware.js)) `GET /api/articles` forces
  `published: true` and `GET /api/articles/:slug` 404s on a draft; view/like don't count on
  drafts. The public pages also send `published=true` themselves, so a signed-in admin browsing
  the site doesn't see drafts either (`getArticles(true)` on home, `buildQuery` on the list,
  `getArticleBySlug(slug, true)` on the detail page — `?published=true` wins over the token, so
  SSR and the browser agree). The public detail page renders a 404 as an "Article not found"
  state, not the generic error; drafts are previewed from the admin article detail page.
- **No `limit` means no pagination** (all rows), which is what the un-paged callers rely on.
  `countOnly=true` skips the documents and facets and returns just `total` — it backs the
  "Total Results" preview in the filter drawer.
- Frontend side: `getProjects()` / `getArticles()` map the envelope back to `items` for the
  home/admin/detail callers; `queryProjects()` / `queryArticles()` take the query object and
  return the envelope. Only the two public list pages use the query form. Both go through
  `normalizeListResponse()`, which also accepts a **bare array**, so a not-yet-redeployed API
  degrades (all rows, no facets) instead of crashing the page.

---

## 3. Frontend

Bootstrap: [main.ts](frontend/src/main.ts) → [app.config.ts](frontend/src/app/app.config.ts);
SSR entry [server.ts](frontend/src/server.ts) / [main.server.ts](frontend/src/main.server.ts).

### Providers ([app.config.ts](frontend/src/app/app.config.ts))

Router with in-memory scrolling, `provideClientHydration(withEventReplay())`, async animations,
`provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`, and a
`LucideAngularModule.pick({...})` list. **Any new lucide icon must be imported and added to that
pick list before a template can use it.**

### Routing

- [app.routes.ts](frontend/src/app/app.routes.ts) — `''` HomePage, `projects` / `projects/:slug`,
  `articles` / `articles/:slug`, `contact`, and `admin` via
  `loadChildren(() => admin/admin.routes)`. List pages are eagerly imported; detail pages are
  `loadComponent` lazy.
- [admin/admin.routes.ts](frontend/src/app/admin/admin.routes.ts) — `login`, then `AdminLayout`
  shell (both `canActivate: [adminGuard]`) with children `dashboard`, `profile`,
  `projects{,/add,/edit/:slug,/:slug}`, `articles{...same}`, `faqs{,/add,/edit/:id}`,
  `notifications`, `contacts{,/:id}`.
- [app.routes.server.ts](frontend/src/app/app.routes.server.ts) — `admin/**` is
  `RenderMode.Client`, everything else `RenderMode.Server`.
  ⚠️ **Do not "fix" the blank View Source on `/admin` by switching it to `RenderMode.Server`.**
  `adminGuard` returns `true` on the server (no `localStorage`), so server-rendering admin would
  put the admin shell in publicly fetchable HTML, and `authInterceptor` sends no bearer token
  server-side, so every admin call would 401 and render error states rather than data.
- Every **public** route must server-render its content. A page whose `ngOnInit` returns early
  behind `isPlatformBrowser` fetches nothing on the server and ships an empty shell — guard the
  individual `window`/`document` call instead, never the data fetch.

### Core ([app/core/](frontend/src/app/core/))

- [services/](frontend/src/app/core/services/) — one root-provided service per API resource
  (`about, admin, article, comment, contact, education, experience, faq, profile, project,
  skills`).
  Uniform shape: `inject(HttpClient)`, `private apiUrl = ${environment.apiUrl}/<resource>`, thin
  methods returning `Observable<T>` typed by `app/models/`. **Add API calls here, never in
  components.** The non-HTTP services alongside them are `loader`, `snack-bar` and `admin-tab`.
- [admin.service.ts](frontend/src/app/core/services/admin.service.ts) is the exception — it also
  owns the `adminToken` in `localStorage` (`saveToken/getToken/isLoggedIn`) and
  `scheduleAutoLogout()` driven by the JWT `exp`.
- [loader.service.ts](frontend/src/app/core/services/loader.service.ts) — signals
  `startupLoading` / `apiLoading`, consumed by [app.html](frontend/src/app/app.html) to render
  [startup-loader](frontend/src/app/shared/components/loaders/startup-loader/) and
  [api-loader](frontend/src/app/shared/components/loaders/api-loader/). Pages call
  `showApi()`/`hideApi()` around their own requests; there is no automatic HTTP-loading
  interceptor.
- The same service tracks in-flight page data via `trackRequest()` / `completeRequest()` and
  exposes `contentLoading`. The home sections (hero, about, skills, education-experience,
  home-projects, home-articles) register their fetches this way so the splash screen stays up
  until the API answers — see §5. Anything added to the home page should register too.
- [snack-bar.service.ts](frontend/src/app/core/services/snack-bar.service.ts) — `success()` /
  `error()` wrappers over Angular Material `MatSnackBar`; use these for user feedback.
  `httpError(err, fallback?)` turns a failed request into a readable line (the API's own
  `message`, "can't reach the server" for status 0, or the fallback) instead of Angular's raw
  "Http failure response for … 0 Unknown Error". Only the public contact page uses it; the admin
  profile sub-lists still pass `err.message` on purpose.
- [admin-tab.service.ts](frontend/src/app/core/services/admin-tab.service.ts) — signal-held
  `tabs` / `activeTab`. A page publishes its tab strip with `setTabs()` in `ngOnInit` and
  `clear()` in `ngOnDestroy`; [admin-header](frontend/src/app/admin/components/admin-header/)
  renders it. Only [profile-admin](frontend/src/app/admin/pages/profile-admin/profile-admin.ts)
  uses it today (Profile Image / About / Skills / Experience / Education).
- [interceptors/auth-interceptor.ts](frontend/src/app/core/interceptors/auth-interceptor.ts) —
  attaches the bearer token, and on 401 clears it and routes to `/admin/login`.
- [guards/admin-guard.ts](frontend/src/app/core/guards/admin-guard.ts) — decodes the JWT payload
  client-side (`atob`) to check `exp`; redirects expired/missing tokens to `/admin/login` and
  logged-in users away from the login page. Returns `true` on the server.

### Models & static data

- [app/models/](frontend/src/app/models/) — one file per resource with the
  `XResponse` / `XForm` / `XSaveResponse` / `XApiResponse` interface quartet, plus
  [navbar.model.ts](frontend/src/app/models/navbar.model.ts) and
  [footer.model.ts](frontend/src/app/models/footer.model.ts).
- [filter.model.ts](frontend/src/app/models/filter.model.ts) is the cross-resource one:
  `FilterGroup` / `FilterOption` / `FilterSelection` / `FilterChip` (drawer UI) and
  `FacetOption` / `PagedResponse<T>` / `ListQuery` (API envelope). `project.model.ts` and
  `article.model.ts` extend those into `XListResponse` / `XListFilters` / `XQuery`.
- [app/portfolio-data.ts](frontend/src/app/portfolio-data.ts) — hardcoded `NAVBAR_MENU`,
  `FOOTER_MENU` and `SOCIAL_LINKS`. Nav/footer links are **not** in the DB; edit them here.
  `FOOTER_MENU`/`SOCIAL_LINKS` are rendered by `footer/contact-footer`, not by `footer` itself.

### Component map

- **Shell** — [app.ts](frontend/src/app/app.ts) / [app.html](frontend/src/app/app.html): tracks
  `isAdminPage()` from the URL to hide the public navbar/footer and the page container on
  `/admin`, and kicks off the startup loader + auto-logout timer (browser only).
- ⚠️ **There is no `app/components/` directory.** Every component lives under
  [app/shared/components/](frontend/src/app/shared/components/) (public sections *and* shared
  widgets together), except the admin tree under [app/admin/](frontend/src/app/admin/) and the
  routed pages under [app/pages/](frontend/src/app/pages/).
- **Public sections** [app/shared/components/](frontend/src/app/shared/components/): `hero`,
  `about`, `slider-view` (static marquee, no logic — currently commented out of the home page),
  `skills`, `education-experience`, `home-services`, `home-projects` (the only embla-carousel
  consumer), `home-articles`, `navbar`, `footer` (+ `footer/contact-footer`, `footer/faq`),
  `error`, `loaders/*`. [home.page.ts](frontend/src/app/pages/home.page/home.page.ts) is just a
  composition of those section components.
- **Public pages** [app/pages/](frontend/src/app/pages/): `home.page`,
  `projects/projects-list.page`, `projects/project-details.page`, `articles/article-list-page`,
  `articles/article-details-page`, `contact-page`.
- **Shared widgets** — also in [app/shared/components/](frontend/src/app/shared/components/):
  `custom-button`, `custom-nav` (back/next nav), `gradient-text`, `list-toolbar`, `data-table`,
  `date-picker`, `markdown-toolbar`, `markdown-preview`, `article-comments`. Plus
  [shared/directives/reveal.directive.ts](frontend/src/app/shared/directives/reveal.directive.ts)
  (IntersectionObserver scroll-reveal) and
  [shared/animation/page.animations.ts](frontend/src/app/shared/animation/page.animations.ts).
- **[markdown-toolbar](frontend/src/app/shared/components/markdown-toolbar/) /
  [markdown-preview](frontend/src/app/shared/components/markdown-preview/)** — the mini-markdown
  editing pair used by the admin project form (overview + description), `admin-profile` (hero
  description) and `admin-about` (bio). `<app-markdown-toolbar targetId="<textarea id>"
  [value]="…" (valueChange)="updateField(…, $event)">` renders the B / I / `</>` buttons and
  wraps the current selection (or inserts a selected placeholder) — it finds the field by
  `document.getElementById`, so **the textarea needs that `id`**. `[showCode]="false"` drops the
  code button. `<app-markdown-preview [value]="…" label="…">` renders the `formatText` output
  under the field and hides itself when the value is empty.
- **[article-comments](frontend/src/app/shared/components/article-comments/)** — the whole
  comment UI (post box, thread, one level of replies) behind
  `<app-article-comments [article]="<slug|id>">`. `[isAdmin]="true"` swaps to the light admin
  palette, hides the name/email fields (the API stamps the signed-in admin's own name, so the
  `'Author'` the client sends is only a validation placeholder) and shows Edit / Delete;
  `[bare]="true"` drops the card chrome when the host already draws it. It emits
  `countChange` so the page can label its own counter.
  - On the public article page it lives **inside a popup** opened by the comment chip. The
    overlay stays in the DOM and is toggled with `[class.hidden]`, not `@if`, so the thread
    loads with the page and the chip's count is right before anyone opens it.
  - The chip is a `<button>` on purpose: a fragment link (`href="#comments"`) resolves against
    `<base href="/">` and navigates to the home page.
- **[data-table](frontend/src/app/shared/components/data-table/)** — the generic admin table
  (`<app-data-table>`), used by the projects / articles / faqs / contacts admin lists. It is
  **client-side**: it takes the full `rows` array and does its own search, filtering, sorting and
  `mat-paginator` paging in `computed()`s, so it does **not** talk to the envelope API.
  - Declare `TableColumn[]` / `TableFilter[]` / `TableAction[]` as `readonly` fields on the list
    component and handle the single `(action)` output with a `switch (event.id)`; see
    [admin-faq-list.ts](frontend/src/app/admin/pages/faq-admin/admin-faq-list/admin-faq-list.ts)
    as the reference.
  - [data-table.model.ts](frontend/src/app/shared/components/data-table/data-table.model.ts) holds
    the types plus the `viewAction()` / `editAction()` / `deleteAction()` factories every list
    reuses. Built-in column `type`s: `index, text, image, date, timeAgo, badge, tags, progress`.
  - The template iterates `viewColumns()`, **not** `columns()` — a `computed()` that resolves each
    column's `type`, `sortable` flag and `<th>`/`<td>` class strings once. The app runs on zone
    change detection, so keep per-cell work out of the template and put it there instead.
  - `badge` columns with no `badgeClass` pick their pill from the cell text via the
    `BADGE_VARIANTS` regex table (word-boundary matched, first match wins).
  - For a cell the built-ins can't draw, project an
    `<ng-template appTableCell="<column key>" let-row>` child
    ([table-cell.directive.ts](frontend/src/app/shared/components/data-table/table-cell.directive.ts)).
  - It renders its own toolbar/chips/drawer — it does **not** use `list-toolbar`, though it does
    reuse `filter-drawer` and `filter.utils`. The `.tbl-*` classes it applies
    (`tbl-badge-*`, `tbl-col-*`, `tbl-tag`, `tbl-image`) are defined in
    [data-table.css](frontend/src/app/shared/components/data-table/data-table.css). The row-action
    buttons (`.tbl-action-btn` / `-view` / `-edit` / `-delete`) are **global** in
    [styles.css](frontend/src/styles.css), because the profile sub-lists use them too.
- **[date-picker](frontend/src/app/shared/components/date-picker/)** — hand-rolled
  `<app-date-picker>`, the **only** datepicker in the app (the admin project form and both
  From/To bounds in `filter-drawer`). `DD-MM-YYYY` display, emits ISO `yyyy-MM-dd` on
  `valueChange`, `''` when cleared, closes on outside click and then emits `blur`.
  - Three views drill down: days → a 24-year grid → a 12-month grid → days. `view()` drives the
    header label, what the `‹` / `›` arrows page through, and which grid renders.
  - Optional `min` / `max` inputs (ISO or `DD-MM-YYYY`) grey out and disable days, whole months
    and whole years. The drawer passes the opposite bound so From can't pass To.
  - Strings that look like `yyyy-mm-dd` are parsed as **local** midnight (`${value}T00:00:00`);
    bare `new Date('2026-09-14')` is UTC and shifts a day in negative-offset timezones.
- **List search/filter UI** used by the projects and articles list pages:
  - [list-toolbar](frontend/src/app/shared/components/list-toolbar/) — "Total N X found", the
    removable applied-filter chips, the search box and the filter button (with an active-filter
    badge). Pure presentation: inputs
    `total/label/search/placeholder/activeFilterCount/chips`, outputs
    `searchChange/openFilters/removeChip`.
  - [filters/filter-drawer](frontend/src/app/shared/filters/filter-drawer/) — the right-hand
    panel, rendered entirely from `FilterGroup[]`: collapsible groups, per-group option search,
    checkbox lists with counts, and for `type: 'date'` groups the quick ranges
    (Today / Last 7 / Last 30 / All) plus two From/To `<app-date-picker>`s. It edits a
    **draft** copy and emits `draftChange` on every change (so the page can preview the count),
    committing only on `applied`. Inputs `open/groups/selection/totalResults`, outputs
    `closed/draftChange/applied/cleared`.
  - [filters/filter.utils.ts](frontend/src/app/shared/filters/filter.utils.ts) — the selection
    helpers shared by both list pages: `emptyFilterSelection` / `cloneFilterSelection`,
    `countActiveFilters`, `buildFilterChips` / `removeFilterChip`, `facetToOption`,
    `selectedValues` / `dateBound` (selection → query params), `toHttpParams` and
    `normalizeListResponse`.
- **Pipes** [app/pipes/](frontend/src/app/pipes/): `truncate`, `time-ago`, `SafeHtml`, and
  [format-text.pipe.ts](frontend/src/app/pipes/format-text.pipe.ts) (`formatText`) — turns the
  mini-markdown admins type into sanitized HTML (`**bold**`, `*italic*`, `` `code` ``, plus
  existing `<b>`/`<strong>`), used by `markdown-preview`, the project/article detail pages and the
  public `hero` / `about` sections.
- **Admin** [app/admin/](frontend/src/app/admin/): `auth/admin-login`,
  `layout/admin-layout` + `components/admin-header`;
  `pages/dashboard-admin`; `pages/profile-admin` which composes `components/admin-profile`,
  `admin-about`, `admin-skills/*`, `admin-experiences/*`, `admin-education/*`; and
  `pages/{projects,articles,faq,contact}-admin/*` with `-list` / `-form` / `-detail` trios.
  - The layout shell is **header-only** — `admin-layout.html` is `<app-admin-header/>` over a
    `<router-outlet/>` — there is no sidebar.
  - `admin-header` owns the waffle "services" drawer (its own hardcoded `services` list of admin
    sections), the profile dropdown + logout, the page title derived from the URL, and the tab
    strip fed by `AdminTabService`. The strip is `overflow-x-auto` with the scrollbar hidden, so
    it renders `‹` / `›` buttons whenever it overflows — each is shown only when there is room to
    move that way. Widths are measured in `updateTabScroll()`, re-run on `window:resize`, on the
    strip's own `scroll`, and via `afterNextRender` whenever `tabService.tabs()` changes.
  - The four top-level admin lists (projects, articles, faqs, contacts) render through
    `app-data-table`.
  - The education and experience sub-lists share
    [components/admin-card-list](frontend/src/app/admin/components/admin-card-list/) — the card
    grid, loading skeleton, empty state and modal shell. A consumer maps its rows to
    `AdminCard[]` (`id/title/subtitle/meta`) and projects its own form into the modal, wrapped in
    its own `@if` so the form is still destroyed on close. Add a third card list this way rather
    than copying markup.
  - `admin-skills` stays hand-rolled: it is a table grouped by category, not a card grid.

### Styling / theming

- [styles.css](frontend/src/styles.css) — `@import 'tailwindcss'` (v4, configured via
  [.postcssrc.json](frontend/.postcssrc.json), no `tailwind.config.js`) plus CSS custom
  properties (`--bg-color`, `--text-color`, `--navbar-bg`, `--card-bg`, `--logo-*`).
- Dark mode is a `dark-theme` class on `<html>`, toggled in
  [navbar.ts](frontend/src/app/shared/components/navbar/navbar.ts) and wired to Tailwind through
  `@custom-variant dark (&:where(.dark-theme, .dark-theme *))`. Use `dark:` utilities or the CSS
  vars — not a media query.
- [custom-theme.scss](frontend/src/custom-theme.scss) is the Angular Material theme (`mat.theme()`,
  `color-scheme: light` on `body`); both files are listed under `styles` in
  [angular.json](frontend/angular.json). Material 20 derives its colours from `color-scheme`, so
  the dark-mode override for the filter drawer lives in `styles.css` rather than in the theme
  file. `<app-date-picker>` is plain Tailwind and stays white in both themes.
- **Admin accent colour.** Tailwind v4 compiles `bg-blue-600` to
  `background-color: var(--color-blue-600)`, so `styles.css` redefines
  `--color-blue-600` / `--color-blue-700` on `.admin-layout, app-admin-login`. That retints
  every blue fill, hover, text and border inside admin from one place; the public site keeps
  Tailwind's default blue. **Use `bg-blue-600`, never an arbitrary `bg-[#hex]`**, or the button
  will opt out of the theme.
- **z-index ladder** (all of it hand-rolled as Tailwind arbitrary/bare values in the templates,
  keep it in sync): admin header `40` (`admin-header.css`) → navbar `z-[999]`, its backdrop
  `z-[998]`, its mobile menu `z-[1000]` → filter-drawer backdrop `z-1300`, panel `z-1310` →
  api-loader `z-[9999]` / article comments popup `z-[9999]` / project-detail lightbox
  `z-[9999]`+`z-[10000]` → `.cdk-overlay-container` `20000` (raised in `styles.css` so snack bars
  and datepicker popups clear the drawer **and** the full-screen overlays — a snack bar hidden
  behind the comments popup is an error message the user never sees) → startup-loader
  `z-[99999]`.

---

## 4. Coding patterns to follow

**Frontend**
- Standalone components only, explicit `imports` array, separate `.html` (and often `.css`)
  files. No NgModules.
- State is `signal()` + `computed()`; DI is `inject()` in field initializers, never constructor
  params.
- Subscription cleanup (the default, ~29 files): `private destroyRef = inject(DestroyRef)` then
  `this.destroyRef.onDestroy(() => sub.unsubscribe())`. Stay with this form unless you are
  editing one of the five files that subscribe **in the constructor** and therefore use
  `takeUntilDestroyed()` instead (`admin-header`, `dashboard-admin`, and the three admin
  detail pages) — match the surrounding file.
- Templates use the new control flow (`@if` / `@for`), not `*ngIf` / `*ngFor`.
- **Forms are not reactive.** Admin forms hold a signal object and bind
  `[value]="model().field"` + `(input)="updateField('field', $any($event.target).value)"`;
  see [admin-project-form.ts](frontend/src/app/admin/pages/projects-admin/admin-project-form/admin-project-form.ts)
  as the reference. `FormsModule`/`ngModel` appears in only two places
  ([admin-about](frontend/src/app/admin/components/admin-about/admin-about.ts),
  [contact-page](frontend/src/app/pages/contact-page/contact-page.ts)). Match the surrounding
  file rather than introducing `ReactiveFormsModule`.
- Anything touching `localStorage`, `window`, `document`, or `performance` **must** be guarded by
  `isPlatformBrowser(inject(PLATFORM_ID))` — the public site is server-rendered and will crash
  otherwise.
- Image/file submissions build a `FormData` in the component and pass it to the service.
- ⚠️ `<lucide-icon>` declares `class` as an **`@Input`** and copies it onto the `<svg>` it
  generates, while Angular still puts it on the host — so positioning utilities
  (`absolute left-3 …`) are applied **twice**. Wrap the icon in a positioned `<span>` instead of
  styling the icon (see the search boxes in `list-toolbar` / `filter-drawer`).
- The two list pages are the one place that departs from "subscribe in `ngOnInit`": search,
  filters and paging feed rxjs `Subject`s piped through `debounceTime` + `switchMap` in the
  constructor (so a superseded request is dropped), with the subscriptions torn down in the
  usual `destroyRef.onDestroy`. Keep that shape if you add another server-queried list.
- Angular Material is now down to two things: the snack bar and the `mat-paginator` inside
  `data-table`. `mat-form-field` is deliberately **not** used anywhere, because Tailwind's
  preflight breaks the MDC notched outline. For dates use `<app-date-picker>` — the Material
  datepicker (and its `provideNativeDateAdapter()` wiring) has been removed from the project.
- Admin lists should go through `<app-data-table>` rather than new `<table>` markup, and any new
  lucide icon a `TableAction` names still has to be in the `pick` list in `app.config.ts`.

**Backend**
- Mirror the existing three-file resource pattern and register the router in `server.js`.
- Respond with explicit status codes inside `try/catch`; no `next(err)`.

## 5. Home page startup loading

The API is on Render's free tier, so the first request after idle takes tens of seconds. The
splash screen in
[startup-loader.ts](frontend/src/app/shared/components/loaders/startup-loader/startup-loader.ts)
is gated on real data rather than a fixed timer:

- shows for at least `MIN_DISPLAY_MS` (2s) so the intro animation plays,
- then stays up while `loaderService.contentLoading()` is true,
- adds a "waking up the server" hint after `SLOW_HINT_MS` (5s),
- force-exits at `MAX_WAIT_MS` (20s) and calls `resetRequests()` so a dead API can't trap the
  visitor.

The six home sections that register are `hero`, `about`, `skills`, `education-experience`,
`home-projects` and `home-articles` (`home-services` is static and registers nothing). Pages other than home register nothing, so the counter is 0
and they exit at the 2s minimum as before. Behaviour is covered by
[startup-loader.timing.spec.ts](frontend/src/app/shared/components/loaders/startup-loader/startup-loader.timing.spec.ts)
(`ng test --include='**/startup-loader.timing.spec.ts'`) — the one spec in the repo that is not
a scaffold.

## 6. Mobile app (Ionic + Capacitor)

The same Angular build ships as an Android/iOS app. `frontend/android/` is a generated
Capacitor project — **never hand-edit files under it**, they are overwritten by `cap sync`.

```bash
cd frontend
npm run build:mobile    # ng build + scripts/prepare-mobile.mjs
npm run mobile:sync     # build:mobile + npx cap sync
npm run mobile:android  # sync + open Android Studio
npm run mobile:apk      # sync + ./gradlew assembleDebug (no Android Studio needed)
```

**Toolchain.** The generated project needs **JDK 21**, **compileSdk/targetSdk 36** (minSdk 24),
AGP **8.13.0** and Gradle **8.14.3** (the wrapper downloads Gradle itself) — see
`android/variables.gradle`. Install with `sudo snap install android-studio --classic`, then
launch it once so it downloads SDK platform 36. `mobile:apk` writes
`android/app/build/outputs/apk/debug/app-debug.apk`.

- `npx cap open android` only probes `/usr/local/android-studio/bin/studio.sh`, which misses snap
  installs and Studio 2024.2+ (where `studio.sh` became `studio`).
  [scripts/open-android.mjs](frontend/scripts/open-android.mjs) resolves the real launcher and
  passes it through `CAPACITOR_ANDROID_STUDIO_PATH`; set that env var yourself to override.

- Capacitor packages the **browser** bundle only (`webDir: dist/frontend/browser` in
  [capacitor.config.ts](frontend/capacitor.config.ts)); the SSR `dist/frontend/server` output is
  unused inside the app, and `app.routes.server.ts` is irrelevant there.
- ⚠️ The SSR builder emits **`index.csr.html`, not `index.html`**, and Capacitor requires a real
  `index.html` in `webDir`. [scripts/prepare-mobile.mjs](frontend/scripts/prepare-mobile.mjs)
  copies it. This is why you must run `build:mobile`, never a bare `ng build`, before syncing.
- ⚠️ The packaged app has its **own origin** — `https://localhost` on Android (`androidScheme`)
  and `capacitor://localhost` on iOS. Both are in the CORS allowlist in
  [backend/server.js](backend/server.js); dropping them breaks every request in the app.
- `ng build` uses `environment.prod.ts`, so the app talks to the Render API over HTTPS. Pointing
  it at a LAN `http://` address for debugging also needs `allowMixedContent: true` in
  `capacitor.config.ts` (Android blocks cleartext by default).
- Ionic is registered via `provideIonicAngular()` in
  [app.config.ts](frontend/src/app/app.config.ts) for its platform services only. **Its global
  stylesheets are deliberately not imported** — they would restyle the Tailwind UI — so an
  `ion-*` component will render unstyled until you add the matching CSS.
- **Safe areas / edge-to-edge.** `targetSdk 36` means Android 15+ forces edge-to-edge, so the
  WebView draws under the status and gesture bars. `index.html` therefore sets
  **`viewport-fit=cover`** (without it `env(safe-area-inset-*)` reports 0), and the three
  edge-touching elements pad themselves: the public navbar and the admin header with
  `env(safe-area-inset-top)`, the public footer with `env(safe-area-inset-bottom)`. The page
  offset in `app.html` is `calc(4.5rem + env(safe-area-inset-top))` so it keeps clearing the
  navbar as that grows. On desktop every inset is 0, so the web layout is unchanged.
- Verified responsive at 360x800: no horizontal overflow on any public or admin page. The admin
  data tables are intentionally `min-w-[760px]` inside an `overflow-auto` wrapper, so on a phone
  they scroll sideways within the card rather than stretching the page.
- iOS needs macOS + Xcode + CocoaPods; only the Android platform is scaffolded here.

---

## 7. Known rough edges

- [environment.ts](frontend/src/environments/environment.ts) (dev) currently points at
  `http://localhost:5000/api`, with the Render URL commented out — so `ng serve` needs the local
  backend running. Production builds swap in
  [environment.prod.ts](frontend/src/environments/environment.prod.ts) (Render) via
  `fileReplacements` in [angular.json](frontend/angular.json), so only the dev file ever needs
  toggling.
- The list pages talk to the **new** envelope API. The deployed Render backend must be
  redeployed after any change to the projects/articles list endpoints, otherwise those pages
  fall back to the un-filtered, un-paged degraded mode described in §2.
- Adding a dependency mid-`ng serve` (e.g. the Material datepicker) makes Vite re-optimize and
  the running SSR process dies with "There is a new version of the pre-bundle…". Stop the
  server, `rm -rf frontend/.angular/cache`, start again.
- Missing `protectAdmin` on the skills / experiences / educations / faqs / profile mutations
  (see §2).
- The anonymous endpoints are **unthrottled**: `POST /api/comments` and the `view` / `like`
  counters accept any number of calls from anyone, so a script can spam the thread or inflate
  the numbers. There is no rate limit, captcha or approval queue — the admin can only delete
  after the fact (and `reset-stats` zeroes the counters).
- `data-table` renders no result counter — unlike the public `list-toolbar` there is no
  "Total N found" line, so the `label` input it used to carry was dead and has been removed.
- `slider-view` is imported but commented out of `home.page.ts`'s `imports`, so it never renders.
- The public skills section was rebuilt as a plain text list grouped by category, so it shows
  neither `imageUrl` nor `percentage`. The admin form still marks proficiency % as **required**,
  so that data is collected and never surfaced — wire it up or drop the field.
- Two agent maps describe this repo — this file and [ANTIGRAVITY.md](ANTIGRAVITY.md). They drift
  independently; update both if you change something structural.
- Large blocks of commented-out legacy code sit at the bottom of many files (`app.config.ts`,
  `auth-interceptor.ts`, `admin-guard.ts`, all the profile/upload files). Treat them as dead;
  don't mine them for behaviour.
- `.spec.ts` files are untouched CLI scaffolds and several will fail if run.
