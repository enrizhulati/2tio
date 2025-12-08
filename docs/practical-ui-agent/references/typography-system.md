# Typography System Reference (Agent Execution)

## Quick Reference: Type Scale (1.25 Ratio)

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-xs` | 12px / 0.75rem | 400 | 1.5 | Fine print only |
| `--text-sm` | 14px / 0.875rem | 400 | 1.5 | Captions, meta |
| `--text-base` | 16px / 1rem | 400 | 1.5 | UI text, short copy |
| `--text-md` | 18px / 1.125rem | 400 | 1.6 | Body text (minimum for long-form) |
| `--text-lg` | 22px / 1.375rem | 600 | 1.3 | H4, card titles |
| `--text-xl` | 28px / 1.75rem | 700 | 1.25 | H3 |
| `--text-2xl` | 35px / 2.188rem | 700 | 1.2 | H2 |
| `--text-3xl` | 44px / 2.75rem | 700 | 1.15 | H1 |

---

## Workflow: Audit Existing Typography

### Step 1: Extract All Font Sizes

```bash
# Extract font-size values
grep -rohE "font-size:\s*[0-9]+(\.[0-9]+)?(px|rem|em)" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+(\.[0-9]+)?(px|rem|em)" | sort | uniq -c | sort -rn

# Extract line-height values
grep -rohE "line-height:\s*[0-9]+(\.[0-9]+)?" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+(\.[0-9]+)?" | sort | uniq -c | sort -rn

# Extract font-weight values
grep -rohE "font-weight:\s*[0-9]+" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+" | sort | uniq -c | sort -rn
```

### Step 2: Identify Issues

```javascript
function auditTypography(cssContent) {
  const issues = [];
  
  // Check font sizes
  const fontSizeRegex = /font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)/gi;
  const validScale = [12, 14, 16, 18, 22, 28, 35, 44]; // 1.25 scale
  
  let match;
  while ((match = fontSizeRegex.exec(cssContent)) !== null) {
    let size = parseFloat(match[1]);
    const unit = match[2];
    
    if (unit === 'rem' || unit === 'em') size = size * 16;
    
    if (!validScale.includes(Math.round(size))) {
      issues.push({
        type: 'font-size',
        original: `${match[1]}${unit}`,
        originalPx: size,
        nearest: findNearestScale(size, validScale),
        token: getTypographyToken(findNearestScale(size, validScale))
      });
    }
  }
  
  // Check line heights for body text
  const lineHeightRegex = /font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)[^}]*line-height:\s*(\d+(?:\.\d+)?)/gi;
  while ((match = lineHeightRegex.exec(cssContent)) !== null) {
    let fontSize = parseFloat(match[1]);
    if (match[2] === 'rem' || match[2] === 'em') fontSize *= 16;
    
    const lineHeight = parseFloat(match[3]);
    
    // Body text (14-20px) should have line-height >= 1.5
    if (fontSize >= 14 && fontSize <= 20 && lineHeight < 1.5) {
      issues.push({
        type: 'line-height',
        fontSize: `${fontSize}px`,
        current: lineHeight,
        required: 1.5,
        fix: 'Increase line-height to at least 1.5 for body text'
      });
    }
  }
  
  // Check for body text < 16px
  const smallBodyRegex = /\bbody\b[^}]*font-size:\s*(\d+)(px)/gi;
  while ((match = smallBodyRegex.exec(cssContent)) !== null) {
    if (parseInt(match[1]) < 16) {
      issues.push({
        type: 'body-size',
        current: `${match[1]}px`,
        required: '16px minimum',
        fix: 'Increase body font size to at least 16px (18px recommended)'
      });
    }
  }
  
  return issues;
}

function findNearestScale(value, scale) {
  return scale.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function getTypographyToken(px) {
  const tokenMap = {
    12: '--text-xs',
    14: '--text-sm',
    16: '--text-base',
    18: '--text-md',
    22: '--text-lg',
    28: '--text-xl',
    35: '--text-2xl',
    44: '--text-3xl'
  };
  return tokenMap[px] || `${px}px`;
}
```

---

## Workflow: Implement Typography System

### Step 1: Create Typography Tokens

```css
/* typography-tokens.css */
:root {
  /* Font family */
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
  
  /* Type scale (1.25 ratio) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-md: 1.125rem;    /* 18px */
  --text-lg: 1.375rem;    /* 22px */
  --text-xl: 1.75rem;     /* 28px */
  --text-2xl: 2.188rem;   /* 35px */
  --text-3xl: 2.75rem;    /* 44px */
  
  /* Line heights */
  --leading-none: 1;
  --leading-tight: 1.15;   /* Large headings */
  --leading-snug: 1.25;    /* Small headings */
  --leading-normal: 1.5;   /* Body text minimum */
  --leading-relaxed: 1.65; /* Long-form reading */
  
  /* Font weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Letter spacing */
  --tracking-tight: -0.02em;  /* Large headings */
  --tracking-normal: 0;
  --tracking-wide: 0.05em;    /* Uppercase text */
}
```

### Step 2: Create Base Typography Styles

```css
/* typography-base.css */

/* Reset */
*, *::before, *::after {
  margin: 0;
  padding: 0;
}

/* Base */
html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-md);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-text-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin-top: 0;
}

h1 {
  font-size: var(--text-3xl);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-lg);
}

h2 {
  font-size: var(--text-2xl);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-md);
}

h3 {
  font-size: var(--text-xl);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-sm);
}

h4 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  margin-bottom: var(--space-sm);
}

h5, h6 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-xs);
}

/* Paragraphs */
p {
  margin-top: 0;
  margin-bottom: var(--space-md);
  max-width: 65ch; /* Optimal line length */
}

/* Small text */
small, .text-sm {
  font-size: var(--text-sm);
}

.text-xs {
  font-size: var(--text-xs);
}

/* Links */
a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 0.15em;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-hover);
}

/* Code */
code, kbd, samp {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

code {
  padding: 0.125em 0.25em;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
}

pre {
  overflow-x: auto;
  padding: var(--space-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

pre code {
  padding: 0;
  background: transparent;
}

/* Lists */
ul, ol {
  padding-left: var(--space-md);
  margin-bottom: var(--space-md);
}

li {
  margin-bottom: var(--space-xs);
}

li::marker {
  color: var(--color-text-tertiary);
}
```

---

## Fix Patterns

### Font Size Mapping

| Original | Token | Sed Command |
|----------|-------|-------------|
| `11px`, `12px` | `--text-xs` | `sed -i 's/font-size:\s*1[12]px/font-size: var(--text-xs)/g'` |
| `13px`, `14px`, `15px` | `--text-sm` | `sed -i 's/font-size:\s*1[345]px/font-size: var(--text-sm)/g'` |
| `16px`, `17px` | `--text-base` | `sed -i 's/font-size:\s*1[67]px/font-size: var(--text-base)/g'` |
| `18px`, `19px`, `20px` | `--text-md` | `sed -i 's/font-size:\s*1[89]px\|20px/font-size: var(--text-md)/g'` |
| `21px`-`24px` | `--text-lg` | `sed -i 's/font-size:\s*2[1234]px/font-size: var(--text-lg)/g'` |
| `25px`-`30px` | `--text-xl` | `sed -i 's/font-size:\s*2[5-9]px\|30px/font-size: var(--text-xl)/g'` |
| `31px`-`38px` | `--text-2xl` | `sed -i 's/font-size:\s*3[1-8]px/font-size: var(--text-2xl)/g'` |
| `39px`+ | `--text-3xl` | `sed -i 's/font-size:\s*[4-9][0-9]px/font-size: var(--text-3xl)/g'` |

### Line Height Fixes

```bash
# Find body text with insufficient line-height
grep -rn --include="*.css" -E "font-size:\s*(14|15|16|17|18|19|20)px" . | \
  xargs -I {} grep -l "line-height:\s*1\.[0-4]" {}

# Fix: Replace low line-heights in body text contexts
sed -i 's/line-height:\s*1\.[0-4]/line-height: var(--leading-normal)/g' *.css
```

### Heading Line Height Fixes

```css
/* Ensure headings have tighter line-height */
h1 { line-height: var(--leading-tight); }    /* 1.15 */
h2 { line-height: var(--leading-tight); }    /* 1.15 */
h3 { line-height: var(--leading-snug); }     /* 1.25 */
h4 { line-height: var(--leading-snug); }     /* 1.25 */
```

---

## Font Selection Criteria

### For Agent: Safe System Font Stack

```css
/* Always safe, no external loading */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Recommended Google Fonts (If Loading External)

| Font | Weight | Best For |
|------|--------|----------|
| Inter | 400, 500, 600, 700 | UI, body text |
| Open Sans | 400, 600, 700 | Body text, general |
| Roboto | 400, 500, 700 | UI, Android consistency |
| Source Sans Pro | 400, 600, 700 | Body text, long-form |
| Nunito | 400, 600, 700 | Friendly, approachable |
| Work Sans | 400, 500, 600, 700 | Modern, clean |

### Font Loading Best Practice

```html
<!-- Preconnect for faster loading -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load only needed weights -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
/* Font display: swap prevents FOIT */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  /* ... */
}
```

---

## Validation

```javascript
function validateTypography(cssContent, htmlContent) {
  const issues = [];
  
  // Check 1: Body font size >= 16px
  const bodyMatch = cssContent.match(/body[^}]*font-size:\s*(\d+)/);
  if (bodyMatch && parseInt(bodyMatch[1]) < 16) {
    issues.push({
      rule: 'body-size',
      current: `${bodyMatch[1]}px`,
      required: '>= 16px'
    });
  }
  
  // Check 2: Line height >= 1.5 for body text
  const lineHeightMatch = cssContent.match(/body[^}]*line-height:\s*(\d+\.?\d*)/);
  if (lineHeightMatch && parseFloat(lineHeightMatch[1]) < 1.5) {
    issues.push({
      rule: 'line-height',
      current: lineHeightMatch[1],
      required: '>= 1.5'
    });
  }
  
  // Check 3: Max line length ~65 characters
  const hasMaxWidth = /max-width:\s*(55|60|65|70|75)ch/.test(cssContent);
  if (!hasMaxWidth) {
    issues.push({
      rule: 'line-length',
      message: 'Consider adding max-width: 65ch to text containers'
    });
  }
  
  // Check 4: Headings use font-weight >= 600
  const headingWeights = cssContent.match(/h[1-6][^}]*font-weight:\s*(\d+)/g) || [];
  headingWeights.forEach(match => {
    const weight = parseInt(match.match(/(\d+)$/)[1]);
    if (weight < 600) {
      issues.push({
        rule: 'heading-weight',
        current: weight,
        required: '>= 600'
      });
    }
  });
  
  return {
    passed: issues.length === 0,
    issues
  };
}
```

---

## Agent Decision Tree: Typography

```
Request involves typography?
├─ YES: Determine sub-task
│   ├─ "audit typography" → Run auditTypography()
│   ├─ "implement type scale" → Create typography-tokens.css + typography-base.css
│   ├─ "fix font sizes" → Run sed replacements
│   └─ "add Google font" → Add preconnect + CSS link + font-family declaration
│
└─ NO: Check other workflow
```
