# Color System Reference (Agent Execution)

## Quick Reference: Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--color-primary` | Brand color, 4.5:1 vs white | Brand color, 4.5:1 vs dark bg | Interactive elements |
| `--color-text-primary` | HSL(hue, 50%, 15%) | HSL(0, 0%, 100%) | Headings |
| `--color-text-secondary` | HSL(hue, 20%, 40%) | HSL(hue, 4%, 80%) | Body text |
| `--color-text-tertiary` | HSL(hue, 15%, 55%) | HSL(hue, 6%, 65%) | Meta, captions |
| `--color-border` | HSL(hue, 15%, 75%) | HSL(hue, 6%, 65%) | Form fields (3:1) |
| `--color-border-light` | HSL(hue, 10%, 88%) | HSL(hue, 8%, 33%) | Decorative |
| `--color-surface` | HSL(hue, 10%, 98%) | HSL(hue, 10%, 23%) | Alt background |
| `--color-background` | HSL(0, 0%, 100%) | HSL(hue, 15%, 15%) | Main background |

---

## Workflow: Create Color Palette from Brand Color

### Input Required
- Brand color (hex, RGB, or HSL)
- Mode: `light` | `dark` | `both`

### Step 1: Convert to HSL

```javascript
function hexToHSL(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
```

### Step 2: Generate Light Mode Palette

```javascript
function generateLightPalette(brandHex) {
  const { h } = hexToHSL(brandHex);
  
  return {
    // Primary - must pass 4.5:1 against white
    primary: adjustForContrast(`hsl(${h}, 70%, 50%)`, '#ffffff', 4.5),
    primaryHover: `hsl(${h}, 70%, 42%)`,
    
    // Text colors - all must pass 4.5:1 against white
    textPrimary: `hsl(${h}, 50%, 15%)`,     // ~12:1 contrast
    textSecondary: `hsl(${h}, 20%, 40%)`,   // ~6:1 contrast
    textTertiary: `hsl(${h}, 15%, 46%)`,    // ~4.6:1 contrast (minimum)
    
    // Borders
    border: `hsl(${h}, 15%, 75%)`,          // 3:1 for UI
    borderLight: `hsl(${h}, 10%, 88%)`,     // Decorative
    
    // Backgrounds
    surface: `hsl(${h}, 10%, 98%)`,
    background: `hsl(0, 0%, 100%)`,
    
    // System colors
    error: 'hsl(0, 70%, 50%)',
    errorBg: 'hsl(0, 70%, 97%)',
    warning: 'hsl(40, 90%, 50%)',
    warningBg: 'hsl(40, 90%, 97%)',
    success: 'hsl(140, 60%, 35%)',
    successBg: 'hsl(140, 60%, 97%)'
  };
}
```

### Step 3: Generate Dark Mode Palette

```javascript
function generateDarkPalette(brandHex) {
  const { h } = hexToHSL(brandHex);
  
  return {
    // Primary - must pass 4.5:1 against dark bg
    primary: adjustForContrast(`hsl(${h}, 50%, 65%)`, `hsl(${h}, 15%, 15%)`, 4.5),
    primaryHover: `hsl(${h}, 50%, 72%)`,
    
    // Text colors
    textPrimary: `hsl(0, 0%, 100%)`,        // White for headings
    textSecondary: `hsl(${h}, 4%, 80%)`,    // ~8:1 contrast
    textTertiary: `hsl(${h}, 6%, 65%)`,     // ~5:1 contrast
    
    // Borders
    border: `hsl(${h}, 6%, 45%)`,           // 3:1 for UI
    borderLight: `hsl(${h}, 8%, 30%)`,      // Decorative
    
    // Backgrounds
    surface: `hsl(${h}, 10%, 20%)`,
    background: `hsl(${h}, 15%, 12%)`,
    
    // System colors (adjusted for dark)
    error: 'hsl(0, 70%, 65%)',
    errorBg: 'hsl(0, 70%, 15%)',
    warning: 'hsl(40, 90%, 60%)',
    warningBg: 'hsl(40, 50%, 15%)',
    success: 'hsl(140, 60%, 55%)',
    successBg: 'hsl(140, 40%, 15%)'
  };
}
```

### Step 4: Validate Contrast

```javascript
function validatePalette(palette, mode = 'light') {
  const bg = mode === 'light' ? '#ffffff' : palette.background;
  const issues = [];
  
  const requirements = {
    primary: { against: bg, min: 4.5, usage: 'interactive text' },
    textPrimary: { against: bg, min: 4.5, usage: 'headings' },
    textSecondary: { against: bg, min: 4.5, usage: 'body text' },
    textTertiary: { against: bg, min: 4.5, usage: 'meta text' },
    border: { against: bg, min: 3, usage: 'form fields' }
  };
  
  Object.entries(requirements).forEach(([token, req]) => {
    const ratio = getContrastRatio(palette[token], req.against);
    if (ratio < req.min) {
      issues.push({
        token,
        currentRatio: ratio.toFixed(2),
        required: req.min,
        usage: req.usage,
        fix: `Darken color to achieve ${req.min}:1`
      });
    }
  });
  
  return { valid: issues.length === 0, issues };
}
```

---

## Workflow: Audit Existing Colors

### Step 1: Extract All Colors

```bash
# Extract hex colors
grep -rohE "#[0-9a-fA-F]{3,8}" --include="*.css" --include="*.scss" . | sort | uniq -c | sort -rn

# Extract rgb/rgba colors
grep -rohE "rgba?\([^)]+\)" --include="*.css" --include="*.scss" . | sort | uniq -c | sort -rn

# Extract hsl/hsla colors
grep -rohE "hsla?\([^)]+\)" --include="*.css" --include="*.scss" . | sort | uniq -c | sort -rn

# Extract named colors
grep -rohE "color:\s*[a-zA-Z]+" --include="*.css" --include="*.scss" . | sort | uniq -c | sort -rn
```

### Step 2: Categorize Colors

```javascript
function categorizeColors(extractedColors) {
  const categories = {
    grays: [],       // Neutral grays (low saturation)
    brand: [],       // Saturated colors (likely brand)
    system: [],      // Red, green, yellow (status)
    unknown: []
  };
  
  extractedColors.forEach(color => {
    const hsl = toHSL(color);
    
    if (hsl.s < 10) {
      categories.grays.push(color);
    } else if (isSystemColor(hsl)) {
      categories.system.push(color);
    } else if (hsl.s > 30) {
      categories.brand.push(color);
    } else {
      categories.unknown.push(color);
    }
  });
  
  return categories;
}

function isSystemColor(hsl) {
  // Red: 0-15 or 345-360
  // Yellow/Orange: 25-55
  // Green: 100-160
  const h = hsl.h;
  return (h <= 15 || h >= 345) || (h >= 25 && h <= 55) || (h >= 100 && h <= 160);
}
```

### Step 3: Map to Design Tokens

```javascript
function mapToTokens(categories, brandHue) {
  const mapping = [];
  
  // Sort grays by lightness
  const sortedGrays = categories.grays.sort((a, b) => toHSL(b).l - toHSL(a).l);
  
  // Map grays to text/border tokens
  sortedGrays.forEach(gray => {
    const { l } = toHSL(gray);
    let token;
    
    if (l <= 25) token = '--color-text-primary';
    else if (l <= 45) token = '--color-text-secondary';
    else if (l <= 60) token = '--color-text-tertiary';
    else if (l <= 80) token = '--color-border';
    else if (l <= 92) token = '--color-border-light';
    else token = '--color-surface';
    
    mapping.push({ original: gray, token, confidence: 'high' });
  });
  
  // Map brand colors
  categories.brand.forEach(color => {
    const { h, s, l } = toHSL(color);
    const hueDiff = Math.abs(h - brandHue);
    
    if (hueDiff < 30 && s > 50) {
      mapping.push({ 
        original: color, 
        token: l > 50 ? '--color-primary' : '--color-primary-hover',
        confidence: 'high'
      });
    }
  });
  
  return mapping;
}
```

---

## Fix Patterns

### Replace Hardcoded Colors with Tokens

**Detection:**
```bash
# Find hardcoded colors in CSS
grep -rn --include="*.css" -E "color:\s*#[0-9a-fA-F]+" .
grep -rn --include="*.css" -E "background(-color)?:\s*#[0-9a-fA-F]+" .
grep -rn --include="*.css" -E "border(-color)?:\s*#[0-9a-fA-F]+" .
```

**Fix mapping:**

| Pattern | Replace With |
|---------|--------------|
| `color: #333` / `#222` / `#111` | `color: var(--color-text-primary)` |
| `color: #666` / `#555` | `color: var(--color-text-secondary)` |
| `color: #888` / `#999` / `#777` | `color: var(--color-text-tertiary)` |
| `color: #ccc` / `#ddd` | `color: var(--color-border)` |
| `background: #f5f5f5` / `#fafafa` | `background: var(--color-surface)` |
| `background: #fff` / `white` | `background: var(--color-background)` |
| `border-color: #ddd` / `#e0e0e0` | `border-color: var(--color-border)` |
| `border-color: #eee` / `#f0f0f0` | `border-color: var(--color-border-light)` |

### Sed Commands for Bulk Replace

```bash
# Replace gray text colors
sed -i 's/color:\s*#333/color: var(--color-text-primary)/g' *.css
sed -i 's/color:\s*#666/color: var(--color-text-secondary)/g' *.css
sed -i 's/color:\s*#999/color: var(--color-text-tertiary)/g' *.css

# Replace background colors
sed -i 's/background:\s*#f[5-9a-f][5-9a-f][5-9a-f][5-9a-f][5-9a-f]/background: var(--color-surface)/g' *.css
sed -i 's/background:\s*#fff/background: var(--color-background)/g' *.css

# Replace border colors  
sed -i 's/border-color:\s*#[cde][cde][cde]/border-color: var(--color-border)/g' *.css
```

---

## Output: CSS Custom Properties

Generate this file after running the workflow:

```css
/* Generated color tokens - [DATE] */
/* Brand color: [ORIGINAL_HEX] */

:root {
  /* Light mode (default) */
  --color-primary: [CALCULATED];
  --color-primary-hover: [CALCULATED];
  
  --color-text-primary: [CALCULATED];
  --color-text-secondary: [CALCULATED];
  --color-text-tertiary: [CALCULATED];
  
  --color-border: [CALCULATED];
  --color-border-light: [CALCULATED];
  
  --color-surface: [CALCULATED];
  --color-background: #ffffff;
  
  --color-error: hsl(0, 70%, 50%);
  --color-error-bg: hsl(0, 70%, 97%);
  --color-warning: hsl(40, 90%, 50%);
  --color-warning-bg: hsl(40, 90%, 97%);
  --color-success: hsl(140, 60%, 35%);
  --color-success-bg: hsl(140, 60%, 97%);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: [CALCULATED];
    --color-primary-hover: [CALCULATED];
    
    --color-text-primary: #ffffff;
    --color-text-secondary: [CALCULATED];
    --color-text-tertiary: [CALCULATED];
    
    --color-border: [CALCULATED];
    --color-border-light: [CALCULATED];
    
    --color-surface: [CALCULATED];
    --color-background: [CALCULATED];
    
    --color-error: hsl(0, 70%, 65%);
    --color-error-bg: hsl(0, 70%, 15%);
    --color-warning: hsl(40, 90%, 60%);
    --color-warning-bg: hsl(40, 50%, 15%);
    --color-success: hsl(140, 60%, 55%);
    --color-success-bg: hsl(140, 40%, 15%);
  }
}

/* Manual dark mode class */
.dark {
  --color-primary: [CALCULATED];
  /* ... same as @media block */
}
```

---

## Validation Checklist

```javascript
const colorValidation = {
  // All must pass
  checks: [
    { name: 'Primary text contrast', test: () => getContrastRatio('--color-text-primary', '--color-background') >= 4.5 },
    { name: 'Secondary text contrast', test: () => getContrastRatio('--color-text-secondary', '--color-background') >= 4.5 },
    { name: 'Tertiary text contrast', test: () => getContrastRatio('--color-text-tertiary', '--color-background') >= 4.5 },
    { name: 'Border contrast', test: () => getContrastRatio('--color-border', '--color-background') >= 3 },
    { name: 'Primary on white', test: () => getContrastRatio('--color-primary', '#ffffff') >= 4.5 },
    { name: 'Error text contrast', test: () => getContrastRatio('--color-error', '--color-background') >= 4.5 },
    { name: 'Success text contrast', test: () => getContrastRatio('--color-success', '--color-background') >= 4.5 },
  ],
  
  run() {
    return this.checks.map(check => ({
      name: check.name,
      passed: check.test()
    }));
  }
};
```
