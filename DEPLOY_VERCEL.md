# Vercel Deployment

## Required Environment Variables

Set these in the Vercel project settings:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT_BASE64=base64-encoded-service-account-json
```

Notes:

- `PORT` is not required on Vercel
- `FIREBASE_SERVICE_ACCOUNT_BASE64` should be the base64 of the entire Firebase service account JSON file
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` is only for local file-based development fallback
- The older split env vars are still supported as fallback, but base64 is the preferred deployment option

## Generate the Base64 Value

PowerShell:

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("admin-key.json"))
```

Node.js:

```bash
node -e "console.log(Buffer.from(require('fs').readFileSync('admin-key.json')).toString('base64'))"
```

## Build Behavior

This project uses:

```bash
npm run vercel-build
```

That command will:

1. Generate the Prisma client
2. Apply pending Prisma migrations with `prisma migrate deploy`
3. Build the TypeScript server

## Deployment Steps

1. Push the repository to GitHub, GitLab, or Bitbucket
2. Import the repository into Vercel
3. Add the required environment variables
4. Deploy

## Post-Deploy Checks

Verify:

- `/`
- `/api/v1/stats/public`
- an authenticated route using a valid Firebase token
- month finalization and rollback
