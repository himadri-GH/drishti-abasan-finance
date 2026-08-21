# Drishti Abasan Finance

Hosted financial management for the Drishti Abasan building complex. The app uses Next.js, Drizzle ORM, and Turso/libSQL, and deploys from GitHub to Vercel.

## Database setup

1. Create a database at [turso.tech](https://turso.tech) and copy its database URL and auth token.
2. Copy `.env.example` to `.env.local` and fill in both values.
3. Generate and apply the schema:

```bash
npm run db:generate
npm run db:migrate
```

The schema follows `Dristi Abason_Database Acrhitechture Scheme.docx`, including society, owner, unit, ownership contract, monthly charge, payment, expense, vendor/staff, and treasury snapshot tables.

## GitHub and Vercel

1. Create an empty GitHub repository and push this folder to it.
2. Import that repository into Vercel.
3. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel for Production, Preview, and Development.
4. Every push to the selected GitHub branch creates a deployment.

No local server is needed to use the deployed application. `npm run dev` is only for previewing changes before pushing.

## Commands

```bash
npm run dev       # local preview
npm run lint      # lint the project
npm run build     # production build check
```
