# Chapter 3: Colour

## Ensure Sufficient Contrast

**Definition:** Contrast is a measure of the difference in perceived brightness between two colours. It's expressed as a ratio ranging from 1:1 to 21:1.

- Black text on black background = 1:1 (lowest)
- Black text on white background = 21:1 (highest)

### WCAG 2.1 Level AA Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Small text (18px or less) | 4.5:1 |
| Large text (24px regular+ or 18px bold+) | 3:1 |
| UI elements (form fields, icons, etc.) | 3:1 |

Decorative elements and styles that don't convey meaning don't need to meet these ratios.

### Common Contrast Problems

- Close icon contrast less than 3:1
- Secondary text contrast less than 4.5:1
- Search field border contrast less than 3:1
- Placeholder text less than 4.5:1
- Button background contrast against white text less than 4.5:1
- Link text contrast less than 4.5:1

### APCA: An Improved Contrast Algorithm

**Accessible Perceptual Contrast Algorithm (APCA)** is part of the WCAG 3 draft and fixes limitations of WCAG 2.

**Example problem with WCAG 2:**
White text on orange background FAILS WCAG 2 (3.04:1), but black text PASSES (4.5:1). However, white text is clearly easier to read. APCA correctly scores white text higher (62) than black (43).

**APCA uses numbers instead of ratios:**
| APCA Value | Usage |
|------------|-------|
| 90 | Preferred for body text (14px regular+) |
| 75 | Minimum for body text (18px regular+) |
| 60 | Minimum for other text (24px regular or 16px bold+) |
| 45 | Minimum for large text (36px regular or 24px bold+) and UI elements |
| 30 | Absolute minimum for placeholder text, disabled buttons |
| 15 | Minimum for non-text elements |

**Key APCA differences from WCAG 2:**
1. Swapping text and background colours affects contrast (white on blue ≠ blue on white)
2. Works better for dark interfaces (WCAG 2 results in hard-to-read text on dark backgrounds)

**Recommendation:**
- Personal projects: Use APCA
- Commercial projects requiring compliance: Stick with WCAG 2 until WCAG 3 is released
- Ideally, pass both

## Don't Rely on Colour Alone to Convey Meaning

Many types of colour blindness exist, mainly affecting men. Most common: difficulty distinguishing red and green. Some can't see any colour at all.

**Rule:** Use additional visual cues to differentiate interface elements beyond colour.

### Example: Form Errors

**Bad:** Red border only indicates error
**Good:** Red border + icon + thicker border + background shade

### Example: Text Links

**Bad:** Blue colour only indicates link
**Good:** Blue colour + underline

The underline clearly differentiates the link from other text for colour blind users.

## Use System Colours to Indicate Status

Three system colours for status messages:

| Colour | Meaning | Usage |
|--------|---------|-------|
| Red | Error | Negative message, system failure, urgent attention needed |
| Amber/Yellow | Warning | Caution, action could be risky |
| Green | Success | Positive message, action completed as expected |

Traffic light colours are used because they have familiar meanings.

### Accessibility for System Colours

- Use additional visual cues (icons) for colour blind users
- Text in system colours: at least 4.5:1 contrast
- Icons/UI components in system colours: at least 3:1 contrast

**Info/Blue:** Some systems add a fourth colour (blue) for informational messages.

## Use Colour to Define a Clear Visual Hierarchy

Not all information has the same importance. Present information in order of importance by making more important elements more prominent.

### Tools for Colour Hierarchy

**Saturation:** Degree of richness/intensity of a colour
- More saturated colours = more prominent
- Use saturated colours for text links and buttons

**Hue:** Number between 0-360 degrees (rainbow colours)
- Some hues are more prominent (e.g., red stands out most)
- Use prominent hues for urgent elements

**Contrast:** Difference in brightness between colours
- Higher contrast = more prominent
- Make headings darker than body text

## Understand Light and Dark Interfaces

### Light Interfaces
- Dark text and elements on light background
- Most common approach
- Simplest: black on white
- Generally safest—simple, legible, familiar

### Dark Interfaces
- Light text and elements on dark background
- Simplest: white on black
- Great for media-focused apps
- Can be challenging for contrast
- Popular for "dark mode" preferences

### When to Use Each

**Light interfaces best for:**
- Most websites and applications
- Reading-heavy content
- Universal appeal
- Easiest to make accessible

**Dark interfaces best for:**
- Media/video applications
- Gaming
- Low-light environments
- Brands with dark aesthetic

## Use Black and White for a Timeless Aesthetic

Black and white creates a clean, timeless look that won't age quickly. It:
- Lets content shine
- Works for almost any brand
- Avoids trend-dependent colour choices
- Easy to maintain accessibility

## Add a Tinge of Colour to Black and White

Pure black and white can feel cold or harsh. Add a slight tinge of the brand colour to create warmth and cohesion without overwhelming the interface.

**Example:** Instead of pure grey (#808080), use a grey with slight blue tinge (HSB: 220, 10, 50).

## Use 1 Brand Colour

Using a single brand colour:
- Creates a simple, cohesive look
- Allows colour to have functional purpose (indicating interactivity)
- Reduces cognitive load
- Conveys strong brand presence

Most brands consist of a single primary colour, so a monochromatic approach reinforces brand identity.

## Apply the Brand Colour to Interactive Elements

Use colour sparingly and with purpose. Avoid using colour purely for decoration.

**Approach:**
1. Start with black and white
2. Introduce colour only where it conveys meaning
3. Apply brand colour to interactive elements (links, buttons)

This teaches users what's interactive and what's not.

**Important:** Don't apply brand colour to non-interactive elements (like headings), as they could be mistaken for links.

### Contrast Requirements for Brand Colour

**Light interfaces:** Brand colour must have 4.5:1 contrast ratio against background (usually white)

**Dark interfaces:** Brand colour must have 4.5:1 contrast ratio against dark background

### Multiple Brand Colours

If you have multiple brand colours:
- Use the highest contrast colour for interactive elements
- Use others sparingly for decorative elements
- Don't use multiple colours for interactive elements (confusing)

## Create a Monochromatic Colour Palette

Rather than unlimited colour options, create a small set of predefined colours (colour palette). This:
- Makes colour decisions faster and easier
- Results in more consistent design

### What is Monochromatic?

Variations of a single colour, rather than neutral greys. Start with the brand colour and change saturation and brightness to create variations.

**Benefits:**
- Simple and cohesive look
- Colour assigned functional purpose
- Fewer colours = less cognitive load
- Strong brand presence

## Use the HSB Colour System

HSB (Hue, Saturation, Brightness) makes defining colour variations much easier.

| Component | Range | Description |
|-----------|-------|-------------|
| Hue | 0-360° | Rainbow colours |
| Saturation | 0-100 | Intensity/richness (100=rich, 0=grey) |
| Brightness | 0-100 | Lightness/darkness (100=lightest, 0=black) |

## Create a Light Colour Palette

### 7-Part Light Mode Palette

| Variation | HSB Example | Usage | Contrast Requirement |
|-----------|-------------|-------|---------------------|
| Primary | 230, 70, 80 | Actions, interactive elements | 4.5:1 vs lightest |
| Darkest | 230, 60, 20 | Heading text, primary content | 4.5:1 vs lightest |
| Dark | 230, 30, 45 | Secondary/supporting text | 4.5:1 vs lightest |
| Medium | 230, 20, 66 | Non-decorative borders (form fields) | 3:1 vs lightest |
| Light | 230, 10, 95 | Decorative borders | Decorative—no requirement |
| Lightest | 230, 2, 98 | Alternate backgrounds | Must support contrast for text/UI |
| White | 0, 0, 100 | Main background | Must support contrast for text/UI |

### Creating Each Variation

**Primary Colour:**
- Use the main brand colour
- Must have 4.5:1 contrast against lightest variation

**Darkest Variation:**
- Greatly decrease brightness
- Heavily saturate (dark colours need more saturation)
- Aim for very dark grey with tinge of primary

**Dark Variation:**
- Increase brightness from darkest
- Decrease saturation
- Aim for dark grey with tinge of primary

**Medium Variation:**
- Increase brightness from dark
- Decrease saturation
- Aim for medium grey with tinge of primary

**Light Variation:**
- Increase brightness from medium
- Decrease saturation
- Aim for light grey with tinge of primary

**Lightest Variation:**
- Increase brightness from light
- Decrease saturation
- Aim for very light grey with tinge of primary

### Edge Cases for Brand Colours

**If brand colour has meaning (red, green, amber):**
- Consider using the darkest variation for interactive elements
- Or use blue for interactive elements (commonly associated with links)
- Avoids conflicting colour meanings

**If brand colour is too light (yellow):**
- Use darkest variation for button text instead of white
- Add border to buttons for 3:1 contrast
- Or use the light colour in a dark interface instead

## Create a Dark Colour Palette

### 7-Part Dark Mode Palette

| Variation | HSB Example | Usage | Contrast Requirement |
|-----------|-------------|-------|---------------------|
| Primary | 166, 50, 90 | Actions, interactive elements | 4.5:1 vs dark |
| White | 0, 0, 100 | Heading text | 4.5:1 vs dark |
| Lightest | 166, 4, 80 | Secondary text | 4.5:1 vs dark |
| Light | 166, 6, 65 | Non-decorative borders | 3:1 vs dark |
| Medium | 166, 8, 33 | Decorative borders | Decorative—no requirement |
| Dark | 166, 10, 23 | Alternate backgrounds | Must support contrast |
| Darkest | 166, 15, 15 | Main background | Must support contrast |

### Dark Palette Logic

The logic is essentially inverted from light mode:
- White replaces darkest for primary text
- Lightest replaces dark for secondary text
- Light replaces medium for borders
- Medium is decorative
- Dark and darkest are backgrounds

### Testing Your Palette

Test your colour palette using an interface example containing all variations. Seeing colours in context is the only way to be sure they work well together.

## Neutral Greys Alternative

If you prefer a more neutral colour palette:
- Set saturation to zero for all variations
- Keep the primary brand colour as-is
- Results in pure grey variations rather than tinted greys

## Adjust Photo Colour Temperature

Photos should match your interface's colour palette. Adjust colour temperature:

**Warm palette:** Slightly warm photo temperature
**Cool palette:** Slightly cool photo temperature

This creates visual cohesion between photos and the interface.
