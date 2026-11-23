# Commonplace

A social ledger for work that refuses one label: drafts, findings, finished pieces, and everything in between. Built with Next.js 16, Tailwind CSS 4, and Supabase.

## Live app

- Production alias: https://commonplace-nine-tawny.vercel.app
- Username alias: https://commonplace-eubulus09.vercel.app
- `commonplace.vercel.app` is unavailable because that Vercel alias is already owned by another account.

## Local setup

1. Use Node.js 20.9 or newer and npm.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key:

   ```bash
   cp .env.example .env.local
   ```

4. Apply the migrations in `supabase/migrations/` to your Supabase project, then optionally load `supabase/seed.sql` for demo content.
5. Start the app:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Supabase configuration

Required environment variables (also set these in Vercel for Production, Preview, and Development):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

In Supabase Auth, add these redirect URLs so email confirmation links work:

- `http://localhost:3000/auth/confirm`
- `https://commonplace-nine-tawny.vercel.app/auth/confirm`
- `https://commonplace-eubulus09.vercel.app/auth/confirm`

The app writes rows through RLS-protected tables and public Storage buckets. Migrations also set file size and MIME limits and keep bookmark totals private while still exposing aggregate counts.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

Changing `NEXT_PUBLIC_*` variables requires a new deployment because Next.js inlines them at build time.
