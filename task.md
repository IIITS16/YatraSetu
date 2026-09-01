# Inspector Side Development (Phase 2 - Sprint 2.1)

## 1. Frontend Routing & Layout
- `[x]` Update `Layout.jsx` so Inspectors see a different navigation menu (Dashboard, Heat Map, Inspections) instead of the Tourist menu.
- `[x]` Add a role-based redirect so when an Inspector logs in, they are taken to `/inspector` instead of the tourist home page.
- `[x]` Create the base `InspectorDashboard.jsx` page.

## 2. Database Schema Updates (`migrate.js`)
- `[ ]` Create `businesses` table (to normalize businesses from free-text reports).
- `[ ]` Create `inspections` table (to log raids/actions taken).
- `[x]` Add `reviewed_at`, `reviewed_by`, and `reviewer_notes` columns to the `reports` table.

## 3. Backend APIs
- `[x]` `GET /api/inspector/dashboard` - Fetch summary stats (total pending reports, high-risk businesses).
- `[x]` `GET /api/inspector/reports` - Fetch a feed of unresolved reports for review.
- `[x]` `PATCH /api/inspector/reports/:id/review` - Update report status.

## 4. UI Implementation
- `[x]` Build summary cards on the Inspector Dashboard.
- `[x]` Build the "Recent Reports" feed.
- `[x]` Build the full `InspectorReports.jsx` view with review modal.
