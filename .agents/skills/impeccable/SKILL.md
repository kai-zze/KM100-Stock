---
name: impeccable
description: Anti-slop design vocabulary and frontend craftsmanship framework for AI coding agents. Use this skill to design, audit, critique, polish, harden, typeset, and elevate user interfaces to professional, human-crafted standards.
---

# Impeccable Skill

A rigorous frontend design and anti-slop framework created to eradicate generic AI aesthetics and ensure high-craft, brand-aligned interfaces.

## Anti-Slop Principles: What to Avoid

1. **No Gratuitous Gradients**: Eliminate generic purple-to-blue linear gradients on hero sections, buttons, or card backgrounds. Use solid, purposeful brand colors or crisp architectural borders.
2. **No "Card Inception"**: Avoid nesting white cards inside white cards inside gray cards. Use spatial rhythm, dividers, and background contrast to structure layouts.
3. **No Uncalibrated Status Badges**: Avoid muddy status pills where every badge looks like a washed-out gray oval. Provide crisp, semantic color coding with distinct background, text, and border tokens.
4. **No Low-Contrast Gray-on-Gray Text**: Ensure all text passes WCAG AA contrast (minimum 4.5:1 ratio). Body text in dark mode must be crisp (`text-slate-300` or `text-slate-200`, not `text-slate-500`).
5. **No Clumsy Padding**: Avoid arbitrary 37px or irregular paddings. Adhere strictly to a proportional 4px/8px spacing scale (`p-4`, `p-6`, `gap-3`, `gap-6`).

## Mode: OPERATE (High-Density Management Systems)

For dashboards, inventory control, admin tools, and operational workflows:

- **Maximum Data Clarity**: The data is the hero. Don't hide important metrics or actions behind complex nested sub-menus.
- **Direct Manipulation**: Provide instant actions (quick inline steppers, search-as-you-type, instant column filters, one-click sheet exports).
- **Sticky Navigation & Headers**: When tables contain dozens of records, keep the headers fixed and table scrolled cleanly.
- **Confirmation Safeguards**: Destructive actions (deleting rooms, purging items, resetting sample data) must have clear confirmation dialogs with red accenting.

## Refinement Commands

### 1. `/impeccable polish`

- Review the entire visual surface for consistency.
- Inspect alignment, spacing rhythm, border contrast, and icon alignment.
- Verify light and dark mode toggles render with seamless contrast and no inverted anomalies.

### 2. `/impeccable audit`

- **Accessibility**: Validate keyboard operability (Tab order, Enter/Space activation, Esc to dismiss modals).
- **Responsive Behavior**: Test layout at mobile (<640px), tablet (768px-1024px), and desktop (>1280px). Ensure table scrolls horizontally without breaking outer container.
- **Error States**: Ensure empty rooms, zero search results, and missing column values display graceful, helpful empty states.

### 3. `/impeccable typeset`

- Proper optical hierarchy: `text-2xl font-bold tracking-tight` for main titles, `text-sm font-semibold` for table headers, `font-mono tabular-nums` for counts, numbers, and dates.
- Balanced line heights and readability across all viewports.
