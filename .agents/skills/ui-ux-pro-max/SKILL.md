---
name: ui-ux-pro-max
description: UI/UX design intelligence and system generator for web, mobile, and desktop applications. Use this skill when designing, building, or refactoring user interfaces, establishing design systems, selecting color palettes, typography, spacing, component libraries, and ensuring cohesive, high-craft aesthetics.
---

# UI/UX Pro Max Skill

A professional design intelligence framework for creating production-grade, highly polished user interfaces that transcend generic AI templates.

## Core Philosophy

1. **Token Consistency First**: Establish semantic tokens (primary, secondary, neutral, surface, border, semantic states) before writing component code.
2. **Intentional Variance**: Avoid predictable, repetitive layouts. Balance density, visual weight, and hierarchy.
3. **Ergonomic Information Density**: Structure information for fast cognitive scanning, high readability, and effortless user interaction.
4. **Platform & Stack Awareness**: Leverage modern Tailwind CSS, accessible ARIA patterns, and native browser optimizations.

## Design Dial Configurations

When building an interface, balance three core dials:
- **Density (1–10)**:
  - *Compact (7–9)*: Ideal for dashboards, data tables, inventory management, developer tools. Uses 4px/8px rhythm, tighter padding (`py-2 px-3`), tabular numbers, sticky controls.
  - *Standard (4–6)*: Typical web apps, SaaS portals, management interfaces.
  - *Spacious (1–3)*: Marketing pages, onboarding flows, consumer mobile experiences.
- **Motion & Micro-interactions (1–10)**:
  - *Functional (2–4)*: Subtle transitions (`transition-all duration-150 ease-out`), hover elevations, tactile button depressions (`active:scale-[0.98]`), gentle modal backdrops.
- **Visual Weight & Variance (1–10)**:
  - *Balanced (5–7)*: Crisp borders (`border-slate-200 dark:border-slate-800`), layered elevations, clean typography hierarchies, distinctive badge colors.

## Curated Color Palettes for Enterprise & Institutional Tools

### Training Center & Executive Inventory (KM100 Theme)
- **Primary / Brand**: Deep Indigo / Sapphire Blue (`#1e40af`, `#2563eb`, `#3b82f6`, `#60a5fa`)
- **Accent**: Emerald Green (`#059669`, `#10b981`) for active/good condition; Amber (`#d97706`, `#f59e0b`) for fair/caution; Rose (`#e11d48`, `#f43f5e`) for repair/condemned.
- **Surfaces (Light)**: Pure white `#ffffff`, slate tint `#f8fafc`, container card `#ffffff`, subtle divider `#e2e8f0`.
- **Surfaces (Dark)**: Deep background `#090d16` or `#0f172a`, container card `#1e293b`, elevated card `#334155`, subtle divider `#334155`.
- **Text**: Slate 900 `#0f172a` (light) / Slate 100 `#f1f5f9` (dark) for headings; Slate 600 / Slate 400 for secondary copy.

## Component Craft Standards

1. **Data Tables**:
   - Sticky header with backdrop-blur (`backdrop-blur-md bg-white/90 dark:bg-slate-900/90`).
   - Row hover highlights with seamless transitions (`hover:bg-slate-50 dark:hover:bg-slate-800/60`).
   - Tabular figures for numerical data (`font-mono tabular-nums`).
   - Empty state illustration, clear explanation, and primary call-to-action button.
2. **Interactive Controls & Quick Actions**:
   - Quick quantity steppers (+/-) with immediate UI reaction and local persistence.
   - Distinct focus indicators (`focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500`).
3. **Modals & Drawers**:
   - Accessible keyboard escape (`Escape` key closes).
   - Backdrop scrim (`bg-slate-900/60 backdrop-blur-sm`).
   - Clear action hierarchy: Primary button prominent, secondary button muted, destructive button explicitly red.
