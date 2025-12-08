# Accessibility Reference (Agent Execution)

## Quick Reference: WCAG 2.1 AA Requirements

| Criterion | Requirement | Test Method |
|-----------|-------------|-------------|
| 1.4.3 Contrast (Minimum) | 4.5:1 small text, 3:1 large text | Automated |
| 1.4.11 Non-text Contrast | 3:1 for UI components | Automated |
| 2.4.7 Focus Visible | Visible focus indicator | Manual/Automated |
| 2.5.5 Target Size | 44×44px minimum | Automated |
| 1.3.1 Info and Relationships | Labels programmatically associated | Automated |
| 1.4.1 Use of Color | Don't rely on color alone | Manual |

---

## Check 1: Color Contrast

### Detection Script

```javascript
// Run in browser console or Puppeteer
function checkContrast() {
  const issues = [];
  const textElements = document.querySelectorAll('p, span, a, button, label, h1, h2, h3, h4, h5, h6, li, td, th');
  
  textElements.forEach(el => {
    const style = getComputedStyle(el);
    const color = style.color;
    const bgColor = getBackgroundColor(el);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight);
    
    const ratio = getContrastRatio(color, bgColor);
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
    const required = isLarge ? 3 : 4.5;
    
    if (ratio < required) {
      issues.push({
        element: el.tagName,
        text: el.textContent?.slice(0, 50),
        selector: getSelector(el),
        currentRatio: ratio.toFixed(2),
        requiredRatio: required,
        currentColor: color,
        backgroundColor: bgColor
      });
    }
  });
  
  return issues;
}

// Helper: Get effective background color (traverses up DOM)
function getBackgroundColor(el) {
  let current = el;
  while (current) {
    const bg = getComputedStyle(current).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return bg;
    }
    current = current.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

// Helper: Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(parseRGB(color1));
  const lum2 = getLuminance(parseRGB(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance({r, g, b}) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRGB(color) {
  const match = color.match(/\d+/g);
  return { r: +match[0], g: +match[1], b: +match[2] };
}
```

### CSS Detection Patterns

```bash
# Find low contrast text colors in CSS files
grep -rn --include="*.css" --include="*.scss" -E "color:\s*#[cdef][cdef][cdef]" .
grep -rn --include="*.css" --include="*.scss" -E "color:\s*#(999|aaa|bbb|ccc|ddd)" .
grep -rn --include="*.css" --include="*.scss" -E "color:\s*rgba?\([^)]*,\s*0\.[0-5]" .
grep -rn --include="*.css" --include="*.scss" -E "color:\s*(gray|grey|darkgray|lightgray)" .
```

### Fix Patterns

| Current | Contrast | Replace With |
|---------|----------|--------------|
| `#999999` | ~2.8:1 | `#595959` (7:1) or `var(--color-text-secondary)` |
| `#aaaaaa` | ~2.3:1 | `#595959` (7:1) or `var(--color-text-secondary)` |
| `#bbbbbb` | ~1.9:1 | `#767676` (4.5:1) or `var(--color-text-tertiary)` |
| `#cccccc` | ~1.6:1 | `#767676` (4.5:1) or `var(--color-text-tertiary)` |
| `rgba(0,0,0,0.4)` | ~2.6:1 | `rgba(0,0,0,0.65)` (4.5:1) |
| `rgba(0,0,0,0.5)` | ~3.3:1 | `rgba(0,0,0,0.65)` (4.5:1) |

### Validation

```javascript
// After fix, verify:
const issues = checkContrast();
console.assert(issues.length === 0, `${issues.length} contrast issues remaining`);
```

---

## Check 2: Form Labels

### Detection Script

```javascript
function checkFormLabels() {
  const issues = [];
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
    
    const id = input.id;
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute('aria-label');
    const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
    const hasTitle = input.getAttribute('title');
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
      issues.push({
        element: input.tagName,
        type: input.type,
        selector: getSelector(input),
        name: input.name,
        placeholder: input.placeholder,
        fix: 'Add label[for] or aria-label'
      });
    }
    
    // Check for placeholder-only labels (anti-pattern)
    if (input.placeholder && !hasLabel && !hasAriaLabel) {
      issues.push({
        element: input.tagName,
        type: input.type,
        selector: getSelector(input),
        issue: 'Placeholder used as label',
        fix: 'Add visible label element'
      });
    }
  });
  
  return issues;
}
```

### HTML Detection Patterns

```bash
# Find inputs without labels
grep -rn --include="*.html" --include="*.jsx" --include="*.tsx" -E "<input[^>]*>" . | grep -v "label\|aria-label"

# Find placeholder-only inputs
grep -rn --include="*.html" --include="*.jsx" --include="*.tsx" -E "placeholder=" . | grep -v "label\[for\|aria-label"
```

### Fix Patterns

**Before (no label):**
```html
<input type="email" placeholder="Email">
```

**After (with label):**
```html
<div class="form-group">
  <label for="email" class="form-label">Email</label>
  <input type="email" id="email" class="form-input" placeholder="e.g., name@example.com">
</div>
```

**Alternative (aria-label for icon-only):**
```html
<button aria-label="Search">
  <svg>...</svg>
</button>
```

---

## Check 3: Focus Indicators

### Detection Script

```javascript
function checkFocusIndicators() {
  const issues = [];
  const interactive = document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"], [role="button"]');
  
  interactive.forEach(el => {
    el.focus();
    const style = getComputedStyle(el);
    const outline = style.outline;
    const boxShadow = style.boxShadow;
    const border = style.border;
    
    // Check if any focus style is applied
    const hasOutline = outline !== 'none' && outline !== '0px none rgb(0, 0, 0)';
    const hasBoxShadow = boxShadow !== 'none';
    const hasBorderChange = border !== getComputedStyle(el, null).border; // Compare to non-focused
    
    if (!hasOutline && !hasBoxShadow && !hasBorderChange) {
      issues.push({
        element: el.tagName,
        selector: getSelector(el),
        issue: 'No visible focus indicator',
        fix: 'Add :focus-visible styles'
      });
    }
    el.blur();
  });
  
  return issues;
}
```

### CSS Detection Patterns

```bash
# Find focus removal (anti-pattern)
grep -rn --include="*.css" --include="*.scss" -E "outline:\s*none|outline:\s*0" .
grep -rn --include="*.css" --include="*.scss" -E ":focus\s*\{[^}]*outline:\s*none" .
```

### Fix Patterns

**Remove these anti-patterns:**
```css
/* DELETE these */
*:focus { outline: none; }
button:focus { outline: 0; }
a:focus { outline: none; }
```

**Add these focus styles:**
```css
/* Global focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* For dark backgrounds */
.dark :focus-visible {
  outline-color: white;
}

/* Custom focus for inputs */
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2);
}
```

---

## Check 4: Touch Target Size

### Detection Script

```javascript
function checkTouchTargets() {
  const issues = [];
  const interactive = document.querySelectorAll('a, button, input, select, [role="button"], [onclick]');
  const MIN_SIZE = 44;
  
  interactive.forEach(el => {
    const rect = el.getBoundingClientRect();
    
    if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
      issues.push({
        element: el.tagName,
        selector: getSelector(el),
        currentSize: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
        requiredSize: `${MIN_SIZE}×${MIN_SIZE}`,
        fix: `Increase padding or min-height/min-width`
      });
    }
  });
  
  return issues;
}
```

### CSS Detection Patterns

```bash
# Find small fixed sizes on interactive elements
grep -rn --include="*.css" --include="*.scss" -E "(button|\.btn|a\.|input)[^{]*\{[^}]*(width|height):\s*(1[0-9]|2[0-9]|3[0-9]|4[0-3])px" .
```

### Fix Patterns

**Before (too small):**
```css
.icon-btn {
  width: 24px;
  height: 24px;
  padding: 4px;
}
```

**After (meets 44px):**
```css
.icon-btn {
  width: 24px;
  height: 24px;
  padding: 10px; /* 24 + 10 + 10 = 44 */
  /* Or use min-height/min-width */
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## Check 5: Color-Only Information

### Detection (Manual + Assisted)

Look for these patterns:

```javascript
function checkColorOnlyInfo() {
  const warnings = [];
  
  // Check for colored badges without text/icons
  const badges = document.querySelectorAll('.badge, .status, .tag, .label, .indicator');
  badges.forEach(badge => {
    const hasText = badge.textContent?.trim().length > 0;
    const hasIcon = badge.querySelector('svg, img, i');
    if (!hasText && !hasIcon) {
      warnings.push({
        element: badge,
        selector: getSelector(badge),
        issue: 'Color-only indicator without text/icon',
        fix: 'Add text label or icon with aria-label'
      });
    }
  });
  
  // Check for links that are only color-differentiated
  const links = document.querySelectorAll('p a, li a, td a');
  links.forEach(link => {
    const style = getComputedStyle(link);
    if (style.textDecoration === 'none' && !link.querySelector('svg, img')) {
      warnings.push({
        element: link,
        selector: getSelector(link),
        issue: 'Link without underline relies on color only',
        fix: 'Add text-decoration: underline'
      });
    }
  });
  
  return warnings;
}
```

### Fix Patterns

**Status indicators:**
```html
<!-- Before: color only -->
<span class="status status-error"></span>

<!-- After: color + icon + text -->
<span class="status status-error">
  <svg aria-hidden="true">...</svg>
  Error
</span>
```

**Links in text:**
```css
/* Ensure links are underlined */
p a, li a, article a {
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

---

## Validation Script (Run After All Fixes)

```javascript
async function runAccessibilityAudit() {
  const results = {
    contrast: checkContrast(),
    labels: checkFormLabels(),
    focus: checkFocusIndicators(),
    touchTargets: checkTouchTargets(),
    colorOnly: checkColorOnlyInfo()
  };
  
  const totalIssues = Object.values(results).flat().length;
  
  console.log('=== ACCESSIBILITY AUDIT RESULTS ===');
  console.log(`Total issues: ${totalIssues}`);
  
  Object.entries(results).forEach(([check, issues]) => {
    console.log(`\n${check}: ${issues.length} issues`);
    if (issues.length > 0) {
      console.table(issues);
    }
  });
  
  return {
    passed: totalIssues === 0,
    totalIssues,
    results
  };
}
```

---

## Agent Execution Workflow

```
1. Run detection scripts
2. Collect all issues into array
3. Sort by severity (contrast > labels > focus > touch > color-only)
4. For each issue:
   a. Locate the source file
   b. Apply the corresponding fix pattern
   c. Run validation on that specific check
5. Re-run full audit
6. Generate report
```
