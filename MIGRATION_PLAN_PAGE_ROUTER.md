# Migration Plan: App Router to Page Router

## Why Migrate?

- **Simpler routing for static export**: Page Router was designed for static sites
- **Direct param access**: `router.query.roomId` instead of complex URL parsing
- **Less boilerplate**: One file per route instead of server + client wrappers
- **Better DX**: No need for "use client" directives or splitting components

## Current Structure (App Router)

```
app/
├── layout.tsx                    → Root layout
├── page.tsx                      → Homepage (client component)
├── not-found.tsx                 → 404 handler (client component)
└── rooms/
    └── [roomId]/
        ├── page.tsx              → Server component wrapper
        └── room-page-client.tsx  → Client wrapper that extracts roomId
```

## Target Structure (Page Router)

```
pages/
├── _app.tsx                      → Root layout/app wrapper
├── _document.tsx                 → HTML document structure
├── index.tsx                     → Homepage
├── 404.tsx                       → 404 handler
└── rooms/
    └── [roomId].tsx              → Room page (gets roomId from router.query)
```

## Migration Steps

### 1. Create Page Router Structure

- [ ] Create `pages/` directory
- [ ] Create `pages/_app.tsx` (migrate from `app/layout.tsx`)
- [ ] Create `pages/_document.tsx` (for HTML structure)
- [ ] Create `pages/index.tsx` (migrate from `app/page.tsx`)
- [ ] Create `pages/404.tsx` (migrate from `app/not-found.tsx`)
- [ ] Create `pages/rooms/[roomId].tsx` (merge room-page-client + poker-room logic)

### 2. Update Configuration

- [ ] Update `next.config.mjs` if needed (Page Router handles static export better)
- [ ] Verify `tsconfig.json` paths work with Page Router

### 3. Update Components

- [ ] Keep `components/` directory as-is (components work with both routers)
- [ ] Update imports if needed (should be minimal)
- [ ] Remove App Router-specific features (no changes needed, components are clean)

### 4. Update Styles

- [ ] Move `app/globals.css` → `styles/globals.css` (or import in `_app.tsx`)
- [ ] Keep existing Tailwind configuration

### 5. Remove App Router Files

- [ ] Delete `app/` directory after verification
- [ ] Delete `app/rooms/[roomId]/room-page-client.tsx`

### 6. Test

- [ ] Test dev mode: `npm run dev`
- [ ] Test production build: `npm run build`
- [ ] Test static export output in `out/` directory
- [ ] Verify routes work: `/`, `/rooms/[roomId]`
- [ ] Test localStorage persistence
- [ ] Test WebSocket connections
- [ ] Test 404 handling

## Key Code Changes

### pages/_app.tsx

```typescript
import "@/styles/globals.css"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

### pages/rooms/[roomId].tsx

```typescript
import { useRouter } from "next/router"
import { PokerRoom } from "@/components/poker-room"

export default function RoomPage() {
  const router = useRouter()
  const { roomId } = router.query

  if (!roomId || typeof roomId !== "string") {
    return null // or loading state
  }

  return <PokerRoom roomId={roomId} onExit={() => router.push("/")} />
}
```

## Benefits After Migration

1. **Simpler code**: Remove intermediate wrappers
2. **Faster development**: No more "use client" confusion
3. **Better static export**: Page Router is optimized for this
4. **Clearer architecture**: One file per route
5. **Direct param access**: No URL parsing needed

## Rollback Plan

If issues arise:
- Keep App Router in a separate branch
- Git revert the migration commit
- Both routers can coexist temporarily if needed

## Timeline

- Migration: ~30 minutes
- Testing: ~15 minutes
- Total: ~45 minutes

