# Product Admin Dashboard

A small admin dashboard built with Next.js, React, Tailwind CSS, and Axios, using the DummyJSON API to manage products.

## Setup

1. Clone the repo and install dependencies:
```bash
   npm install
```
2. Run the dev server:
```bash
   npm run dev
```
3. Open `http://localhost:3000` — you'll be redirected to `/login`.
4. Log in with:
   - Username: `emilys`
   - Password: `emilyspass`

## What's finished

- Login page with error handling for wrong credentials, and a guard against multiple rapid submits
- Route protection — `/products` and `/products/[id]` redirect to `/login` if not authenticated
- Logout button
- Product list with image, title, category, price, rating, stock
- Responsive layout — table on desktop, cards on mobile
- Pagination with page numbers, Prev/Next, page size selector (10/20/50), and a "Showing X–Y of Z" label
- Debounced search (waits for the user to stop typing), with protection against stale/out-of-order responses
- Category filter and sort (by price, rating, title)
- Product details page at `/products/[id]` with images, description, price, and reviews
- "Not found" state for an invalid/nonexistent product id
- Add/edit product form with validation
- Delete with a confirmation dialog
- Loading, empty, and error (with Retry) states
- All page/search/filter/sort state is kept in the URL, so refreshing or sharing a link preserves the view
- Invalid URL values (`?page=abc`, `?page=999`) are sanitized instead of breaking the page
- One shared Axios instance (`lib/axios.ts`) attaches the auth token to every request and handles errors centrally

## Tech stack

Next.js (App Router), React, Tailwind CSS, Axios — no data-fetching or table/pagination libraries; all logic is hand-written.