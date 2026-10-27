# Books & Music Store: Front end

React + Vite + TypeScript + Tailwind. Mobile first, light and dark themes, page transitions.
It runs on mock data until the backend is ready.

## Run it
```bash
cp .env.example .env
npm install
npm run dev
```
Open the printed URL on your phone (same Wi-Fi) or use your browser's device mode at 360px wide.
In mock mode a small **Dev** button (top left) switches between the demo buyer and the demo admin.

## Host it
It is a static site (`npm run build` creates `dist/`). Any static host works.
- Build command: `npm run build`. Output folder: `dist`.
- Set `VITE_USE_MOCKS=true` for a demo with no backend.
- Deep links (like `/product/some-book`) need a rewrite to `index.html`. Included: `public/_redirects` (Netlify, Cloudflare Pages) and `vercel.json`.
- Vercel's free Hobby plan is for personal, non-commercial use only. For the client's store use a paid plan or another host, and check that host's terms.
- With the real backend, serve the API on a subdomain of the same site as the front end (for example `app.yourbrand.com` and `api.yourbrand.com`)
  because Safari on iPhone can block cookies that come from a different site.

## Connect the real backend
In `.env` set `VITE_USE_MOCKS=false` and `VITE_API_URL=http://localhost:5000`.
Every request uses `credentials: 'include'` (httpOnly cookie), so the backend `CLIENT_ORIGIN`
must match this app's URL exactly. All data access goes through `src/api/index.ts`.

### API contract the UI expects
| Call | Endpoint | Returns |
|---|---|---|
| register, login | `POST /auth/register`, `/auth/login` | `{ user }` |
| me | `GET /auth/me` | `{ user }` (401 = logged out) |
| forgot / reset | `POST /auth/forgot-password`, `/auth/reset-password` | `{ ok }` |
| listProducts | `GET /products?type&category&q&sort&page&limit` | `{ items, total, page, pages }` |
| getFeatured | `GET /products/featured` | `Product[]` |
| getProduct | `GET /products/:slug` | `Product` |
| listCategories | `GET /categories` | `Category[]` |
| checkout | `POST /checkout` `{ productIds }` | `{ orderId, checkoutUrl }` |
| getOrder, listOrders | `GET /orders/:id`, `/orders` | `Order`, `Order[]` |
| listLibrary | `GET /library` | `{ product, acquiredAt }[]` |
| getDownloadUrl | `GET /library/:productId/download` | `{ url, expiresAt }` |

### Admin endpoints the UI expects (role = admin)
| Call | Endpoint |
|---|---|
| adminStats | `GET /admin/stats` returns `{ revenue, orders, products, summariesToReview, recentOrders }` |
| listAdminProducts | `GET /admin/products?type&status&review=1&q` returns `AdminProduct[]` |
| getAdminProduct | `GET /admin/products/:id` (includes `files` and `summaryAdmin`) |
| saveProduct | `POST /admin/products`, `PUT /admin/products/:id` |
| uploadFile | `POST /admin/products/:id/files/:kind` (`cover`, `file`, `preview`) multipart field `file` |
| setProductStatus | `PATCH /admin/products/:id/status` `{ status }` |
| deleteProduct | `DELETE /admin/products/:id` |
| summary | `POST .../summary/regenerate`, `PATCH .../summary` `{ text }`, `POST .../summary/approve` |
| categories | `POST /admin/categories`, `PUT/DELETE /admin/categories/:id` |
| orders, users | `GET /admin/orders`, `GET /admin/users` (with `itemsCount`) |
| grantItem | `POST /admin/grants` `{ userId, productId }` |
| settings | `GET/PUT /admin/settings` `{ autoPublishSummaries }` |

The UI polls the product every 2.5 seconds while its summary status is `pending`.

Prices are integers in kobo. Errors look like `{ error: { code, message } }`.

## What is built (foundation)
- Design tokens: light = board E (amber), dark = board F (neon lime, sharp corners). Switch in Account or the top bar.
- App shell: bottom tab bar (phones), top bar (desktop), search overlay, global 30-second mini player,
  toasts, offline banner, route guards (login, admin), animated page transitions (reduced motion respected).
- Pages working with mock data: Home, Browse (filters in the URL), Product, Cart, Checkout result (polling),
  Library, Orders, Account, Login, Register, Forgot password, Reset password.
- Admin (mock data, fully clickable): Dashboard, Products list (with summary status chips and a 'Needs review' filter),
  Product form with file uploads and progress, the **Book Summary Review panel** (stepper, editable text with word counter,
  approve, regenerate, retry, write it yourself), publish switch with plain-language blockers, Categories, Orders
  (with 'Grant item to user'), Users, and Settings (auto-publish switch).
- Placeholders: Terms, Privacy, Refunds.

## 3D (React Three Fiber)
- **Home hero:** floating books and albums from the featured items plus a vinyl, with parallax from touch or mouse,
  a slow turn on scroll, and tap-to-open on each item.
- **Product page:** a book you drag to turn, or a vinyl that spins while the preview plays (drag to tilt).
- **Sign-in pages:** the compact hero scene with two floating chips; the "check your email" page shows an envelope.
- **Performance and fallback:** three.js is code-split and loads only on pages with a scene. The scene is skipped (2D covers instead)
  with reduced motion, low device memory, data saver, or no WebGL. Rendering pauses off-screen, while typing in a form,
  and the pixel ratio is capped. Cover artwork is drawn in code until real images are uploaded.
- Files: `src/three/` (`Stage.tsx` decides and mounts, `scenes.tsx` holds the three.js code, `env.ts` the device checks).

## Next steps
1. Switch from mocks to the real backend as each endpoint lands.
# E-WEB-STORE
