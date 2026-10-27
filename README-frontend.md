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

Prices are integers in kobo. Errors look like `{ error: { code, message } }`.

## What is built (foundation)
- Design tokens: light = board E (amber), dark = board F (neon lime, sharp corners). Switch in Account or the top bar.
- App shell: bottom tab bar (phones), top bar (desktop), search overlay, global 30-second mini player,
  toasts, offline banner, route guards (login, admin), animated page transitions (reduced motion respected).
- Pages working with mock data: Home, Browse (filters in the URL), Product, Cart, Checkout result (polling),
  Library, Orders, Account, Login, Register, Forgot password, Reset password.
- Placeholders: Terms, Privacy, Refunds, and every admin screen.

## Next steps
1. 3D: React Three Fiber hero on Home, 3D book and vinyl on Product, compact scene on the sign-in pages.
2. Admin screens (products list, summary review, settings, dashboard, orders, users).
3. Switch from mocks to the real backend as each endpoint lands.
