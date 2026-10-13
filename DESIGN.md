---
name: "PRO: Project Online Repository"
description: "The department's shelf of bound final-year reports, filed by academic year."
colors:
  cloth: "#5e1a24"
  cloth-deep: "#47121b"
  cloth-raised: "#6f2330"
  cloth-ink: "#f3e9da"
  cloth-ink-muted: "#d9c3b4"
  foil: "#c9a24a"
  foil-bright: "#e0bd6a"
  paper: "#f6f5f2"
  sheet: "#ffffff"
  sheet-tint: "#faf9f6"
  ink: "#1b1a1c"
  ink-2: "#3b383d"
  muted: "#5f5a62"
  rule: "#dedad6"
  rule-soft: "#ebe8e4"
  field-rule: "#cfc9c3"
  lit-row: "#fbf4e4"
  ledge: "#8a6b44"
  ledge-dark: "#6d5233"
  st-completed: "#6b1f2b"
  st-submitted: "#17171a"
  st-ongoing: "#23365a"
  st-rejected: "#5f5b57"
  h-project: "#6b1f2b"
  h-project-bg: "#f5e8ea"
  h-team: "#2e5a45"
  h-team-bg: "#e4efe8"
  h-people: "#23365a"
  h-people-bg: "#e5eaf3"
  h-subject: "#7a5a12"
  h-subject-bg: "#f4ecd9"
  h-eval: "#4b3a7a"
  h-eval-bg: "#ece8f4"
  danger: "#b42318"
  danger-bg: "#fdecea"
  ok-bg: "#e6f2ea"
  focus: "#b8862a"
typography:
  display:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "52px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.005em"
  foil-title:
    fontFamily: "Libre Caslon Display, Georgia, serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Atkinson Hyperlegible Next, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  numeral:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
rounded:
  spine: "2px"
  md: "6px"
  lg: "8px"
  pill: "999px"
spacing:
  gutter: "32px"
  gutter-compact: "20px"
  bar-height: "60px"
  grid-gap: "20px"
  section: "32px"
  field-gap: "14px"
components:
  button-primary:
    backgroundColor: "{colors.cloth}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 15px"
    height: "38px"
  button-primary-hover:
    backgroundColor: "{colors.cloth-deep}"
    textColor: "#ffffff"
  button-quiet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 15px"
    height: "38px"
  button-quiet-hover:
    backgroundColor: "{colors.sheet-tint}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0 15px"
    height: "38px"
  button-text:
    textColor: "{colors.ink-2}"
    padding: "0 6px"
    height: "30px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "38px"
  top-bar:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.cloth-ink}"
    height: "{spacing.bar-height}"
    padding: "0 32px"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.lg}"
    padding: "20px 22px"
  chip-project:
    backgroundColor: "{colors.h-project-bg}"
    textColor: "{colors.h-project}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
  chip-team:
    backgroundColor: "{colors.h-team-bg}"
    textColor: "{colors.h-team}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
  chip-people:
    backgroundColor: "{colors.h-people-bg}"
    textColor: "{colors.h-people}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
  chip-subject:
    backgroundColor: "{colors.h-subject-bg}"
    textColor: "{colors.h-subject}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
  chip-eval:
    backgroundColor: "{colors.h-eval-bg}"
    textColor: "{colors.h-eval}"
    rounded: "{rounded.pill}"
    padding: "2px 9px"
  spine-completed:
    backgroundColor: "{colors.st-completed}"
    textColor: "{colors.foil-bright}"
    rounded: "{rounded.spine}"
    width: "42px"
  spine-submitted:
    backgroundColor: "{colors.st-submitted}"
    textColor: "{colors.foil-bright}"
    rounded: "{rounded.spine}"
    width: "42px"
  spine-ongoing:
    backgroundColor: "{colors.st-ongoing}"
    textColor: "{colors.foil-bright}"
    rounded: "{rounded.spine}"
    width: "42px"
  spine-rejected:
    backgroundColor: "{colors.st-rejected}"
    textColor: "#f1ede6"
    rounded: "{rounded.spine}"
    width: "42px"
  toast:
    backgroundColor: "{colors.cloth-deep}"
    textColor: "{colors.cloth-ink}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
---

# Design System: PRO: Project Online Repository

## Overview

**Creative North Star: "The Bound Report Shelf"**

PRO is the department's shelf of bound final-year reports, filed by academic year. The shell is maroon bookcloth: a 60px top bar on desktop and a cloth drawer on narrow screens. Everything you read sits on cool report paper as white sheets with hairline rules. Gold foil is scarce. It marks identity (the wordmark, the role stamp, foil-stamped titles) and the current place (the active-tab rule). The signature object is the year shelf: one spine per project, bound in its status colour, standing on a wooden ledge and grouped by academic year.

The system is dense and data-first. Tables, chips and records do the work, and ornament is limited to the materials of a bound report: cloth, foil, paper, ledge. Three borrowed devices hold it together. Each entity family has one fixed hue wherever it appears. Hovering a relation lights the rows it touches and dims the rest. Every number is set in tabular monospace. The world rejects the white-sidebar, KPI-card admin template. No sidebar, no stat tiles, no gradient hero.

**Key Characteristics:**
- Bookcloth shell (top bar, drawer, login cloth panel, toast) over a cool report-paper ground.
- Foil gold reserved for identity marks and the current place.
- Status shown as binding colour, always paired with its word.
- One hue per entity family, carried by chips and hue marks.
- Tabular monospace numerals for IDs, years and scores.
- Relation hover lights the related rows and spines and dims the rest.

## Colors

The palette comes from a bindery: maroon cloth, gold foil and a wooden ledge, set against cool paper and near-black ink, with a small fixed set of entity hues.

### Primary
- **Maroon Bookcloth** (cloth): the shell. Top bar, login cloth panel, primary buttons, the checked role segment, the caret, text selection and `accent-color`. **Deep Cloth** (cloth-deep) covers primary-button hover, the mobile drawer and the toast. **Raised Cloth** (cloth-raised) is the hover fill for buttons on the bar.
- **Cloth Ink** (cloth-ink) and **Muted Cloth Ink** (cloth-ink-muted): text set on cloth. Use the full ink for the user's name and drawer links, and the muted ink for inactive nav and secondary lines.

### Secondary
- **Gold Foil** (foil): the wordmark, the role stamp's outline and text, the active nav and tab rule, the foil caps on status marks and the foil rules on spines, the skip link's plate, the certificate's double frame and the toast icon. **Bright Foil** (foil-bright) is the type colour on spines and the text-selection colour.
- **Focus Brass** (focus): the 2px focus outline on every interactive element. The input focus ring is a translucent foil halo.

### Tertiary
- **Binding colours** (st-completed, st-submitted, st-ongoing, st-rejected): maroon, black cloth, navy and grey. They fill shelf spines, the record spine and the small status mark next to every status word. Rejected is muted grey cloth: no foil cap, with pale rules and text on the spine.
- **Entity hues** (h-project, h-team, h-people, h-subject, h-eval, each with a pale `-bg` partner): one hue per family. They appear on relation chips, page-title hue marks and the ledger's table list.
- **Ledge Wood** (ledge, ledge-dark): the shelf ledge gradient and the login shelf's base. Use them for nothing else.

### Neutral
- **Report Paper** (paper): the page ground. It is cool, not cream.
- **Sheet** (sheet) and **Sheet Tint** (sheet-tint): white working surfaces. The tint is for table headers, row hover, disabled fields and info notices.
- **Ink** (ink), **Ink 2** (ink-2), **Muted** (muted): primary text, secondary text and lede, and metadata labels.
- **Rule** (rule), **Rule Soft** (rule-soft), **Field Rule** (field-rule): sheet borders and section dividers, row dividers, and the slightly heavier edge on inputs and the role switch.
- **Lit Row** (lit-row): a pale foil wash on the table row that is active or lit by a relation hover.
- **Danger** (danger, danger-bg) and **OK** (ok-bg): destructive buttons, required marks, field errors, and error and success notices.

### Named Rules
**The Foil Is Earned Rule.** Gold appears as type only on cloth: the wordmark, the login headline, the role stamp and spine titles. On paper it appears only as a rule or a frame (the active tab, the certificate border, status caps), plus the skip link's foil plate with cloth-deep text. Never use it as running text on paper.

**The Binding Is Status Rule.** The four binding colours mean project status and nothing else. A binding colour never appears without its word next to it or a legend beside it.

**The One Hue Per Family Rule.** An entity family keeps its hue everywhere. Projects are maroon, teams green, people navy, subjects (domains, technologies, categories) ochre and evaluations violet. Never use a family hue for decoration or for a different family.

## Typography

**Display Font:** Libre Caslon Display (with Georgia)
**Body Font:** Atkinson Hyperlegible Next (with Segoe UI, system-ui)
**Label/Mono Font:** Atkinson Hyperlegible Mono (with ui-monospace)

**Character:** A legibility-first sans carries all of the interface. A high-contrast Caslon appears only where a real bindery would stamp foil. A matching mono keeps every ID, year and score in tight tabular columns.

### Hierarchy
- **Display** (Caslon 400, 52px, 1.08): the login cloth headline, in foil, capped at 14ch. It drops to 36px at 1020px and below.
- **Foil Title** (Caslon 400, 25px): certificate titles in cloth colour. The wordmark uses the same face at 28px with 0.04em tracking, and 44px on login.
- **Headline** (Atkinson 700, 28px, -0.015em): page titles, which drop to 24px at 640px. Record titles are 30px at -0.02em.
- **Title** (Atkinson 700, 18px, -0.01em): section heads. Panel heads are 17px and shelf heads 16px.
- **Body** (Atkinson 400, 15px, 1.5): running text. Abstracts are 15.5px at 1.65, capped at 70ch. Ledes are muted and capped at 70ch.
- **Label** (Atkinson 600, 13px): field labels, status words, trace-row labels and metadata terms (12.5px). Table headers are 12.5px, weight 600, 0.02em tracking, muted.
- **Numeral** (Atkinson Mono, 13.5px in tables, tabular, -0.01em): IDs, academic years, scores and counts. The certificate's average score is 52px.

### Named Rules
**The Foil Type Rule.** Caslon is only for the wordmark, the login headline and certificate titles. Never use it for a page title, a section head or UI chrome.

**The Tabular Rule.** Any number a reader compares (ID, year, score, count) is set in the mono with tabular figures and right-aligned in numeric columns.

## Layout

The page is a single column under a sticky 60px cloth bar. Content sits on paper inside a container capped at 1480px, with a 32px gutter (20px at 1020px and below) and 28px top padding. Page heads put the title and lede on the left and the role's primary action on the right, wrapping when space runs out. Sections are separated by 32px. Desks use a 12-column grid with a 20px gap (8+4 and 6+6 spans), collapsing to full width at 1020px.

CRUD screens use a workbench layout: a full-width table that, when editing, docks a 400px sticky panel on the right (360px at 1180px and below). At 1020px and below the panel stacks above the table. The project record uses a main column plus a 380px certificate column, which collapses to one column at 1180px.

Responsive steps are 1180px (tighter nav, wordmark subtitle hidden), 1020px (nav moves into the cloth drawer behind a menu button, login stacks) and 640px (role stamp hidden, forms go to one column, record spine hidden, shelf years wrap, tables scroll horizontally with a 680px minimum).

## Elevation & Depth

Depth is mostly flat and tonal: white sheets on paper, separated by hairline rules, with one soft shadow. The only lifted objects are physical ones: spines pulled off the shelf, the ledge, the bar, the toast and the drawer.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 1px 2px rgba(40,20,20,0.06), 0 6px 18px -8px rgba(40,20,20,0.12)`): every sheet. It is barely there.
- **Cloth bar** (`box-shadow: 0 1px 0 #47121b, 0 4px 14px -6px rgba(40,10,15,0.45)`): the sticky top bar.
- **Spine bevel** (`inset 2px 0 0 rgba(255,255,255,0.08), inset -3px 0 0 rgba(0,0,0,0.22)`): the rounded-back highlight and shade on every spine.
- **Pulled spine** (adds `0 8px 14px -6px rgba(30,10,10,0.45)` with a 10px lift): hover, focus or a relation light.
- **Ledge** (`0 3px 6px -3px rgba(60,40,20,0.5)`): under the wooden ledge.
- **Toast** (`0 10px 30px -10px rgba(40,10,15,0.6)`): the floating cloth toast.

### Named Rules
**The Only Things That Lift Are Books Rule.** Only shelf objects move off the plane. Sheets, chips and buttons stay flat. A button's only press feedback is a 1px drop.

## Shapes

Corners are gently squared. Controls and notices use 6px, sheets and table wraps 8px, and spines, status marks and the record spine 2px with a flat foot. Pills (999px) are reserved for relation chips. The certificate carries a double foil frame (1px at 8px inset and 0.5px at 11px inset). Hue marks are 10px squares with 2px corners; on junction tables in the ledger they become circles.

## Components

### Buttons
- **Shape:** gently squared (6px), 38px tall, 15px side padding. The small size is 32px tall with 13px text.
- **Primary:** maroon cloth with white text, 14px weight 600. It may carry a 6px foil dot. Hover deepens to cloth-deep.
- **Quiet:** white sheet with a rule border and ink text. Hover warms to sheet-tint with a darker border.
- **Danger:** danger red with white text, only for destructive confirmation.
- **Text:** borderless, ink-2, 13px weight 600. Hover turns it cloth with an underline. The danger variant is red, used for inline Delete.
- **States:** all buttons drop 1px on press. Disabled sits at 55% opacity. Every button shows a 2px brass focus outline.

### Chips
- **Style:** a pill in the family's pale background with the family hue as text, 13px weight 500, 2px 9px padding, ellipsis on overflow.
- **State:** linked chips gain a 1.5px inset ring in their own hue on hover. Removable chips carry a small round × button. Chips that report hover light their related rows.

### Status mark
- An 8x14 binding swatch with a 3px foil cap, followed by the status word in 13px weight 600. Rejected drops the cap and mutes the word.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** sheet on paper.
- **Shadow Strategy:** the Sheet shadow only.
- **Border:** 1px rule.
- **Internal Padding:** 20px 22px. Panel heads and bodies use 18px 20px.

### Inputs / Fields
- **Style:** 38px tall, white, 1px field-rule border, 6px radius, 14px text. Selects use a muted inline chevron. Textareas start at 96px and resize vertically.
- **Focus:** the border turns cloth and gains a 3px translucent foil halo.
- **Error / Disabled:** invalid fields get a danger border, with the message beneath in 13px danger text and an icon. Disabled fields go to sheet-tint with muted text.
- **Field:** 13px weight 600 ink-2 label, 6px gap, hint in 12.5px muted. Required fields get a red asterisk.

### Navigation
- **Top bar:** sticky cloth, 60px. On the left is the foil Caslon wordmark with a muted subtitle. Nav links are 14px muted cloth ink, turning white on hover. The current page is white with a 3px inset foil rule at the foot. On the right are the role stamp (11px, 700, uppercase, 0.1em tracking, foil outline, 3px radius), the user name and a ghost bar button.
- **Tabs on paper:** 14px weight 600 muted text. The selected tab is cloth with a 3px foil rule.
- **Mobile:** at 1020px and below, the nav and name move into a cloth-deep drawer that slides in under the bar. Links are 15px, separated by faint cloth-ink rules, and the current link is foil.

### Data table
- A sheet with a sticky sheet-tint header (12.5px muted labels with sort buttons) and 11px 14px cells divided by rule-soft. Numeric columns use the mono and are right-aligned. Title links are ink weight 600 and turn cloth on hover. A toolbar above holds search, filter selects and a muted count.
- Relation hover dims unlit rows to 38% opacity and washes lit and active rows in lit-row.

### The year shelf (signature)
- A sheet holding one run per academic year. Spines are 42px wide (32px at 640px) with 4px gaps, standing 176px tall on a 9px wooden ledge. Each spine has two foil rules, a vertical title in 12px weight 600, and a mono ID foot. Spines are coloured by status, and a legend of status marks sits in the head. A year label in mono and a report count sit under each ledge.
- Hovering or focusing a spine pulls it up 10px and lights its table row. When a relation lights spines, the rest dim to 45%. Clicking opens the record. The record page repeats the project's spine (46x132) beside its title.

### Evaluation certificate (signature)
- A centred sheet inside a double foil frame. It has a Caslon title in cloth, a muted lede, a 52px mono average score over a muted "/ 100", then signature lines: ink-2 top rules, faculty name, mono score and feedback.

### Toast and notices
- **Toast:** a cloth-deep bar (6px radius), bottom centre, with a foil icon. It rises 10px in over 260ms.
- **Notices:** 6px-radius blocks with an icon. Error is danger-bg, success is ok-bg, info is sheet-tint with a rule border.

### Motion
- All transitions use one ease-out curve (`cubic-bezier(0.16, 1, 0.3, 1)`): about 150ms for colour and border, 220ms for spine lifts and the panel slide-in. Reduced motion removes the durations and the spine lift.

## Do's and Don'ts

### Do:
- **Do** build every new surface on paper, with white sheets (8px radius, rule border, Sheet shadow) and cloth only for the shell.
- **Do** pair every binding colour with its status word, using the status mark or the shelf legend.
- **Do** colour any reference to a project, team, person, subject or evaluation with that family's hue, as a chip or a hue mark.
- **Do** set IDs, years, scores and counts in Atkinson Hyperlegible Mono with tabular figures.
- **Do** light related rows and spines on relation hover, and dim the rest.
- **Do** show validation errors under the field, in danger text with an icon.

### Don't:
- **Don't** build the white-sidebar, KPI-card admin template. Navigation lives in the cloth bar, and the repository opens on the shelf.
- **Don't** set gold foil as text on paper. On paper it is a rule or a frame (the skip link's plate is the one fill).
- **Don't** use Libre Caslon Display outside the wordmark, the login headline and certificate titles.
- **Don't** use a binding colour for anything except status, or a family hue for anything except its family.
- **Don't** lift sheets, chips or buttons with shadows. Only shelf objects leave the plane.
- **Don't** warm the ground to cream. Report paper stays cool.
