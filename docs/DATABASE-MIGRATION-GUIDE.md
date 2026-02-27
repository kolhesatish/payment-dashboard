# Database Migration & Deployment Guide

## Problem Encountered

When trying to migrate the `InstaCallbackSubmission` model to the database, the following error occurred:

```
Error: P3006
Migration `0_init` failed to apply cleanly to the shadow database.
Error:
ERROR: syntax error at or near "`"
```

### Root Cause

The Prisma migration files were using **MySQL syntax** (backticks for identifiers) but the database is **PostgreSQL**. This mismatch caused the migration to fail.

**Old Migration Format (MySQL):**
```sql
CREATE TABLE `insta_callback_submissions` (...)
```

**Correct Format (PostgreSQL):**
```sql
CREATE TABLE "insta_callback_submissions" (...)
```

---

## Solution Applied

### Step 1: Reset Migrations to PostgreSQL Format
```bash
rm -rf prisma/migrations
npx prisma generate
```

### Step 2: Create New Migration with Correct Syntax
Created `prisma/migrations/1_add_insta_callback_submission/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "insta_callback_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insta_callback_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insta_callback_submissions_email_idx" ON "insta_callback_submissions"("email");

-- CreateIndex
CREATE INDEX "insta_callback_submissions_createdAt_idx" ON "insta_callback_submissions"("created_at");
```

**Key Differences:**
- Use double quotes `"` instead of backticks `` ` ``
- Use `TIMESTAMP(3)` instead of `DATETIME(3)` for PostgreSQL
- Use `CONSTRAINT` syntax instead of MySQL constraint format

### Step 3: Update Middleware to Skip Auth on API Endpoint
Modified `middleware.ts`:

```typescript
import { auth } from "@/auth";

export const middleware = auth((req) => {
  // Allow unauthenticated access to insta callback endpoint
  if (req.nextUrl.pathname === "/api/insta-callback") {
    return;
  }
});

export const config = {
  matcher: [
    "/((?!api/insta-callback|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

This prevents the `UntrustedHost` auth error when calling the API endpoint.

### Step 4: Deploy Schema to Database
```bash
npx prisma db push
```

This directly syncs the schema to the database without creating new migration files.

### Step 5: Verify Deployment
```bash
curl -X POST http://localhost:3000/api/insta-callback \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"9876543210"}'
```

Expected response (201 Created):
```json
{
  "id":"cmm0ppu3e0000y0b5r0qvq9v7",
  "name":"Test",
  "email":"test@example.com",
  "phone":"9876543210",
  "createdAt":"2026-02-24T14:40:17.306Z",
  "updatedAt":"2026-02-24T14:40:17.306Z"
}
```

---

## Best Practices for Future Migrations

### ✅ DO:

1. **Always check your database provider** before creating migrations
   - PostgreSQL: Use double quotes `"`, `TIMESTAMP`, `SERIAL`
   - MySQL: Use backticks `` ` ``, `DATETIME`, `AUTO_INCREMENT`

2. **Use `npx prisma db push`** for development
   ```bash
   npx prisma db push
   ```

3. **Use `npx prisma migrate deploy`** for production
   ```bash
   npx prisma migrate deploy
   ```

4. **Exclude API endpoints from auth middleware** if they need public access
   ```typescript
   export const config = {
     matcher: ["/((?!api/public-endpoint|_next).*)",],
   };
   ```

5. **Test migrations locally first**
   ```bash
   npm run build
   npm run dev
   # Test API endpoints
   ```

### ❌ DON'T:

1. Don't manually modify migration files with incorrect SQL syntax
2. Don't mix database providers (MySQL/PostgreSQL) in the same codebase
3. Don't forget to regenerate Prisma client after schema changes
   ```bash
   npx prisma generate
   ```
4. Don't push to production without testing locally first

---

## Complete Workflow for New Features

When adding a new feature that requires database changes:

### 1. Update Schema
Edit `prisma/schema.prisma`:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  name      String
  email     String
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @default(now()) @map(name: "updated_at")

  @@index([email])
  @@index([createdAt])
  @@map(name: "new_features")
}
```

### 2. Generate Client Types
```bash
npx prisma generate
```

### 3: Push to Database (Development)
```bash
npx prisma db push
```

### 4: Create Migration (For Team/Production)
```bash
npx prisma migrate dev --name add_new_feature
```

### 5: Deploy (Production)
```bash
npx prisma migrate deploy
```

### 6: Test Locally
```bash
npm run build
npm run dev
# Test your API endpoints with curl or Postman
```

---

## Environment Variables to Check

Make sure these are set in `.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth config
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `P3006: Migration failed` | MySQL syntax in PostgreSQL DB | Check migration SQL syntax for database provider |
| `UntrustedHost` in API | Auth middleware blocking endpoint | Add endpoint to middleware config matcher |
| `PrismaClientKnownRequestError: Table does not exist` | Migration not deployed | Run `npx prisma db push` or `npx prisma migrate deploy` |
| `Property does not exist on PrismaClient` | Schema not regenerated | Run `npx prisma generate` |

---

## Checklist for Next Database Change

- [ ] Check database provider (PostgreSQL/MySQL)
- [ ] Update schema in `prisma/schema.prisma`
- [ ] Run `npx prisma generate`
- [ ] Test locally: `npm run dev`
- [ ] Run `npx prisma db push` (dev) or create migration (team)
- [ ] Test API endpoints
- [ ] Verify data in admin dashboard
- [ ] Run `npm run build` before deploying
- [ ] Deploy to Vercel: `npx vercel --prod`
- [ ] Test on production

---

## Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
- [NextAuth Troubleshooting](https://authjs.dev/guides/error#untrustedhost)
