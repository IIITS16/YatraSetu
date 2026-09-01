# Inspector Side Development (Phase 2 - Sprint 2.1)

## 1. Frontend Routing & Layout
- `[/]` Update `Layout.jsx` so Inspectors see a different navigation menu (Dashboard, Heat Map, Inspections) instead of the Tourist menu.
- `[ ]` Add a role-based redirect so when an Inspector logs in, they are taken to `/inspector` instead of the tourist home page.
- `[ ]` Create the base `InspectorDashboard.jsx` page.

## 2. Database Schema Updates (`migrate.js`)
- `[ ]` Create `businesses` table (to normalize businesses from free-text reports).
- `[ ]` Create `inspections` table (to log raids/actions taken).
- `[ ]` Add `resolved_at` and `resolved_by` columns to the `reports` table.

## 3. Backend APIs
- `[ ]` `GET /api/inspector/dashboard` - Fetch summary stats (total pending reports, high-risk businesses).
- `[ ]` `GET /api/inspector/reports` - Fetch a feed of unresolved reports for review.

## 4. UI Implementation
- `[ ]` Build summary cards on the Inspector Dashboard.
- `[ ]` Build the "Recent Reports" feed.
