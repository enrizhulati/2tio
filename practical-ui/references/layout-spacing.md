# Chapter 4: Layout and Spacing

## Group Related Elements

Breaking up information into smaller groups of related elements helps to structure and organise an interface. This makes it faster and easier for people to understand and remember.

### 4 Methods for Grouping

1. **Containers** - Place related elements in the same boundary
2. **Proximity** - Space related elements close together
3. **Similarity** - Make related elements look similar
4. **Continuity** - Align related elements in a continuous line

Combine these methods to display groupings more clearly.

## 1. Containers (Common Region)

**Principle:** Items within the same boundary or container are perceived as a group and assumed to be related.

**Create containers using:** Borders, shadows, background colours

**Strongest visual cue** for grouping interface elements.

### Common Container Uses

- Main structure of interface (sidebar, header, footer)
- Cards
- Dialog boxes
- Form sections
- Navigation sections

### When Containers Are Necessary

Use containers when groupings are unclear due to:
- Inconsistent text lengths creating varying gaps
- Elements that could be associated with wrong neighbours
- Need for strong visual separation

### When to Avoid Containers

Don't use containers for every group—can cause unnecessary clutter. Look for opportunities to use other grouping methods for simpler designs.

## 2. Proximity

**Principle:** Elements near each other are perceived as a group and assumed to be related.

**Implementation:**
- Place related elements close together
- Separate unrelated elements with more space

Using spacing instead of containers can help declutter and simplify an interface.

### Proximity Example

**With containers:** Cards around each item
**With spacing only:** Adequate space between items, no cards needed

Spacing can overpower containers as a grouping method when combined with similarity and continuity.

## 3. Similarity

**Principle:** When things look similar, your mind groups them together.

**Make related elements look similar using:**
- Size
- Shape
- Colour
- Style

### Highlighting Within Groups

Within a group of related elements, highlight certain ones by making them slightly different:
- Larger size
- Different colour
- Badge or label
- Filled vs outlined style

### Critical Rule: Similar = Similar Function

If elements look similar, people expect them to work similarly.

**Do:**
- Use consistent visual treatment for same functionality
- Make elements with different functionality look different

**Don't:**
- Make icons look like buttons (suggests interactivity)
- Make badges look like primary buttons
- Use the same colour for interactive and non-interactive elements

## 4. Continuity

**Principle:** People perceive elements arranged in a continuous line to be related.

Our eyes naturally follow elements aligned in continuous straight or curved lines.

### Uses

- Lists
- Tables
- Navigation
- Grids

### Breaking Continuity

Disrupt continuity to:
- Indicate end of a group
- Highlight a particular element
- Insert a different type of content (e.g., newsletter signup in article list)

## Create a Clear Visual Hierarchy

**Definition:** A clear order of importance that helps people scan information quickly and focus on areas of interest.

Not all information has the same importance. Make more important elements look more prominent.

### 6 Tools for Creating Visual Hierarchy

| Tool | Primary | Secondary | Tertiary |
|------|---------|-----------|----------|
| Size | Largest | Medium | Smallest |
| Colour | Darkest/most saturated | Medium | Lightest/least saturated |
| Weight | Bold | Regular | Light |
| Spacing | Most space | Medium space | Least space |
| Position | Top/prominent | Middle | Bottom/less prominent |
| Depth | Highest elevation | Medium | Flat |

### Creating Hierarchy: Step by Step

1. **Group** related information
2. **Order** sections by importance
3. **Order** elements within sections by importance
4. **Apply visual styles** based on importance

### Example: Property Booking Card

**Section 1 (Most important):** Photo gallery, price
**Section 2:** Property details (type, beds, baths, garage)
**Section 3:** Ratings and reviews
**Section 4:** Description

Within each section, apply hierarchy:
- Primary: Largest, darkest, boldest
- Secondary: Medium size, grey, regular weight
- Tertiary: Smallest, lightest, least prominent

## Test Visual Hierarchy Using The Squint Test

**Method:** Squint or blur your eyes when looking at a design. What stands out should be the most important elements.

If important elements don't stand out when squinting, adjust the visual hierarchy.

## Use Depth to Create Visual Hierarchy

**Elevation:** Items that appear closer to you (elevated) are perceived as more prominent.

### Creating Depth with Shadows

| Elevation Level | Shadow | Usage |
|----------------|--------|-------|
| Level 0 | None | Default, flat elements |
| Level 1 | Small (0, 2px, 4px) | Cards, slight elevation |
| Level 2 | Medium (0, 4px, 8px) | Dropdowns, popovers |
| Level 3 | Large (0, 8px, 16px) | Modals, dialogs |

### Shadow Properties

Shadows typically have:
- X offset: 0 (light from above)
- Y offset: Positive (shadow below)
- Blur radius: 2-3x the Y offset
- Colour: Black at 10-20% opacity (or dark grey from palette)

## Understand the Box Model

Every interface element is a rectangular box consisting of:

1. **Content** - The actual content (text, image, etc.)
2. **Padding** - Space between content and border
3. **Border** - Line around the padding
4. **Margin** - Space outside the border

```
┌─────────────────────────────┐
│         Margin              │
│  ┌───────────────────────┐  │
│  │       Border          │  │
│  │  ┌─────────────────┐  │  │
│  │  │    Padding      │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  Content  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

Understanding the box model helps you space interface elements accurately.

## Design @1x Using Points

**Points (pt)** are a unit of measurement independent of pixel density.

- 1pt = 1 pixel on standard displays
- 1pt = 2 pixels on 2x Retina displays
- 1pt = 3 pixels on 3x displays

**Always design at 1x** using points. This ensures:
- Consistent sizing across devices
- Easier handoff to developers
- Simpler design files

## Create a Set of Predefined Spacing Options

Rather than choosing from unlimited spacing options, create a small set of predefined values.

### 8pt Spacing System

Base unit of 8 creates values that work well across different screen densities.

| Token | Value | Usage |
|-------|-------|-------|
| XS | 8pt | Closely related elements (icon to label, label to input) |
| S | 16pt | Related elements within groups |
| M | 24pt | Between groups, section padding |
| L | 32pt | Section separators |
| XL | 48pt | Major sections |
| XXL | 80pt | Page sections, hero areas |

### Why 8pt?

- Divides evenly on most screen densities
- Creates consistent rhythm
- Limits decisions
- Easy math

## Space Elements Based on How Closely Related They Are

**Rule:** The closer elements are related, the less space between them.

### Spacing Hierarchy

1. **Tightly related:** XS (8pt) - Icon and label, label and field
2. **Related:** S (16pt) - Elements in same group
3. **Loosely related:** M (24pt) - Different groups in same section
4. **Sections:** L-XXL (32-80pt) - Major section breaks

### Example: Form Fields

- Label to input: XS (8pt) - tightly coupled
- Between form fields: M (24pt) - same form, different groups
- Between form sections: L (32pt) - different logical groups

## Be Generous with White Space

White space (negative space) is the empty area between and around elements.

**Benefits:**
- Improves readability
- Reduces cognitive load
- Creates visual breathing room
- Increases perceived quality
- Guides attention

**Common mistakes:**
- Cramming too much content
- Insufficient margins
- Dense, overwhelming layouts

**Recommendation:** When in doubt, add more space.

## Align the Main Layout to a 12-Column Grid

A grid system helps create consistent layouts and alignment.

### 12-Column Grid Components

1. **Columns** - Vertical divisions (12 is standard, divisible by 2, 3, 4, 6)
2. **Gutters** - Space between columns
3. **Margins** - Space on outer edges

### Responsive Grid Settings

| Breakpoint | Columns | Gutter | Margin |
|------------|---------|--------|--------|
| Desktop (1200px+) | 12 | 32pt | 32pt+ |
| Tablet (768-1199px) | 8 | 24pt | 24pt |
| Mobile (<768px) | 4 | 16pt | 16pt |

### Grid Usage

- Don't make every element snap to grid
- Use grid for main layout structure
- Content within containers doesn't need to align to outer grid

## Align Text to Improve Readability

**Left alignment** (default for LTR languages):
- Easiest to read
- Creates consistent left edge
- Eye knows where to return

**Right alignment:**
- Use sparingly
- Good for numbers in tables
- RTL languages

**Center alignment:**
- Short headings
- Hero text
- Single lines
- **Never** center long body text or multiple paragraphs

**Justify:**
- **Avoid** - Creates uneven spacing (rivers of white)
- Hard to read
- Accessibility issues

## Try to Avoid Using Multiple Alignments

**Problem:** Multiple alignments on a page create visual chaos.

**Solution:** Stick to left alignment with occasional centered headings.

### Mixed Alignment Example

**Bad:** Left-aligned body, centered headings, right-aligned dates, centered buttons
**Good:** Everything left-aligned

## Keep Related Actions Close

**Fitts's Law:** The closer and larger a target, the faster it is to click.

Keep actions close to the elements they relate to:
- Delete button near the item being deleted
- Submit button near the form
- Edit link near the content being edited

### Screen Magnifier Consideration

Users with screen magnifiers see only a portion of the screen. Actions far from content may not be visible. Left-align and keep related.

## Make Sure Important Content is Visible

**Above the fold:** Content visible without scrolling

Important content should be visible immediately:
- Primary call-to-action
- Key value proposition
- Critical navigation

**Note:** People do scroll, but initial visibility matters for engagement.

## Ensure Your Interface is Unbreakable

Design for edge cases:

- **Empty states** - What shows when there's no data?
- **Error states** - What happens when things fail?
- **Loading states** - What shows while waiting?
- **Long text** - Does text overflow or truncate gracefully?
- **Missing images** - What's the fallback?
- **Extreme values** - Very long names, very large numbers?

## Use the Rule of Thirds for Photos

**Rule of Thirds:** Divide image into 9 equal parts with 2 horizontal and 2 vertical lines. Place important elements along lines or at intersections.

Creates more dynamic, interesting compositions than centering subjects.

**Application:**
- Product photos
- Hero images
- Profile pictures
- Feature images
