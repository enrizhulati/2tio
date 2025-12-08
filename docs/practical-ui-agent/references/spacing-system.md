# Spacing System Reference (Agent Execution)

## Quick Reference: 8pt Spacing Scale

| Token | Value | Pixels | Rem | Usage |
|-------|-------|--------|-----|-------|
| `--space-2xs` | 4px | 4 | 0.25 | Icon internal padding |
| `--space-xs` | 8px | 8 | 0.5 | Icon-to-label, tight coupling |
| `--space-sm` | 16px | 16 | 1 | Related elements, form fields |
| `--space-md` | 24px | 24 | 1.5 | Between groups, card padding |
| `--space-lg` | 32px | 32 | 2 | Section spacing |
| `--space-xl` | 48px | 48 | 3 | Major sections |
| `--space-2xl` | 64px | 64 | 4 | Page sections |
| `--space-3xl` | 80px | 80 | 5 | Hero areas, major breaks |

---

## Workflow: Audit Existing Spacing

### Step 1: Extract All Spacing Values

```bash
# Extract margin values
grep -rohE "margin[^:]*:\s*-?[0-9]+(\.[0-9]+)?(px|rem|em)" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+(\.[0-9]+)?(px|rem|em)" | sort | uniq -c | sort -rn

# Extract padding values
grep -rohE "padding[^:]*:\s*[0-9]+(\.[0-9]+)?(px|rem|em)" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+(\.[0-9]+)?(px|rem|em)" | sort | uniq -c | sort -rn

# Extract gap values
grep -rohE "gap:\s*[0-9]+(\.[0-9]+)?(px|rem|em)" --include="*.css" --include="*.scss" . | \
  grep -oE "[0-9]+(\.[0-9]+)?(px|rem|em)" | sort | uniq -c | sort -rn
```

### Step 2: Identify Non-8pt Values

```javascript
function findNon8ptValues(cssContent) {
  const spacingRegex = /(margin|padding|gap)[^:]*:\s*(-?\d+(?:\.\d+)?)(px|rem|em)/gi;
  const issues = [];
  const valid8pt = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 112, 128];
  
  let match;
  while ((match = spacingRegex.exec(cssContent)) !== null) {
    let value = parseFloat(match[2]);
    const unit = match[3];
    
    // Convert rem/em to px (assuming 16px base)
    if (unit === 'rem' || unit === 'em') {
      value = value * 16;
    }
    
    // Check if it's a valid 8pt value
    if (!valid8pt.includes(Math.abs(value))) {
      const nearestValid = findNearest(Math.abs(value), valid8pt);
      issues.push({
        property: match[1],
        original: `${match[2]}${unit}`,
        originalPx: value,
        nearest8pt: nearestValid,
        suggestedToken: getTokenForValue(nearestValid),
        line: getLineNumber(cssContent, match.index)
      });
    }
  }
  
  return issues;
}

function findNearest(value, validValues) {
  return validValues.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function getTokenForValue(px) {
  const tokenMap = {
    4: '--space-2xs',
    8: '--space-xs',
    16: '--space-sm',
    24: '--space-md',
    32: '--space-lg',
    48: '--space-xl',
    64: '--space-2xl',
    80: '--space-3xl'
  };
  return tokenMap[px] || `${px}px`;
}
```

### Step 3: Generate Report

```javascript
function generateSpacingReport(issues) {
  const grouped = {};
  
  issues.forEach(issue => {
    const key = issue.original;
    if (!grouped[key]) {
      grouped[key] = { 
        count: 0, 
        suggested: issue.nearest8pt,
        token: issue.suggestedToken,
        locations: []
      };
    }
    grouped[key].count++;
    grouped[key].locations.push(issue.line);
  });
  
  return Object.entries(grouped)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([original, data]) => ({
      original,
      occurrences: data.count,
      replace: data.token,
      locations: data.locations.slice(0, 5)
    }));
}
```

---

## Workflow: Implement Spacing System

### Step 1: Create Spacing Tokens File

```css
/* spacing-tokens.css */
:root {
  /* 8pt spacing scale */
  --space-2xs: 0.25rem;  /* 4px */
  --space-xs: 0.5rem;    /* 8px */
  --space-sm: 1rem;      /* 16px */
  --space-md: 1.5rem;    /* 24px */
  --space-lg: 2rem;      /* 32px */
  --space-xl: 3rem;      /* 48px */
  --space-2xl: 4rem;     /* 64px */
  --space-3xl: 5rem;     /* 80px */
  
  /* Semantic spacing aliases */
  --space-section: var(--space-xl);
  --space-card: var(--space-md);
  --space-stack: var(--space-md);
  --space-inline: var(--space-xs);
  --space-form-gap: var(--space-md);
}
```

### Step 2: Create Utility Classes (Optional)

```css
/* spacing-utilities.css */

/* Margin utilities */
.m-0 { margin: 0; }
.m-xs { margin: var(--space-xs); }
.m-sm { margin: var(--space-sm); }
.m-md { margin: var(--space-md); }
.m-lg { margin: var(--space-lg); }
.m-xl { margin: var(--space-xl); }

.mt-0 { margin-top: 0; }
.mt-xs { margin-top: var(--space-xs); }
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mt-xl { margin-top: var(--space-xl); }

/* Repeat for mb, ml, mr, mx, my */

/* Padding utilities */
.p-0 { padding: 0; }
.p-xs { padding: var(--space-xs); }
.p-sm { padding: var(--space-sm); }
.p-md { padding: var(--space-md); }
.p-lg { padding: var(--space-lg); }
.p-xl { padding: var(--space-xl); }

/* Repeat for pt, pb, pl, pr, px, py */

/* Gap utilities */
.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }
```

---

## Fix Patterns

### Common Replacements

| Original | Token | Sed Command |
|----------|-------|-------------|
| `5px` | `--space-2xs` | `sed -i 's/: 5px/: var(--space-2xs)/g'` |
| `10px` | `--space-xs` | `sed -i 's/: 10px/: var(--space-xs)/g'` |
| `12px` | `--space-xs` | `sed -i 's/: 12px/: var(--space-xs)/g'` |
| `15px` | `--space-sm` | `sed -i 's/: 15px/: var(--space-sm)/g'` |
| `20px` | `--space-md` | `sed -i 's/: 20px/: var(--space-md)/g'` |
| `25px` | `--space-md` | `sed -i 's/: 25px/: var(--space-md)/g'` |
| `30px` | `--space-lg` | `sed -i 's/: 30px/: var(--space-lg)/g'` |
| `40px` | `--space-xl` | `sed -i 's/: 40px/: var(--space-xl)/g'` |
| `50px` | `--space-xl` | `sed -i 's/: 50px/: var(--space-xl)/g'` |
| `60px` | `--space-2xl` | `sed -i 's/: 60px/: var(--space-2xl)/g'` |

### Bulk Replace Script

```bash
#!/bin/bash
# replace-spacing.sh

# Map arbitrary values to nearest 8pt token
declare -A SPACING_MAP=(
  ["5px"]="var(--space-2xs)"
  ["6px"]="var(--space-xs)"
  ["10px"]="var(--space-xs)"
  ["12px"]="var(--space-xs)"
  ["14px"]="var(--space-sm)"
  ["15px"]="var(--space-sm)"
  ["18px"]="var(--space-sm)"
  ["20px"]="var(--space-md)"
  ["22px"]="var(--space-md)"
  ["25px"]="var(--space-md)"
  ["28px"]="var(--space-lg)"
  ["30px"]="var(--space-lg)"
  ["35px"]="var(--space-lg)"
  ["40px"]="var(--space-xl)"
  ["45px"]="var(--space-xl)"
  ["50px"]="var(--space-xl)"
  ["60px"]="var(--space-2xl)"
  ["70px"]="var(--space-2xl)"
)

for file in $(find . -name "*.css" -o -name "*.scss"); do
  for original in "${!SPACING_MAP[@]}"; do
    replacement="${SPACING_MAP[$original]}"
    sed -i "s/: ${original}/: ${replacement}/g" "$file"
    sed -i "s/ ${original}/ ${replacement}/g" "$file"
  done
done
```

---

## Spacing Rules by Context

### Cards
```css
.card {
  padding: var(--space-md);           /* 24px internal padding */
  gap: var(--space-sm);               /* 16px between children */
}

.card-grid {
  gap: var(--space-md);               /* 24px between cards */
}
```

### Forms
```css
.form-group {
  margin-bottom: var(--space-md);     /* 24px between fields */
}

.form-label {
  margin-bottom: var(--space-xs);     /* 8px label to input */
}

.form-hint {
  margin-top: var(--space-2xs);       /* 4px hint below input */
}
```

### Buttons
```css
.btn {
  padding: var(--space-xs) var(--space-sm);  /* 8px 16px */
  gap: var(--space-xs);                       /* 8px icon to text */
}

.btn-lg {
  padding: var(--space-sm) var(--space-md);  /* 16px 24px */
}
```

### Sections
```css
section {
  padding: var(--space-xl) 0;         /* 48px vertical */
}

.section-header {
  margin-bottom: var(--space-lg);     /* 32px below header */
}
```

### Lists
```css
.list-item {
  padding: var(--space-sm);           /* 16px all around */
}

.list-item + .list-item {
  margin-top: var(--space-xs);        /* 8px between items */
}
```

---

## Validation

```javascript
function validateSpacing(cssContent) {
  const valid8pt = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 112, 128];
  const spacingRegex = /(margin|padding|gap)[^:]*:\s*(-?\d+(?:\.\d+)?)(px)/gi;
  const violations = [];
  
  let match;
  while ((match = spacingRegex.exec(cssContent)) !== null) {
    const value = Math.abs(parseFloat(match[2]));
    
    // Skip 0, 1, 2, 3 (common edge cases)
    if (value <= 3) continue;
    
    // Skip if it's a CSS variable
    if (match[0].includes('var(')) continue;
    
    if (!valid8pt.includes(value)) {
      violations.push({
        property: match[1],
        value: `${match[2]}px`,
        suggestion: `${findNearest(value, valid8pt)}px or var(--space-*)`
      });
    }
  }
  
  return {
    passed: violations.length === 0,
    violations
  };
}
```

---

## Agent Decision Tree: Spacing

```
User request mentions spacing/layout/padding/margin?
├─ YES: Run spacing audit
│   └─ Issues found?
│       ├─ YES: 
│       │   ├─ Generate replacement mapping
│       │   ├─ Apply fixes (sed or manual)
│       │   └─ Validate result
│       └─ NO: Report "Spacing system compliant"
│
└─ NO: Check if other workflow applies
```
