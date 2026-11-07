# Mistleblue

Mistleblue is a Next.js App Router storefront backed by a local JSON catalog. It does not require a database service.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Import a WordPress SQL backup

1. Place a local database text dump at `migration/backup.sql`, or pass a local file path to the migration command.
2. Run `npm run migrate:wordpress` or `npm run migrate:wordpress -- "C:\path\to\local-backup.sql"`.
3. The script replaces `data/products.json` with published `product`, `post`, and `page` records from `wppk_posts`.
4. Run `npm run build` to generate the catalog and product detail pages.

The marketplace displays entries whose type is `product`. Detail-page HTML is sanitized before it is rendered. Keep the SQL backup out of public folders and do not commit it unless the repository's data-handling policy allows it.

The migration reads only the local file path supplied to it. It does not connect to WordPress or a database server.

`data/products.json` currently contains example cards so the site can be built and previewed before the WordPress backup is available. Running the import replaces those examples.
