# Baromètre DH

Confidential reporting platform for gender-based violence in the Democratic Republic of the Congo. Built for La Dignité Humaine Asbl by Popuzar LLC.

Live: https://barometre-dh.vercel.app

## What it does

- A woman or girl fills in a short confidential form, in French or Kiswahili. She can stay anonymous or leave a trusted contact.
- La Dignité Humaine receives the report and refers it to a partner organisation in the right province.
- Public pages list rights, emergency numbers, support organisations and aggregate statistics.
- A quick-exit button closes the page and redirects to a neutral site.

It covers domestic violence, gender-based violence and violence linked to elections. It is not an emergency service, and the site says so.

## How the data is protected

- Personal details in a report are encrypted in the application with AES-256-GCM before they reach the database (`lib/crypto.ts`).
- Evidence files go to private blob storage.
- Three roles: admin, staff, partner. A partner only sees the cases assigned to it.
- Every read of a case is written to an access log.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma on Postgres, NextAuth, next-intl (French and Kiswahili), Vercel Blob, Resend for assignment emails, Zod for validation.

## Local dev

```bash
pnpm install
cp .env.example .env    # fill DATABASE_URL, AUTH_SECRET, CASE_ENCRYPTION_KEY (openssl rand -base64 32)
pnpm db:push
pnpm dev
```

## License

MIT
