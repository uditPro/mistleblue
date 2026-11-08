# Mistleblue

Mistleblue is a Next.js App Router storefront backed by a local JSON catalog. It does not require a database service.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Import a WordPress SQL backup

1. The local SQL backup is stored at `migration/backup.sql` (it is excluded from Git). You can also pass another local file path to the migration command.
2. Run `npm run migrate:wordpress` or `npm run migrate:wordpress -- "C:\path\to\local-backup.sql"`.
3. The script replaces `data/products.json` with published `product`, `post`, and `page` records from `wppk_posts`.
4. Run `npm run build` to generate the catalog and product detail pages.

The marketplace displays entries whose type is `product`. Detail-page HTML is sanitized before it is rendered. The SQL backup contains private WordPress data, so it is kept locally and excluded from Git.

The migration reads only the local file path supplied to it. It does not connect to WordPress or a database server.

`data/products.json` contains the published entries imported from the local backup. Running the import again replaces the JSON catalog with the current published records.

## Customer accounts

Sign-in uses Supabase email links. Copy `.env.example` to `.env.local`, then set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL`. Never put the Supabase service-role key in a `NEXT_PUBLIC_` variable or share it in chat.

Run the SQL in `migration/customer-cards.sql` in the Supabase SQL editor. In Supabase Auth, allow the local callback URL `http://localhost:3000/auth/callback` and the matching production URL. The account page reads only rows whose `owner_email` matches the authenticated, verified email; row-level security is enabled in the SQL schema.

The legacy import reads `migration/backup.sql` locally and excludes WordPress password hashes and administrator-owned pages. First run `npm run migrate:customer-cards` for a dry run. A write requires `--apply` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; use that key only for this local migration, then remove it from the file. The current backup produced zero safely attributable customer card pages, so do not run the write until a trusted card-to-email mapping is available. Existing WordPress pages without a clear owner are intentionally not assigned to accounts.
