# Chapter 5: Typography

## Use a Single Sans Serif Typeface

For most interfaces, a single sans serif typeface is the safest and most practical choice.

### 5 Typeface Classifications

| Classification | Characteristics | Best For |
|---------------|-----------------|----------|
| Sans serif | No decorative strokes, clean | UI, body text, general use |
| Serif | Small decorative strokes | Long-form reading, traditional |
| Script | Handwriting-style, flowing | Decorative, branding |
| Display | Decorative, attention-grabbing | Headlines only |
| Monospace | Fixed-width characters | Code, technical |

### Why Sans Serif?

1. **Legibility** - Clean, simple forms readable at any size
2. **Neutrality** - Works across industries and styles
3. **Versatility** - Multiple weights and styles available
4. **Familiarity** - People are used to reading sans serif on screens
5. **Simplicity** - One typeface = fewer decisions, more consistency

### Choosing a Sans Serif

**Criteria:**
- **Popularity** - Well-established, tested in many contexts
- **Weights** - At least regular and bold (ideally more)
- **x-height** - Taller x-height = better small-size readability
- **OpenType features** - Tabular numbers for data

**Recommended options:**
- Inter
- Roboto
- Open Sans
- Lato
- Source Sans Pro
- Nunito
- Work Sans

**Avoid:** Typefaces that are too thin, too decorative, or have poor character distinction (especially l, 1, I, O, 0).

## Evoke Emotion Using a Second Typeface for Headings

If you want to add personality or emotion, add a **second typeface for headings only**. Keep sans serif for body text.

### Mood by Typeface Style

| Style | Mood | Examples |
|-------|------|----------|
| Serif | Traditional, trustworthy, elegant | Playfair Display, Lora |
| Slab serif | Strong, confident, modern | Roboto Slab, Rockwell |
| Rounded | Friendly, approachable, fun | Nunito, Varela Round |
| Geometric | Modern, clean, tech-forward | Poppins, Montserrat |
| Script | Elegant, personal, creative | Pacifico (use sparingly) |

### Rules for Pairing

1. **Contrast** - Typefaces should be noticeably different
2. **Limit to 2** - More than 2 typefaces creates chaos
3. **Hierarchy** - Display/serif for headings, sans serif for body
4. **Never use script for body text** - Only decorative headers

## Use Regular and Bold Font Weights Only

For most interfaces, you only need 2 weights:
- **Regular (400)** - Body text, secondary text
- **Bold (700)** - Headings, emphasis, labels

**Why limit weights?**
- Simplifies decisions
- Maintains hierarchy
- Reduces file size
- Improves consistency

**When to add more:**
- Semi-bold (600) for subtle emphasis
- Light (300) for very large display text only
- Never use light weights for body text (readability issues)

## Use a Type Scale to Set Font Sizes

Rather than arbitrary sizes, use a type scale based on a ratio.

### Recommended: 1.25 Major Third Scale

| Level | Size | Usage |
|-------|------|-------|
| H1 | 44px | Page titles |
| H2 | 35px | Section headings |
| H3 | 28px | Subsection headings |
| H4 | 22px | Card titles, minor headings |
| Body | 18px | Body text, paragraphs |
| Small | 15px | Captions, meta info |
| Tiny | 12px | Fine print (use sparingly) |

**Scale formula:** Each size = previous size × ratio (1.25)
- 18 × 1.25 = 22
- 22 × 1.25 = 28
- 28 × 1.25 = 35
- 35 × 1.25 = 44

### Other Common Ratios

| Ratio | Name | Best For |
|-------|------|----------|
| 1.067 | Minor Second | Small screens, compact UI |
| 1.125 | Major Second | Body-heavy content |
| 1.200 | Minor Third | General use |
| 1.250 | Major Third | Marketing sites, apps |
| 1.333 | Perfect Fourth | Bold statements |
| 1.414 | Augmented Fourth | High drama |
| 1.618 | Golden Ratio | Artistic, dramatic |

## Make Long Body Text Bigger

For long-form reading (articles, documentation):

**Minimum body text: 18px**

Larger text improves:
- Readability
- Reduced eye strain
- Accessibility for vision impairments

**For short UI text:** 16px can work (labels, buttons, navigation)
**For marketing/hero text:** 20-24px body text common

## Use at Least 1.5 Line Height for Long Body Text

**Line height (leading):** Space between lines of text

**WCAG 2.1 AA requirement:** At least 1.5 for body text

### Line Height Guidelines

| Text Type | Line Height |
|-----------|-------------|
| Body text | 1.5-1.7 |
| Short UI text | 1.4-1.5 |
| Headings | 1.1-1.3 |
| Display text | 1.0-1.2 |

**Why higher line height for body?**
- Eyes can find next line
- Reduces reading fatigue
- Improves comprehension

## Decrease Line Height as Font Size Increases

**Rule:** Larger text needs less line height.

As font size increases:
- Characters are already tall
- High line height looks disconnected
- Tighter spacing looks more cohesive

### Scaling Line Height

| Font Size | Suggested Line Height |
|-----------|----------------------|
| 16-18px | 1.5-1.7 |
| 20-24px | 1.4-1.5 |
| 28-35px | 1.2-1.3 |
| 44px+ | 1.1-1.2 |

## Ensure Ideal Line Length

**Optimal line length:** 45-75 characters per line

**Why it matters:**
- Too short: Eye jumps too often, tiring
- Too long: Hard to find next line, lose place
- Optimal: Comfortable reading rhythm

### Measuring Line Length

Use `ch` unit in CSS (width of "0" character)
```css
p { max-width: 65ch; }
```

### Implementation

- Set max-width on text containers
- Don't let text span full width on large screens
- Multi-column layouts for wide screens

## Left Align Text

**Default alignment: Left** (for left-to-right languages)

### Why Left Alignment?

- Creates consistent left edge
- Eye knows exactly where to return
- Easiest to scan and read
- Works with screen magnifiers

### When to Center

- Short headings (1-3 lines max)
- Hero text
- Single buttons/CTAs
- Labels on symmetric elements

### When NOT to Center

- Body paragraphs
- Long headings
- Multiple lines of text
- Form labels
- Lists

### Never Justify

Justified text creates:
- Uneven word spacing
- "Rivers" of white space
- Reading difficulty
- Accessibility issues

## Decrease Letter Spacing for Large Text

**Letter spacing (tracking):** Space between characters

### Guidelines

| Text Size | Letter Spacing |
|-----------|---------------|
| Body (16-18px) | 0 (default) |
| Small text | +0.02em to +0.05em |
| Large headings (28px+) | -0.01em to -0.03em |
| Very large display (44px+) | -0.02em to -0.04em |

**Why decrease for large text?**
- Large text already has enough visual space
- Tighter spacing looks more refined
- Creates cohesive headlines

**Why increase for small text?**
- Improves readability
- Characters don't merge together

## Ensure Text on Photos is Legible

Text over images is often hard to read due to varying background colours.

### 4 Solutions

**1. Gradient Overlay**
Add a semi-transparent gradient (usually dark to transparent) behind text
```css
background: linear-gradient(transparent, rgba(0,0,0,0.7));
```

**2. Full Image Overlay**
Semi-transparent solid colour over entire image
```css
background: rgba(0,0,0,0.4);
```

**3. Blur Background**
Blur the area behind text
```css
backdrop-filter: blur(10px);
```

**4. Solid Background**
Place text in solid colour container
```css
background: rgba(255,255,255,0.9);
```

### Best Practice

- Test with various images
- Ensure contrast meets 4.5:1 (or 3:1 for large text)
- Consider adding text shadow for extra definition

## Avoid Light Grey and Pure Black Text

### Light Grey Text

**Problem:** Insufficient contrast, hard to read, accessibility failure

**Rule:** Body text should have at least 4.5:1 contrast ratio

### Pure Black Text

**Problem:** Can be harsh, especially on pure white background

**Recommendation:** Use very dark grey instead
- HSB: ~220, 60, 20 (darkest variation from palette)
- Slightly softer appearance
- Still passes accessibility

### Sweet Spot

- Body text: Dark grey (not pure black)
- Headings: Can be darker (darkest from palette)
- Secondary text: Medium grey (maintaining 4.5:1)

## UPPERCASE Guidelines

### Problems with UPPERCASE

- **Harder to read** - Lose word shapes (ascenders/descenders)
- **FEELS LIKE SHOUTING** - Aggressive tone
- **Accessibility issues** - Screen readers may spell out
- **Takes more space** - Same content, wider

### Acceptable Uses for UPPERCASE

- Short labels (1-3 words)
- Category tags
- Buttons (if styled appropriately)
- Emphasis in short headings

### When Using UPPERCASE

1. **Bold weight** - Thin uppercase is very hard to read
2. **Larger size** - At least 11-12px
3. **Increased letter spacing** - +0.05em to +0.1em (opens up cramped appearance)
4. **Limited length** - Only for short text
