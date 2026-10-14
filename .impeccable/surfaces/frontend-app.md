---
version: 1
slug: "frontend-app"
primary_target: "frontend/app"
related_targets: []
---

# PRO frontend: app shell + all role surfaces

Scope: the whole Next.js frontend (`frontend/`): login, three role dashboards, the project repository/search, project detail, and CRUD screens for all 13 entities. Visitor mode: **Operate**.

Audience and job: students, faculty and admins equally (see PRODUCT.md). The reviewer grades it tomorrow (2026-10-14). First screen: login → that role's dashboard. Role gating is UI-only: admins get full CRUD; faculty evaluate and manage the teams they guide; students manage their own team and projects. Everyone can browse the repository.

Must feel right: data-first, gradeable, every entity reachable, no raw database errors. Must not feel like a shadcn admin template or be too flashy to grade.

## Direction contract

THESIS: PRO is the department's shelf of bound final-year reports, filed by academic year. It refuses the white-sidebar KPI-card admin template: the shell is bookcloth, and the repository's first view is the year shelf.

OWN-WORLD: Maroon bookcloth (#5e1a24) top bar and drawer surfaces. Gold foil (#c9a24a) is for the wordmark, the active-tab rule and foil-stamped headings only. Black and navy cloth mark status. Report-paper ground (#f6f5f2, cool, not cream), white sheets for tables, hairline rules. Status maps to binding: completed = maroon, submitted = black cloth, ongoing = navy, rejected = grey. Atkinson Hyperlegible Next for all UI, Atkinson Hyperlegible Mono for IDs, years and scores (tabular). Libre Caslon Display only as foil type for the wordmark and certificate titles. Raised from the declined hand: one fixed hue per entity family (Acetate Tab Manual); hovering a relation lights its related rows and dims the rest (Transit Diagram); tabular numerals in tight columns (Datamatics).

STORY: The visitor signs in as their role and lands on their desk. Students see their team, their reports and their history. Faculty see guided teams and reports awaiting evaluation. Admins see the shelf plus the ledger of every table. From anywhere they can pull a report off the shelf, read its record (team, guide, members, technologies, domains, categories, evaluations) and act on it.

FIRST VIEWPORT: A 60px maroon top bar: the gold PRO wordmark, the main nav (Repository, Teams, People, Evaluations, Subjects, plus Admin for admins), the role stamp and the user. Below it on paper: the page title and the role's primary action at right. Then the year shelf: a full-width strip of spines, one per project, coloured by status, grouped and labelled by academic year, standing on a wooden ledge. Under it, the filterable projects table (search, domain, technology, department, year). Signature move: the shelf. Clicking a spine opens that report; hovering one highlights its table row.

FORM: Bound Report Shelf, ranked #1 on my grounded list (IMPECCABLE'S PICK). Seed key f039a50f.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Accessibility standard assumed WCAG 2.2 AA (PRODUCT.md).
