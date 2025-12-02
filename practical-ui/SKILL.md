---
name: practical-ui
description: Evidence-based UI design system from Practical UI by Adham Dannaway (283 pages, 14 chapters). Use when designing interfaces, reviewing UI, creating mockups, building components, or applying design principles. Covers visual hierarchy, spacing systems, color palettes, typography scales, form design, button patterns, accessibility (WCAG 2.1 AA), copywriting, and reducing cognitive load. Triggers on UI design, interface design, component design, design system, accessibility, WCAG, visual hierarchy, spacing, typography, color palette, forms, buttons, layout, grid, or copywriting questions.
---

# Practical UI Design System

Evidence-based guidelines for intuitive, accessible, and beautiful interfaces. Based on 283 pages covering visual design, usability, and accessibility principles validated through decades of professional practice.

## Core Philosophy

Every design decision should have a logical reason that improves usability. Design using objective logic rather than subjective opinion—"that looks nice" is not constructive feedback.

## Three Foundational Principles

1. **Minimise usability risks** - Consider people with poor eyesight, low computer literacy, reduced dexterity, and cognitive differences. Meet WCAG 2.1 Level AA requirements.

2. **Minimise interaction cost** - Reduce physical and mental effort (looking, scrolling, clicking, typing, thinking, remembering). Apply Fitts's Law (closer/larger targets are faster) and Hick's Law (fewer choices = faster decisions).

3. **Minimise cognitive load** - Remove unnecessary styles/information, break up information into smaller groups, use familiar patterns, maintain consistency, create clear visual hierarchy.

## Quick Reference Tables

### Spacing System (8pt base)
| Token | Value | Usage |
|-------|-------|-------|
| XS | 8pt | Closely related elements, icon-to-label |
| S | 16pt | Related elements within groups |
| M | 24pt | Between groups, section padding |
| L | 32pt | Section separators |
| XL | 48pt | Major sections |
| XXL | 80pt | Page sections, hero areas |

### Type Scale (1.25 ratio)
| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 44px | Bold | 1.1-1.2 |
| H2 | 35px | Bold | 1.2 |
| H3 | 28px | Bold | 1.2-1.3 |
| H4 | 22px | Bold | 1.3 |
| Body | 18px+ | Regular | ≥1.5 |
| Small | 16px | Regular | 1.5 |

### Color Contrast Requirements (WCAG 2.1 AA)
| Element | Minimum Ratio |
|---------|---------------|
| Small text (≤18px) | 4.5:1 |
| Large text (>18px bold or >24px) | 3:1 |
| UI components (borders, icons) | 3:1 |
| Between button weights | 3:1 |

### Button Hierarchy
| Weight | Style | Usage |
|--------|-------|-------|
| Primary | Solid fill, white text | Most important action (1 per view) |
| Secondary | Border/outline only | Less important actions |
| Tertiary | Underlined text only | Least important actions |

### Form Input Selection
| Options | Recommended Control |
|---------|-------------------|
| 2 options | Checkbox or toggle |
| ≤5 options | Radio buttons |
| 6-10 options | Radio buttons or dropdown |
| >10 options | Autocomplete search |

## Reference Files Index

| File | Topics | When to Use |
|------|--------|-------------|
| [fundamentals.md](references/fundamentals.md) | Usability risks, interaction cost, cognitive load, design systems, accessibility, patterns, 80/20 rule, costs, consistency | Starting new projects, establishing foundations |
| [less-is-more.md](references/less-is-more.md) | Remove unnecessary info/styles, progressive disclosure, minimalism vs simplicity, mobile-first, breaking up choices | Simplifying interfaces, reducing clutter |
| [color.md](references/color.md) | Contrast, colorblind accessibility, system colors, HSB system, light/dark palettes, brand color application | Building color systems, accessibility audits |
| [layout-spacing.md](references/layout-spacing.md) | Grouping methods, visual hierarchy, squint test, depth, box model, 8pt grid, 12-column grid, white space | Layout decisions, spacing consistency |
| [typography.md](references/typography.md) | Sans serif selection, typeface pairing, weights, type scale, line height/length, alignment, text on photos | Typography systems, readability |
| [copywriting.md](references/copywriting.md) | Conciseness, sentence case, plain language, front-loading, vocabulary consistency, error messages | UI copy, microcopy, error states |
| [forms.md](references/forms.md) | Single column, labels, field width, required/optional, input selection, validation, error display | Form design, input patterns |
| [buttons.md](references/buttons.md) | Three-weight system, disabled alternatives, placement, labels, target size, destructive actions | Button systems, CTA design |

## Accessibility Checklist

- [ ] Text contrast ≥4.5:1 (small) or ≥3:1 (large)
- [ ] UI element contrast ≥3:1
- [ ] Touch targets ≥48×48pt
- [ ] Don't rely on color alone for meaning
- [ ] Form fields have visible labels (not just placeholders)
- [ ] Error messages explain what went wrong and how to fix
- [ ] Links are distinguishable from regular text
- [ ] Focus states are visible

## Common Anti-Patterns to Avoid

- Light grey text for aesthetics (accessibility risk)
- Icons without labels (comprehension risk)
- Colored heading text (looks like links)
- Placeholder text as labels (disappears on input)
- Disabled buttons without explanation (frustrating)
- Justify-aligned text (uneven spacing)
- Center-aligned long text (hard to read)
- Multiple primary buttons (unclear hierarchy)
- Trendy styles like Glassmorphism/Neuomorphism (contrast issues)
