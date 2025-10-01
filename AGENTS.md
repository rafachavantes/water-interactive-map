# Development Guidelines for AI Agents

This document contains important rules and patterns that AI agents should follow
when working on this Next.js project.

## Database Architecture Rule

### ⚠️ CRITICAL: Never Import Database Directly in Client Components

**Problem**: Next.js client components (marked with `'use client'`) run in the
browser and cannot import Node.js-only packages like `better-sqlite3`.

**Error Example**:

```
Module not found: Can't resolve 'fs'
./node_modules/better-sqlite3/lib/database.js:2:12
```

### ✅ Correct Pattern

**Client Side** (React Components):

- ❌ **NEVER DO**: `import { drawingDb } from '@/lib/database'`
- ✅ **DO**: Use `fetch()` API calls to communicate with server

```typescript
// ❌ Wrong - Direct database import in client component
"use client";
import { drawingDb } from "@/lib/database";

export function MyComponent() {
    const count = drawingDb.getPendingReviewCount(); // ERROR!
}

// ✅ Correct - API call in client component
"use client";
export function MyComponent() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            const response = await fetch("/api/drawings/approval?action=count");
            const data = await response.json();
            setCount(data.count);
        };
        fetchCount();
    }, []);
}
```

**Server Side** (API Routes):

- ✅ **DO**: Import and use database directly in `/src/app/api/` routes

```typescript
// ✅ Correct - Database import in API route
import { drawingDb } from "@/lib/database";

export async function GET() {
    const count = drawingDb.getPendingReviewCount();
    return NextResponse.json({ count });
}
```

### 🏗️ Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE                             │
│  React Components ('use client')                            │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Components    │    │   Hooks         │                │
│  │   - LayerFilters│    │   - usePersistent│               │
│  │   - DrawingPanel│    │   - useDrawing  │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           │ fetch() API calls     │ fetch() API calls      │
│           ▼                       ▼                        │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│                    HTTP REQUESTS                            │
│                                                             │
┌─────────────────────────────────────────────────────────────┐
│                     SERVER SIDE                             │
│  API Routes (/src/app/api/)                                 │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  /api/drawings  │    │ /api/drawings/  │                │
│  │  /route.ts      │    │ approval/route.ts│               │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           │ Direct imports OK     │ Direct imports OK      │
│           ▼                       ▼                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Database Layer                             │ │
│  │          /src/lib/database.ts                           │ │
│  │      (better-sqlite3, Node.js modules)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Service Layer Pattern

For organized API communication, use service classes:

```typescript
// /src/lib/drawingService.ts
class DrawingService {
    private baseUrl = "/api/drawings";

    async getPendingReviewCount(): Promise<number> {
        const response = await fetch(`${this.baseUrl}/approval?action=count`);
        const data = await response.json();
        return data.count;
    }

    async approveElement(
        elementId: string,
        reviewNotes?: string,
    ): Promise<void> {
        await fetch(`${this.baseUrl}/approval`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                elementId,
                action: "approve",
                reviewedBy: "current-admin",
                reviewNotes,
            }),
        });
    }
}

export const drawingService = new DrawingService();
```

### 🚫 Common Mistakes to Avoid

1. **Importing database in client components**
   ```typescript
   "use client";
   import { drawingDb } from "@/lib/database"; // ❌ Will cause build error
   ```

2. **Using Node.js modules in client components**
   ```typescript
   "use client";
   import fs from "fs"; // ❌ Will cause build error
   import path from "path"; // ❌ Will cause build error
   ```

3. **Mixing server and client code**
   ```typescript
   "use client";
   import { drawingDb } from "@/lib/database";

   export function Component() {
       // This won't work - database is server-side only
       const data = drawingDb.loadAllDrawings(); // ❌
   }
   ```

### 📋 Checklist for Database Operations

When adding new database functionality:

- [ ] Create API endpoint in `/src/app/api/`
- [ ] Import database only in API routes (server-side)
- [ ] Use `fetch()` calls in client components
- [ ] Consider adding method to service layer
- [ ] Test that build completes without Node.js module errors

### 🔍 Quick Debugging

If you see Node.js module errors:

1. Search for database imports in client files:
   `grep -r "from.*database" src/components src/app/page.tsx`
2. Check for other Node.js imports:
   `grep -r "require.*fs\|import.*fs" src/components`
3. Ensure all database operations go through API routes

### 📚 References

- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Module not found error docs](https://nextjs.org/docs/messages/module-not-found)

---

_This document should be updated whenever new database patterns are established
or when architecture changes are made._
