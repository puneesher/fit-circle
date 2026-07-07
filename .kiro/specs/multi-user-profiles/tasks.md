# Implementation Plan: Multi-User Profiles

## Overview

Add lightweight cookie-based user identity to fit-circle. Each user gets a namespaced URL space (`/<username>/…`) with isolated routine, history, and books data. No passwords — selecting a user card writes a `fc_user` cookie and all reads/writes are scoped to that username. Exercises remain global (no username prefix).

Implementation order: storage layer → seed data → API routes → middleware → route restructure → page migrations → login page → AppHeader → /users page → dump script.

## Tasks

- [x] 1. Add `fc_users` Oracle table DDL and `getUserStorage()` factory
  - [x] 1.1 Add `fc_users` DDL to `oracle-schema.js`
    - Add `fc_users` entry to `TABLE_DDLS`: `CREATE TABLE fc_users (id VARCHAR2(64) PRIMARY KEY, data JSON NOT NULL)`
    - Add `users` entry to `MIGRATIONS` map with `table: "fc_users"` and a `insertUserRows` function
    - Write `insertUserRows(connection, items)` that inserts each user with `id: item._id, data: JSON.stringify(item)`
    - Add `users` entry to the existing `inspectOracleStorage` tables loop so it is visible in schema inspection
    - _Requirements: 1.3, 1.5_

  - [x] 1.2 Add `users` collection to `oracle-storage.js` `TABLE_CONFIG`
    - Write `writeUserRows(connection, items)` using `DELETE FROM fc_users` then INSERT loop with `id: item._id`
    - Add `users: { table: "fc_users", orderBy: "id", writeRows: writeUserRows }` to `TABLE_CONFIG`
    - _Requirements: 1.3_

  - [x] 1.3 Add `getUserStorage()` to `src/lib/storage/index.js`
    - Add `export function getUserStorage() { return createStorage("users"); }` alongside the existing factories
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Add `readByUser(userId)` to both storage adapters
  - [x] 2.1 Implement `readByUser` on `JsonFileStorage`
    - Add `async readByUser(userId)` method to the object returned by `createJsonFileStorage`
    - Implementation: `const items = await this.readAll(); return items.filter(item => (item.userId ?? "im") === userId);`
    - The `?? "im"` fallback handles legacy records without a `userId` field (Req 5.3 / 6.3)
    - _Requirements: 5.1, 5.3, 6.1, 6.3, 10.4, 10.5_

  - [ ]* 2.2 Write property test for `readByUser` filter logic (P6, P8)
    - **Property 6: readByUser returns only matching userId records**
    - **Property 8: Legacy records without userId belong to "im" only**
    - **Validates: Requirements 5.1, 5.3, 6.1, 6.3, 10.4, 10.5**
    - Install `fast-check` as a dev dependency; use `vitest` (add as dev dep) for the test runner
    - Create `src/lib/storage/__tests__/json-file-storage.test.js`
    - Tag: `// Feature: multi-user-profiles, Property 6` and `// Property 8`

  - [x] 2.3 Implement `readByUser` on `OracleStorage`
    - Add `async readByUser(userId)` to the object returned by `createOracleStorage`
    - For `routines` and `history` tables use:
      ```sql
      SELECT JSON_SERIALIZE(data RETURNING CLOB) AS data
      FROM <table>
      WHERE JSON_VALUE(data, '$.userId') = :userId
         OR (JSON_VALUE(data, '$.userId') IS NULL AND :userId = 'im')
      ORDER BY <orderBy>
      ```
    - Bind `userId` twice (once for the equality check, once for the `'im'` check)
    - For `users` and `exercises` tables (no `userId` field) fall through to `readAll()` so the method always exists on all adapters
    - _Requirements: 5.1, 6.1, 10.4_

  - [ ]* 2.4 Write property test for `readByUser` userId preservation on write (P7)
    - **Property 7: userId is preserved on write**
    - **Validates: Requirements 5.2, 6.2**
    - Add test to `src/lib/storage/__tests__/json-file-storage.test.js` using a temp file approach
    - Tag: `// Feature: multi-user-profiles, Property 7`

- [x] 3. Create `data/users.json` seed file
  - [x] 3.1 Write `data/users.json` with seed users
    - Create file with content:
      ```json
      [
        { "_id": "im", "username": "im", "displayName": "Iñaqui Medina", "avatar": "🏋️" },
        { "_id": "mm", "username": "mm", "displayName": "Mayte Medina", "avatar": "🧘" }
      ]
      ```
    - `JsonFileStorage` will serve this automatically via `readAll()` when the file exists; no extra seeding code is needed in the adapter
    - _Requirements: 1.2, 1.4_

  - [ ]* 3.2 Write property test for User record round-trip (P1)
    - **Property 1: User record round-trip preserves all fields**
    - **Validates: Requirements 1.1**
    - Add test to `src/lib/storage/__tests__/json-file-storage.test.js`
    - Tag: `// Feature: multi-user-profiles, Property 1`

- [x] 4. Add and update API routes
  - [x] 4.1 Create `GET /api/users` and `POST /api/users` route
    - Create `src/app/api/users/route.js`
    - `GET`: return `getUserStorage().readAll()` as JSON
    - `POST`: validate `username`, `displayName`, `avatar` are present; check for duplicate `username` → 409 `{ error: "username already exists" }`; create record with `_id: username`; write via `writeAll`; return 201 with the new record
    - Validate `userId` is not required (users collection has no `userId` field)
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 4.2 Write property test for `POST /api/users` response completeness (P11)
    - **Property 11: POST /api/users creates complete record**
    - **Validates: Requirements 7.2**
    - Create `src/app/api/users/__tests__/route.test.js`
    - Mock `getUserStorage` and assert 201 body contains all submitted fields
    - Tag: `// Feature: multi-user-profiles, Property 11`

  - [x] 4.3 Create `PATCH /api/users/[id]` route
    - Create `src/app/api/users/[id]/route.js`
    - `PATCH`: find user by `_id === id`; 404 `{ error: "user not found" }` if missing; update `displayName` and/or `avatar`; write all; return updated record
    - _Requirements: 7.4, 7.5_

  - [ ]* 4.4 Write property test for `PATCH /api/users/[id]` field update (P12)
    - **Property 12: PATCH /api/users updates displayName and avatar**
    - **Validates: Requirements 7.4**
    - Add test to `src/app/api/users/__tests__/route.test.js`
    - Assert `_id` and `username` are unchanged; updated fields match submitted values
    - Tag: `// Feature: multi-user-profiles, Property 12`

  - [x] 4.5 Update `GET /api/routines` to accept `?userId` query param
    - In `src/app/api/routines/route.js`, read `request.nextUrl.searchParams.get("userId")`
    - If absent → 400 `{ error: "userId query param is required" }`
    - Call `getRoutineStorage().readByUser(userId)` instead of `readAll()`
    - _Requirements: 5.4_

  - [x] 4.6 Update `POST /api/routines`, `PATCH /api/routines/[id]`, `DELETE /api/routines/[id]` to scope by `userId`
    - In `src/app/api/routines/route.js` `POST`: require `userId` in body → 400 if missing; stamp `userId` on the new record before writing
    - In `src/app/api/routines/[id]/route.js` add `PATCH` and `DELETE` handlers: read `userId` from body; scope reads via `readByUser`; write back the full collection with `writeAll`
    - _Requirements: 5.5_

  - [ ]* 4.7 Write property test for GET /api/routines cross-user isolation (P9)
    - **Property 9: GET /api/routines returns no cross-user records**
    - **Validates: Requirements 5.4, 10.4**
    - Add test to `src/app/api/routines/__tests__/route.test.js`
    - Tag: `// Feature: multi-user-profiles, Property 9`

  - [x] 4.8 Update `GET /api/history` to accept `?userId` query param
    - In `src/app/api/history/route.js`, read `request.nextUrl.searchParams.get("userId")`
    - If absent → 400 `{ error: "userId query param is required" }`
    - Call `getHistoryStorage().readByUser(userId)` for the `history` list
    - Also call `getHistoryStorage().readByUser(userId)` when fetching `activeSession` (filter status `"active"`)
    - _Requirements: 6.4_

  - [x] 4.9 Update `POST /api/history` and `PATCH /api/history/[id]` to scope by `userId`
    - In `src/app/api/history/route.js` `POST`: require `userId` in body → 400 if missing; pass `userId` through to `startWorkoutDay(routineId, userId)`
    - Update `startWorkoutDay` in `src/lib/workout.js` to accept `userId` param and stamp it on the new session record; also pass `userId` to `getRoutineStorage().readByUser(userId)` and `getHistoryStorage().readByUser(userId)` calls within the function
    - In `src/app/api/history/[id]/route.js` `PATCH`: pass `userId` from body into all `workout.js` calls that write history (end, cancel, delete, completeExercise, setExerciseWeight, editCompletedItem); update those functions to accept and propagate `userId`
    - _Requirements: 6.5_

  - [ ]* 4.10 Write property test for write operations stamping userId (P10)
    - **Property 10: Write operations scope userId correctly**
    - **Validates: Requirements 5.5, 6.5**
    - Add test to `src/app/api/history/__tests__/route.test.js`
    - Tag: `// Feature: multi-user-profiles, Property 10`

- [x] 5. Checkpoint — storage and API layer
  - Ensure all tests pass. Verify `readByUser` returns filtered data. Verify the three `/api/users` endpoints respond correctly with mock storage. Ask the user if questions arise.

- [x] 6. Create `middleware.js` at the project root
  - [x] 6.1 Write `middleware.js`
    - Create `/Users/timedina/Documents/timj/Code/Next/fit-circle/fit-circle/middleware.js`
    - Export `middleware(request)` that: checks `pathname !== "/"` → return `NextResponse.next()`; reads `request.cookies.get("fc_user")?.value`; if set → `NextResponse.redirect(new URL(\`/${username}/sessions\`, request.url))`; else → `NextResponse.next()`
    - Export `config = { matcher: ["/"] }` so Next.js only invokes this for the root path
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 6.2 Write property test for middleware redirect behavior (P4, P5)
    - **Property 4: Middleware redirects to correct per-user URL**
    - **Property 5: Middleware passes through for all non-root paths**
    - **Validates: Requirements 3.1, 3.3**
    - Create `middleware.test.js` at project root (or `__tests__/middleware.test.js`)
    - Mock `NextRequest` with a cookie and without; assert redirect URL and pass-through
    - Tag: `// Feature: multi-user-profiles, Property 4` and `// Property 5`

- [ ] 7. Restructure routes: rename `(fit)` group to `[username]` dynamic segment
  - [x] 7.1 Create `src/app/[username]/` layout
    - Create `src/app/[username]/layout.js`
    - Accept `{ children, params }` props; resolve `const { username } = await params`
    - Render `<AppHeader username={username} />` above `{children}`
    - This replaces `src/app/(fit)/layout.js` which only rendered `<AppHeader />` with no props
    - _Requirements: 4.1–4.5, 9.1_

  - [x] 7.2 Move sessions page: `(fit)/page.js` → `[username]/sessions/page.js`
    - Create `src/app/[username]/sessions/page.js`
    - Accept `{ params }`, resolve `const { username } = await params`
    - Call `getWorkoutHomeData(username)` (pass userId) and forward to `PageClient` with a `username` prop
    - Update `PageClient` to accept and forward `username` in all `/api/history` and `/api/routines` fetch calls as `userId` query param or body field
    - _Requirements: 4.1, 5.1–5.5, 6.1–6.5_

  - [x] 7.3 Move routines list page: `(fit)/routines/page.js` → `[username]/routines/page.js`
    - Create `src/app/[username]/routines/page.js`
    - Accept `{ params }`, resolve `const { username } = await params`
    - Call `getRoutineStorage().readByUser(username)` instead of `readAll()`
    - Pass `username` to `SortableRoutineList` so it can include `userId` in reorder API calls
    - _Requirements: 4.2, 5.1_

  - [x] 7.4 Move routine detail page: `(fit)/routines/[id]/page.js` → `[username]/routines/[id]/page.js`
    - Create `src/app/[username]/routines/[id]/page.js`
    - Accept `{ params }`, resolve `const { username, id } = await params`
    - Update `href` for the "Next →" link to use `/${username}/routines/${nextRoutine._id}`
    - Update `getRoutineWithExercises` and `getNextRoutine` calls to accept and pass `userId` (update those lib functions to call `readByUser` instead of `readAll`)
    - _Requirements: 4.3, 5.1_

  - [x] 7.5 Move history list page: `(fit)/history/page.js` → `[username]/history/page.js`
    - Create `src/app/[username]/history/page.js`
    - Accept `{ params }`, resolve `const { username } = await params`
    - Call `getWorkoutHistory(username)` — update `src/lib/workout.js` to accept `userId` and call `getHistoryStorage().readByUser(userId)`
    - Update session `href` links to `/${username}/history/${session._id}`
    - _Requirements: 4.4, 6.1_

  - [x] 7.6 Move history detail page: `(fit)/history/[id]/page.js` and `page-client.js` → `[username]/history/[id]/`
    - Create `src/app/[username]/history/[id]/page.js` and `page-client.js`
    - Accept `{ params }`, resolve `const { username, id } = await params`
    - Update `getWorkoutSession(id)` to accept `userId` if needed for validation; pass `username` to `HistoryDetailClient`
    - Update back-links inside `HistoryDetailClient` to use `/${username}/history`
    - _Requirements: 4.5, 6.1_

  - [x] 7.7 Move books page: `app/books/page.js` → `[username]/books/page.js`
    - Create `src/app/[username]/books/page.js`
    - Accept `{ params }`, resolve `const { username } = await params`
    - Books are currently unscoped — for now pass `username` as a prop for display but keep reading from the shared `books` collection (books scoping is cosmetic, not data-isolated like routines/history)
    - Update any back-links or hrefs inside the books page to use `/${username}/books`
    - Remove or repurpose `src/app/books/` (the old location outside the fit group)
    - _Requirements: 4.7_

  - [ ] 7.8 Delete the old `(fit)` route group and old `books/` directory
    - Remove `src/app/(fit)/` and `src/app/books/` after confirming all pages have been migrated
    - _Requirements: 4.1–4.7_

- [x] 8. Create the login page at `/`
  - [x] 8.1 Write `src/app/page.js` (server component)
    - Import `getUserStorage` and fetch all users
    - Render `<LoginClient users={users} />`
    - If storage throws, propagate (Next.js will show 500)
    - _Requirements: 2.1, 2.5_

  - [x] 8.2 Write `src/app/login-client.js` (client component)
    - `"use client"` directive
    - Accept `{ users }` prop; for each user render a card showing `user.avatar` and `user.displayName`
    - On card click: set `document.cookie = \`fc_user=${username}; path=/\``; call `router.push(\`/${username}/sessions\`)`
    - Use `useRouter` from `next/navigation`
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 8.3 Write property test for LoginClient card rendering (P2)
    - **Property 2: Login page renders one card per user**
    - **Validates: Requirements 2.2, 2.5**
    - Create `src/app/__tests__/login-client.test.js`
    - Use `@testing-library/react`; render with arbitrary-length user arrays; assert card count equals user count and each shows correct avatar/displayName
    - Tag: `// Feature: multi-user-profiles, Property 2`

  - [ ]* 8.4 Write property test for cookie + navigation targeting (P3)
    - **Property 3: Cookie navigation targets correct URL**
    - **Validates: Requirements 2.3, 2.4**
    - Add test in `src/app/__tests__/login-client.test.js`
    - Mock `document.cookie` setter and `router.push`; fire click for arbitrary username; assert cookie value and push path
    - Tag: `// Feature: multi-user-profiles, Property 3`

- [ ] 9. Update `AppHeader` to show user identity and scoped nav links
  - [ ] 9.1 Refactor `AppHeader` to accept a `username` prop and fetch user data server-side
    - Convert `src/components/AppHeader.js` to a server component shell that accepts `username` prop
    - When `username` is present: call `getUserStorage().readAll()` and find the matching user for `avatar` and `displayName`
    - Extract the `usePathname` active-link logic into a `"use client"` sub-component `AppHeaderNav`
    - Pass nav links as `/<username>/sessions`, `/<username>/routines`, `/<username>/history`, `/<username>/books`, `/exercises` when `username` is present
    - When `username` is absent (e.g. on `/users` page), render header without user-specific links
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

  - [ ]* 9.2 Write property test for AppHeader nav link hrefs (P13)
    - **Property 13: AppHeader nav links contain correct username**
    - **Validates: Requirements 9.2, 9.3**
    - Create `src/components/__tests__/AppHeader.test.js`
    - Render `AppHeaderNav` with arbitrary `username` values; assert Sessions/Routines/History hrefs start with `/${username}/`
    - Tag: `// Feature: multi-user-profiles, Property 13`

  - [ ]* 9.3 Write property test for AppHeader active link highlighting (P14)
    - **Property 14: AppHeader highlights exactly one nav link matching current route**
    - **Validates: Requirements 9.4**
    - Add test in `src/components/__tests__/AppHeader.test.js`
    - Mock `usePathname` with various paths; assert exactly one `aria-current="page"` link whose href matches the path prefix
    - Tag: `// Feature: multi-user-profiles, Property 14`

- [ ] 10. Checkpoint — routing, login, and header
  - Ensure all tests pass. Manually verify: `/` shows user cards, clicking a card sets the cookie and redirects, `/<username>/sessions` loads with correct user nav, header shows avatar and displayName. Ask the user if questions arise.

- [ ] 11. Create `/users` management page
  - [ ] 11.1 Write `src/app/users/page.js` (server component)
    - Fetch `getUserStorage().readAll()` and pass to `UsersClient`
    - No `username` prefix in route; global page (Req 8.6)
    - _Requirements: 8.1, 8.6_

  - [ ] 11.2 Write `src/app/users/users-client.js` (client component)
    - `"use client"` directive
    - Render a card per user showing `avatar` and `displayName` with an Edit button
    - On Edit: open an inline dialog pre-filled with current `displayName` and `avatar`
    - Dialog accepts an emoji character or image URL for avatar (text input)
    - On Confirm: call `PATCH /api/users/${user._id}` with `{ displayName, avatar }`; update local state with response values
    - On Cancel: discard unsaved changes without any API call
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 12. Update `dump:oracle` script to include `users` collection
  - [ ] 12.1 Update `scripts/dump-oracle.mjs` to include `users`
    - Add `"users"` to the `allCollections` array: `["exercises", "routines", "history", "books", "users"]`
    - Add `users: \`SELECT data FROM fc_users ORDER BY id\`` to the `queries` map
    - Add `--users-only` flag support (add `if (process.argv.includes("--users-only")) only.add("users")`)
    - Add corresponding `dump:oracle:users` npm script to `package.json`: `"dump:oracle:users": "node scripts/dump-oracle.mjs --users-only"`
    - _Requirements: 1.6_

- [ ] 13. Final checkpoint — full integration
  - Ensure all tests pass. Verify end-to-end: login → sessions → start workout → complete exercise → history shows only that user's records. Switch to second user and confirm data isolation. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The `?? "im"` fallback in `readByUser` handles all legacy records without needing to mutate JSON files
- `readByUser` must be added to all storage adapter types even for collections that don't use `userId` (exercises, books, users) — default to calling `readAll()` for those so the interface is uniform
- Property tests use `fast-check` for generation; add it alongside `vitest` in `devDependencies`
- `AppHeader` keeps `"use client"` only in the `AppHeaderNav` sub-component; the shell can be a server component receiving `username` from the layout's `params`
- After task 7.7, delete `src/app/(fit)/` entirely — do not leave it alongside the new `[username]/` tree

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1", "2.3", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.4", "3.2", "4.1", "4.3", "4.5", "4.6", "4.8", "4.9", "6.1"] },
    { "id": 3, "tasks": ["4.2", "4.4", "4.7", "4.10", "6.2", "7.1"] },
    { "id": 4, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "8.1", "8.2"] },
    { "id": 5, "tasks": ["7.8", "8.3", "8.4", "9.1", "11.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "11.2", "12.1"] }
  ]
}
```
