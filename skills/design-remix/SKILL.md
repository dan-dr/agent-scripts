---
name: design-remix
description: Adapt a design prompt to an existing codebase/product. Use when the user has an existing project (repo) and wants UI/UX improvements or a new design direction that must fit the project’s current goals, routes, components, styling system (Tailwind/CSS/Chakra/etc), and constraints. Produces an “adapted design prompt” that is ready to hand to a coding agent, and offers to hand it off.
---

# Design Remix

## Goal
Turn an **abstract design prompt** (e.g. “make it feel like Linear”, “modernize the dashboard”, “retro brutalist”) into a **project-specific build brief** that matches:
- current product goals + feature set
- existing UI patterns + components
- existing styling system + tokens
- constraints (time, risk, accessibility, performance)

Output must be a single paste-ready prompt for a coding agent.

## Operating rules (always)
- Treat this as an **existing project** task: don’t propose a greenfield rewrite.
- Prefer **reuse** over new UI kits. Extend what exists.
- Keep changes **incremental** and **scoped** (minimize churn).
- Preserve functionality; this is design + UX, not feature invention.

## Inputs to collect (ask only what’s missing)
1) **Repo location** (path or link) + what environment to target (web/mobile, Next/Vite, etc.)
2) The **design prompt** (raw, unedited)
3) Target surface: which pages/flows (e.g. “/dashboard + settings + onboarding”)
4) Constraints:
   - deadline/timebox
   - appetite for refactors (low/med/high)
   - must-keep components/patterns
   - accessibility level (basic vs strict)
5) Optional: screenshots, Figma, competitor references

If repo is local, quickly inventory it via shell commands (don’t be noisy):
- identify framework + styling (package.json, tailwind.config, css vars)
- identify component library (shadcn, radix, mui, chakra, custom)
- scan key UI folders (components/, app/, pages/, routes/, styles/)

## Remix workflow
### 1) Project understanding (2–5 bullets)
Summarize what the product is, who it’s for, and what success looks like.

### 2) UI inventory (short)
Capture what already exists:
- layout primitives (shell, nav, page container)
- typography + spacing scale (or lack of it)
- color system (CSS vars, Tailwind theme, hardcoded)
- recurring components (buttons, cards, tables, forms, toasts)
- interaction patterns (loading states, empty states, modals)

### 3) Translate the design prompt into constraints + decisions
Convert vibes into specific, enforceable choices:
- color palette direction (with accessibility)
- typography (font stack + sizes)
- radius + shadows + borders
- density (spacious vs compact)
- motion (where/when, durations)
- component styling rules (buttons, inputs, cards, tables)

### 4) Produce the “Adapted Design Prompt” (deliverable)
Write a prompt that a coding agent can execute without ambiguity.

It MUST include:
- **Context**: what the app is + what to change
- **Scope**: pages/components to touch (and what to avoid)
- **Implementation plan** (ordered)
- **Design system updates**: tokens/vars/theme changes
- **Component guidelines**: button/input/card/table patterns
- **Acceptance criteria**: visual + UX + a11y + regression checks
- **File touchpoints**: likely directories/files to inspect/edit

### 5) Handoff question
After outputting the adapted prompt, ask:
> “Want me to hand this off to a coding agent to implement? If yes: tell me the repo path and whether you want a fast pass (higher risk) or safe pass (lower risk).”

If user says yes, start a coding run (use the coding agent workflow available in this environment) and paste the adapted prompt as the task.

---

## Reference: will.aire.place redesign (2026-01-31)

First successful use of this skill. Documents the full input→output pipeline.

### Input received
- **Repo**: `/home/ubuntu/projects/aire.place/apps/web` (React 19 + TanStack Router + TanStack Start + Vite 7 + Cloudflare Workers + Tailwind CSS v4 + shadcn)
- **Design prompt**: Raw SuperDesign "AI System Configuration Console" prompt — industrial dark theme, 65/35 split with sidebar, acid green (#d4ff00), 0px radius, grid overlays, scanlines, corner ticks
- **Constraints from user**: "layout should NOT change too much", "no sidebar"

### UI inventory performed
Scanned the codebase to identify:
- **Pages**: `/` (home with terminal UI, score animation, GitHub connect, demo wall), `/$username` (score report with metrics/breakdown/languages), `/claude/*` variants
- **Components**: header, footer, hero, score-preview, score-orb (conic gradient ring), terminal-consent (modal), tweet-wall (masonry), user-carousel (marquee), loader
- **UI primitives**: shadcn (button, input, label, checkbox, skeleton, dropdown-menu, card, sonner)
- **Styling**: Tailwind v4 with CSS vars (oklch), custom fonts (JetBrains Mono, Spline Sans, Unbounded), glass-panel utility, CRT scanline overlay, glitch text effects, radial gradient background blobs, dot pattern
- **Layout**: Centered `max-w-5xl`, home uses `grid lg:grid-cols-[1.2fr_0.8fr]`, no sidebar

### Key adaptations made (design prompt → coding prompt)
1. **Removed sidebar**: Original prompt had 65%/35% split with inspector sidebar. Replaced with existing centered layout + grid structure.
2. **Mapped abstract components to real ones**: "System Canvas nodes" → score display cards + demo wall user cards. "Inspector panel" → dropped entirely. "Output Simulation terminal" → score terminal animation. "Active System Node" → score result section on `/$username`.
3. **Preserved all functionality**: GitHub OAuth flow, username input, score computation, metrics, breakdown, sharing — all kept intact, only visual reskin.
4. **Scoped to `/redesign` path**: Created parallel routes (`/redesign/`, `/redesign/$username`) and `components/redesign/` directory. Added `.console-*` CSS classes to `index.css` without touching existing styles.
5. **Typography swap**: Kept JetBrains Mono for code/data, swapped display font to Inter for UI labels (uppercase, tracking-wider, semi-bold).
6. **Color mapping**: `#33ff33` (hacker green) → `#d4ff00` (acid green). Added full palette: `#0f1115` bg, `#050608` deep panels, `#151b23` nodes, `#2d333b` borders.
7. **Effect replacements**: CRT flicker + glitch → mechanical pulse + scanline bar. Glass panels → flat bordered panels with corner ticks. Radial gradients → 40px grid pattern.

### Output format
Single markdown file (`REDESIGN_TASK.md`, ~9.5KB) structured as:
- Objective + file locations
- Key constraints (6 items)
- Design system spec (colors, typography, borders, effects, animations, removals, additions)
- Page-specific instructions (home page, username page)
- Component-specific instructions (score-orb, score-preview, terminal-consent, footer)
- CSS additions (ready-to-paste block)
- Implementation notes + DO NOT list

### Handoff to coding agent
Passed to Codex CLI (`codex --full-auto exec`) running in the `apps/web` directory. Codex:
- Read all existing files systematically
- Rewrote all 9 component/route files (1,055 lines total)
- Added ~210 lines of `.console-*` CSS
- Completed in ~25 minutes
