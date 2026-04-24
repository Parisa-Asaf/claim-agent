# Claim Agent - Member 4 Only

This project contains only the required Member 4 features:

1. Automated Statute Lookup
2. Currency & Settlement Engine
3. Global Search & Filter Engine
4. Automated Outcome Reports

No OpenAI API key is required. Statute lookup uses your own statute database, and settlement evaluation uses local calculation rules.

## Run

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Pages

```txt
/          Member 4 feature UI
/statutes  Add/edit/delete statute records
/claims    Add/delete claim records for global search
```

## Simple Claim Numbers

Claims have both a hidden database id and a simple `claimNumber`.
Use the simple number in the UI:

```txt
Claim #1
Claim #2
Claim #3
```

You can use the number in:

```txt
Statute Lookup optional Claim #
Currency & Settlement optional Claim #
Outcome Report Claim #
Global Search keyword box
```

## Suggested test flow

1. Go to `/statutes` and add at least one statute rule.
2. Go to `/claims` and add one claim.
3. Go to `/` and test STATUTE with the Claim #.
4. Test CURRENCY with the same Claim #.
5. Test SEARCH using the company name or Claim #.
6. Test REPORT using the Claim # and download the PDF.
