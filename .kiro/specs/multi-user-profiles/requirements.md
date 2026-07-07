# Requirements Document

## Introduction

Multi-user profiles adds lightweight user identity to fit-circle. Instead of a single shared view, each user (`im`, `mm`) gets their own namespaced URL space and isolated data. There is no password or authentication: selecting a user card on the login page sets a cookie, and all subsequent reads and writes are scoped to that user. Global content (exercises) remains shared. Books are per-user and live under `/<username>/books`. The feature also introduces a user management page for editing display names and avatars, updates the app header to show the current user, and extends the Oracle schema and dump script to cover the new `fc_users` table.

---

## Glossary

- **User**: A person identified by a slug-style `username` (e.g. `im`, `mm`). Stored as `{ _id, username, displayName, avatar }`.
- **Avatar**: An emoji character or image URL that visually identifies a User.
- **fc_user cookie**: A client-side browser cookie named `fc_user` whose value is the `username` of the currently selected User. No expiry.
- **Login Page**: The root `/` page rendered when no `fc_user` cookie is present; displays all User cards for selection.
- **User_Storage**: The storage abstraction (`getUserStorage()`) that reads and writes User records, backed by `data/users.json` or Oracle table `fc_users`.
- **Routine_Storage**: The existing storage abstraction for routines, now filtered by `userId`.
- **History_Storage**: The existing storage abstraction for history sessions, now filtered by `userId`.
- **AppHeader**: The shared navigation header component rendered on all per-user pages.
- **Middleware**: The Next.js middleware (`middleware.js`) at the project root that inspects the `fc_user` cookie and redirects accordingly.
- **User_Management_Page**: The global page at `/users` for listing and editing Users.
- **Seed Users**: The two pre-defined users `{ _id: "im", username: "im", displayName: "IM", avatar: "🏋️" }` and `{ _id: "mm", username: "mm", displayName: "MM", avatar: "🧘" }`.

---

## Requirements

### Requirement 1: User Data Model and Storage

**User Story:** As a developer, I want a User storage layer backed by JSON files or Oracle, so that user records are persisted and accessible across the application.

#### Acceptance Criteria

1. THE User_Storage SHALL store User records with fields `_id`, `username`, `displayName`, and `avatar`.
2. THE User_Storage SHALL seed the data store with the two Seed Users when no User records exist.
3. WHEN Oracle environment variables are set, THE User_Storage SHALL read and write User records from the `fc_users` table ordered by `id`.
4. WHEN Oracle environment variables are not set, THE User_Storage SHALL read and write User records from `data/users.json`.
5. THE `fc_users` Oracle table SHALL have the schema: `id VARCHAR2(64) PRIMARY KEY, data JSON NOT NULL`.
6. THE `dump:oracle` script SHALL include the `users` collection when dumping all collections.

---

### Requirement 2: Login Page (User Selection)

**User Story:** As a user, I want to see all available user profiles at the root URL, so that I can select my identity before accessing my personal data.

#### Acceptance Criteria

1. WHEN the `fc_user` cookie is absent and a request arrives at `/`, THE Middleware SHALL render the Login Page.
2. THE Login Page SHALL display one card per User, showing the User's `avatar` and `displayName`.
3. WHEN a user card is clicked, THE Login Page SHALL set the `fc_user` cookie to the selected `username` (client-side, no expiry).
4. WHEN the `fc_user` cookie is set, THEN THE Login Page SHALL navigate the browser to `/<username>/sessions`.
5. THE Login Page SHALL always display all Users returned by User_Storage regardless of which User is currently in the cookie.

---

### Requirement 3: Middleware Routing

**User Story:** As a user, I want the app to automatically send me to my personal sessions page after I log in, so that I do not have to manually type my URL.

#### Acceptance Criteria

1. WHEN a request arrives at `/` and the `fc_user` cookie is set, THE Middleware SHALL redirect the request to `/<username>/sessions` where `<username>` is the cookie value.
2. WHEN a request arrives at `/` and the `fc_user` cookie is absent, THE Middleware SHALL allow the request to proceed to the Login Page.
3. THE Middleware SHALL NOT intercept requests to routes under `/<username>/`, `/exercises`, `/users`, or `/api/`.

---

### Requirement 4: Per-User URL Structure

**User Story:** As a user, I want my sessions, routines, and history to live under my own URL prefix, so that deep links are always scoped to the correct user.

#### Acceptance Criteria

1. THE application SHALL serve the sessions (active workout) page at `/<username>/sessions`.
2. THE application SHALL serve the routines list page at `/<username>/routines`.
3. THE application SHALL serve the routine detail page at `/<username>/routines/[id]`.
4. THE application SHALL serve the history list page at `/<username>/history`.
5. THE application SHALL serve the history detail page at `/<username>/history/[id]`.
6. THE application SHALL serve the exercises page at `/exercises` with no `username` prefix.
7. THE application SHALL serve the books page at `/<username>/books` under the user's namespace.

---

### Requirement 5: Data Scoping — Routines

**User Story:** As a user, I want my routines to be private to my account, so that another user cannot see or modify my workout plans.

#### Acceptance Criteria

1. THE Routine_Storage SHALL accept a `userId` parameter on all read operations and return only records where `userId` matches.
2. THE Routine_Storage SHALL set the `userId` field to the current user's `username` on all write operations.
3. WHEN existing routine records in `data/routines.json` do not have a `userId` field, THE application SHALL treat those records as belonging to `userId: "im"`.
4. THE `GET /api/routines` endpoint SHALL accept a `userId` query parameter and return only routines matching that `userId`.
5. THE `POST /api/routines`, `PATCH /api/routines/[id]`, and `DELETE /api/routines/[id]` endpoints SHALL accept a `userId` field in the request body and scope all writes to that `userId`.

---

### Requirement 6: Data Scoping — History

**User Story:** As a user, I want my workout history to be private to my account, so that I see only my own completed sessions.

#### Acceptance Criteria

1. THE History_Storage SHALL accept a `userId` parameter on all read operations and return only records where `userId` matches.
2. THE History_Storage SHALL set the `userId` field to the current user's `username` on all write operations.
3. WHEN existing history records in `data/history.json` do not have a `userId` field, THE application SHALL treat those records as belonging to `userId: "im"`.
4. THE `GET /api/history` endpoint SHALL accept a `userId` query parameter and return only history sessions matching that `userId`.
5. THE `POST /api/history` and `PATCH /api/history/[id]` endpoints SHALL accept a `userId` field in the request body and scope all writes to that `userId`.

---

### Requirement 7: User API Endpoints

**User Story:** As a developer, I want REST API routes for managing users, so that the frontend can list, create, and update user records.

#### Acceptance Criteria

1. THE `GET /api/users` endpoint SHALL return the list of all Users from User_Storage.
2. THE `POST /api/users` endpoint SHALL create a new User record with the provided `username`, `displayName`, and `avatar` fields and return the created record.
3. IF a `POST /api/users` request is received with a `username` that already exists, THEN THE `POST /api/users` endpoint SHALL return a 409 Conflict response.
4. THE `PATCH /api/users/[id]` endpoint SHALL update the `displayName` and/or `avatar` fields of the User with matching `_id` and return the updated record.
5. IF a `PATCH /api/users/[id]` request is received for a `username` that does not exist, THEN THE `PATCH /api/users/[id]` endpoint SHALL return a 404 Not Found response.

---

### Requirement 8: User Management Page

**User Story:** As a user, I want a dedicated page to view and edit all user profiles, so that I can update a display name or swap an avatar at any time.

#### Acceptance Criteria

1. THE User_Management_Page at `/users` SHALL display a card for every User showing the User's `avatar` and `displayName`.
2. WHEN the edit button on a User card is activated, THE User_Management_Page SHALL open an inline dialog allowing edits to `displayName` and `avatar`.
3. THE User_Management_Page dialog SHALL accept an emoji character or an image URL as the `avatar` value.
4. WHEN the user confirms edits in the dialog, THE User_Management_Page SHALL call `PATCH /api/users/[id]` and update the displayed card with the response values.
5. WHEN the user cancels the dialog, THE User_Management_Page SHALL discard all unsaved changes.
6. THE User_Management_Page SHALL be accessible at `/users` with no `username` prefix.

---

### Requirement 9: AppHeader Update

**User Story:** As a user, I want the app header to show my identity and link me to my personal pages, so that I always know which profile is active and can navigate quickly.

#### Acceptance Criteria

1. THE AppHeader SHALL read the `fc_user` cookie client-side to determine the current `username`.
2. WHEN a `username` is present in the `fc_user` cookie, THE AppHeader SHALL display the current User's `avatar` and `displayName`.
3. THE AppHeader SHALL include navigation links: "Sessions" pointing to `/<username>/sessions`, "Routines" pointing to `/<username>/routines`, "History" pointing to `/<username>/history`, "Books" pointing to `/<username>/books`, and "Exercises" pointing to `/exercises`.
4. WHILE on a per-user page, THE AppHeader SHALL highlight the navigation link whose route prefix matches the current pathname.
5. WHEN no `username` is present in the `fc_user` cookie, THE AppHeader SHALL render without user-specific links and without the avatar/username display.

---

### Requirement 10: Data Isolation Correctness

**User Story:** As a user, I want assurance that my data is never mixed with another user's data, so that I can trust my fitness records are accurate and private.

#### Acceptance Criteria

1. WHEN a request is made to `/<username>/sessions`, THE application SHALL display only sessions belonging to that `username`.
2. WHEN a request is made to `/<username>/routines`, THE application SHALL display only routines belonging to that `username`.
3. WHEN a request is made to `/<username>/history`, THE application SHALL display only history records belonging to that `username`.
4. FOR ALL read API calls with a given `userId`, THE application SHALL return a response set that contains no records whose `userId` differs from the requested `userId`.
5. WHEN existing `im` user routine and history records are migrated to include `userId: "im"`, THE application SHALL preserve all field values of those records unchanged.
