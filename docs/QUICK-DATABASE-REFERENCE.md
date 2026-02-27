# Quick Database Commands Reference

## Add New Database Model

### 1. Create Model
Add to `prisma/schema.prisma`:
```prisma
model YourModel {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now()) @map(name: "created_at")
  updatedAt DateTime @default(now()) @map(name: "updated_at")

  @@index([email])
  @@index([createdAt])
  @@map(name: "your_table_name")
}
```

### 2. Sync to Database
```bash
npx prisma generate   # Update types
npx prisma db push    # Push schema changes
```

### 3. Create API Route
```typescript
// app/api/your-endpoint/route.ts
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await prisma.yourModel.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### 4. Add to Admin Dashboard
Update `app/(protected)/admin/page.tsx`:
```typescript
try {
  const yourData = await prisma.yourModel.findMany({
    orderBy: { createdAt: "desc" },
  });
} catch (error) {
  console.error("Error fetching data:", error);
}
```

---

## Fix Common Issues

### Issue: `Table does not exist`
```bash
# Make sure schema is pushed
npx prisma db push

# Or deploy migration
npx prisma migrate deploy
```

### Issue: TypeScript errors with Prisma
```bash
# Regenerate Prisma client
npx prisma generate
```

### Issue: Migration conflicts
```bash
# Reset migrations (LOCAL ONLY - loses data)
rm -rf prisma/migrations
npx prisma generate
npx prisma db push
```

### Issue: API returns 500 Error
```bash
# 1. Check server logs
# 2. Run build to check for errors
npm run build

# 3. Check if table exists
npx prisma db push

# 4. Restart dev server
npm run dev
```

---

## Deployment Steps

### Before Deploying to Production

```bash
# 1. Build locally
npm run build

# 2. Check for errors
npm run lint

# 3. Push database schema
npx prisma db push

# 4. Test API endpoints
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# 5. Deploy to Vercel
npx vercel --prod
```

---

## Useful Prisma Commands

```bash
# View database GUI
npx prisma studio

# Check migration status
npx prisma migrate status

# Reset database (DELETES ALL DATA)
npx prisma migrate reset

# Show schema in SQL
npx prisma db push --print

# Generate updated types
npx prisma generate

# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply pending migrations
npx prisma migrate deploy
```

---

## PostgreSQL-Specific Syntax

Always use **double quotes** for identifiers:

```prisma
// ✅ CORRECT for PostgreSQL
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map(name: "created_at")
  
  @@map(name: "users")
}

// ❌ WRONG - MySQL syntax
// Use backticks: `users`
// Use DATETIME: @db.DateTime
// Use AUTO_INCREMENT: @default(autoincrement())
```

---

## Enable API Endpoint Without Auth

In `middleware.ts`:
```typescript
import { auth } from "@/auth";

export const middleware = auth((req) => {
  // Allow this endpoint without authentication
  if (req.nextUrl.pathname === "/api/public-endpoint") {
    return;
  }
});

export const config = {
  matcher: [
    "/((?!api/public-endpoint|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

And create the API route normally - it will skip auth checks.

---

## Database Connection Issues

### If `npx prisma db push` fails:

1. Check `.env` for correct `DATABASE_URL`
   ```bash
   echo $DATABASE_URL
   ```

2. Test connection
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

3. If using Neon (PostgreSQL), ensure IP is whitelisted

4. Check database is online (check Neon dashboard)

---

## Files Modified for Instant Callback Feature

These are the files that were created/modified for reference:

✅ **Created:**
- `components/modals/insta-callback-modal.tsx` - Modal form component
- `app/api/insta-callback/route.ts` - API endpoint
- `prisma/migrations/1_add_insta_callback_submission/migration.sql` - Database migration

✅ **Modified:**
- `prisma/schema.prisma` - Added InstaCallbackSubmission model
- `components/sections/hero-landing.tsx` - Added button and modal trigger
- `app/(protected)/admin/page.tsx` - Fetch and pass submissions to dashboard
- `components/admin/admin-dashboard-client.tsx` - Display submissions table
- `middleware.ts` - Allow unauthenticated access to callback API

---

For more details, see `DATABASE-MIGRATION-GUIDE.md`
