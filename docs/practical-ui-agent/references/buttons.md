# Buttons Reference (Agent Execution)

## Quick Reference: Three-Weight System

| Weight | Style | Contrast | Usage | Limit |
|--------|-------|----------|-------|-------|
| Primary | Solid fill + white text | 4.5:1 fill vs page bg | Most important action | 1 per view |
| Secondary | Border only, no fill | 3:1 border vs bg | Less important actions | Multiple OK |
| Tertiary | Text only (underlined) | 4.5:1 text vs bg | Least important actions | Multiple OK |

---

## Workflow: Audit Button Hierarchy

### Step 1: Find All Buttons

```javascript
function findAllButtons(document) {
  const selectors = [
    'button',
    '[role="button"]',
    'input[type="submit"]',
    'input[type="button"]',
    '.btn',
    '.button',
    'a.btn',
    'a.button'
  ];
  
  return document.querySelectorAll(selectors.join(', '));
}
```

### Step 2: Check for Multiple Primaries

```javascript
function auditButtonHierarchy(document) {
  const issues = [];
  
  // Check each logical section
  const sections = document.querySelectorAll('section, article, form, .card, .modal, [role="dialog"], main, aside');
  
  sections.forEach((section, index) => {
    const primaryButtons = section.querySelectorAll(
      '.btn-primary, .button-primary, [class*="primary"], button[type="submit"]:not(.btn-secondary)'
    );
    
    if (primaryButtons.length > 1) {
      issues.push({
        type: 'multiple-primaries',
        section: section.className || section.tagName,
        count: primaryButtons.length,
        buttons: Array.from(primaryButtons).map(b => b.textContent?.trim()),
        fix: 'Keep only the most important action as primary, demote others to secondary'
      });
    }
  });
  
  return issues;
}
```

### Step 3: Check Button Labels

```javascript
function auditButtonLabels(document) {
  const issues = [];
  const vagueLabels = ['submit', 'click', 'click here', 'ok', 'yes', 'no', 'continue', 'go', 'send'];
  
  const buttons = findAllButtons(document);
  
  buttons.forEach(btn => {
    const label = (btn.textContent || btn.value || btn.getAttribute('aria-label') || '').trim().toLowerCase();
    
    // Check for vague labels
    if (vagueLabels.includes(label)) {
      issues.push({
        type: 'vague-label',
        current: label,
        element: getSelector(btn),
        fix: 'Use descriptive label: [Verb] + [Object], e.g., "Save changes", "Delete item"'
      });
    }
    
    // Check for missing labels (icon-only buttons)
    if (!label && !btn.getAttribute('aria-label')) {
      issues.push({
        type: 'missing-label',
        element: getSelector(btn),
        fix: 'Add aria-label for icon-only buttons'
      });
    }
  });
  
  return issues;
}
```

### Step 4: Check Touch Targets

```javascript
function auditButtonSizes(document) {
  const issues = [];
  const MIN_SIZE = 44;
  
  const buttons = findAllButtons(document);
  
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    
    if (rect.height < MIN_SIZE || rect.width < MIN_SIZE) {
      issues.push({
        type: 'small-target',
        element: getSelector(btn),
        currentSize: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
        required: `${MIN_SIZE}×${MIN_SIZE}`,
        fix: 'Increase padding or min-height/min-width to meet 44px minimum'
      });
    }
  });
  
  return issues;
}
```

### Step 5: Check Disabled Buttons

```javascript
function auditDisabledButtons(document) {
  const issues = [];
  
  const disabledButtons = document.querySelectorAll('button[disabled], .btn[disabled], .btn.disabled');
  
  disabledButtons.forEach(btn => {
    // Check if there's an explanation
    const hasAriaDescribedBy = btn.getAttribute('aria-describedby');
    const hasSiblingExplanation = btn.nextElementSibling?.classList.contains('help-text');
    const hasTooltip = btn.getAttribute('title') || btn.getAttribute('data-tooltip');
    
    if (!hasAriaDescribedBy && !hasSiblingExplanation && !hasTooltip) {
      issues.push({
        type: 'unexplained-disabled',
        element: getSelector(btn),
        label: btn.textContent?.trim(),
        fix: 'Add explanation via aria-describedby, tooltip, or adjacent help text. Or enable button and validate on click instead.'
      });
    }
  });
  
  return issues;
}
```

---

## Workflow: Implement Button System

### Step 1: Create Button CSS

```css
/* buttons.css */

/* ==========================================================================
   BASE BUTTON
   ========================================================================== */
.btn {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  
  /* Sizing - minimum 44px touch target */
  min-height: 44px;
  padding: var(--space-xs) var(--space-sm);
  
  /* Typography */
  font-family: inherit;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  
  /* Appearance */
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  
  /* Transitions */
  transition: 
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
}

/* Focus state - ALWAYS visible */
.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ==========================================================================
   PRIMARY - One per view
   ========================================================================== */
.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.btn-primary:active {
  transform: translateY(1px);
}

/* ==========================================================================
   SECONDARY
   ========================================================================== */
.btn-secondary {
  background-color: transparent;
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-secondary);
}

/* ==========================================================================
   TERTIARY
   ========================================================================== */
.btn-tertiary {
  background-color: transparent;
  border-color: transparent;
  color: var(--color-primary);
  padding-left: var(--space-xs);
  padding-right: var(--space-xs);
}

.btn-tertiary:hover {
  background-color: var(--color-surface);
  text-decoration: underline;
}

/* ==========================================================================
   DESTRUCTIVE
   ========================================================================== */
.btn-destructive {
  background-color: transparent;
  border-color: var(--color-error);
  color: var(--color-error);
}

.btn-destructive:hover {
  background-color: var(--color-error-bg);
}

/* ==========================================================================
   SIZES
   ========================================================================== */
.btn-sm {
  min-height: 36px;
  padding: 6px var(--space-xs);
  font-size: var(--text-sm);
}

.btn-lg {
  min-height: 52px;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-md);
}

/* Full width */
.btn-block {
  width: 100%;
}

/* ==========================================================================
   ICON BUTTONS
   ========================================================================== */
.btn-icon {
  padding: var(--space-xs);
  min-width: 44px;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

/* ==========================================================================
   BUTTON WITH ICON
   ========================================================================== */
.btn svg {
  width: 1.25em;
  height: 1.25em;
  flex-shrink: 0;
}

/* Loading state */
.btn-loading {
  position: relative;
  pointer-events: none;
}

.btn-loading::after {
  content: "";
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   DISABLED - Use sparingly, prefer validation on click
   ========================================================================== */
.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* If you must use disabled, ensure explanation exists */
.btn:disabled + .btn-disabled-reason,
.btn[aria-disabled="true"] + .btn-disabled-reason {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  margin-top: var(--space-xs);
}
```

---

## Fix Patterns

### Multiple Primaries → Demote to Secondary

**Before:**
```html
<form>
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-primary">Save & Continue</button>
  <button class="btn btn-primary">Cancel</button>
</form>
```

**After:**
```html
<form>
  <button class="btn btn-primary">Save & Continue</button>
  <button class="btn btn-secondary">Save draft</button>
  <button class="btn btn-tertiary">Cancel</button>
</form>
```

### Vague Labels → Descriptive Labels

| Before | After |
|--------|-------|
| `Submit` | `Create account`, `Send message`, `Save changes` |
| `Click here` | `View pricing`, `Download PDF` |
| `OK` | `Confirm deletion`, `Accept terms` |
| `Yes / No` | `Delete item / Keep item` |
| `Continue` | `Continue to checkout`, `Next: Payment details` |
| `Send` | `Send invitation`, `Submit request` |

### Disabled Without Explanation → Enable + Validate

**Before (bad):**
```html
<button class="btn btn-primary" disabled>Submit</button>
```

**After (option 1 - enable with validation):**
```html
<button class="btn btn-primary" type="submit">Submit</button>
<!-- JavaScript handles validation on click, shows errors -->
```

**After (option 2 - explain if must be disabled):**
```html
<button class="btn btn-primary" disabled aria-describedby="submit-reason">Submit</button>
<p id="submit-reason" class="btn-disabled-reason">Complete all required fields to submit</p>
```

### Small Touch Targets → Increase Size

**Before:**
```css
.icon-btn {
  width: 24px;
  height: 24px;
  padding: 4px;
}
```

**After:**
```css
.icon-btn {
  /* Visual size */
  width: 24px;
  height: 24px;
  
  /* Touch target via padding */
  padding: 10px;
  margin: -10px;
  
  /* Or explicit min dimensions */
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

## Destructive Actions: Add Friction

### Light Friction (Confirmation Dialog)

```html
<!-- Trigger -->
<button class="btn btn-destructive" data-confirm="Delete this item? This cannot be undone.">
  Delete item
</button>

<!-- JavaScript -->
<script>
document.querySelectorAll('[data-confirm]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (!confirm(btn.dataset.confirm)) {
      e.preventDefault();
    }
  });
});
</script>
```

### Medium Friction (Type to Confirm)

```html
<!-- Modal content -->
<div class="modal" role="dialog" aria-labelledby="delete-title">
  <h2 id="delete-title">Delete project "My Project"?</h2>
  <p>This action cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
  <input type="text" id="confirm-input" placeholder="Type DELETE">
  <div class="modal-actions">
    <button class="btn btn-secondary" data-close>Cancel</button>
    <button class="btn btn-destructive" id="confirm-delete" disabled>Delete project</button>
  </div>
</div>

<script>
document.getElementById('confirm-input').addEventListener('input', (e) => {
  document.getElementById('confirm-delete').disabled = e.target.value !== 'DELETE';
});
</script>
```

### Best Practice (Allow Undo)

```html
<!-- After deletion -->
<div class="toast" role="alert">
  <p>Item deleted</p>
  <button class="btn btn-tertiary" id="undo-delete">Undo</button>
</div>

<script>
// Soft delete - actually delete after timeout
let deleteTimeout;
function softDelete(itemId) {
  // Mark as deleted, don't remove from DB yet
  markAsDeleted(itemId);
  showUndoToast();
  
  deleteTimeout = setTimeout(() => {
    permanentlyDelete(itemId);
  }, 10000); // 10 seconds to undo
}

function undoDelete(itemId) {
  clearTimeout(deleteTimeout);
  restoreItem(itemId);
  hideUndoToast();
}
</script>
```

---

## Validation

```javascript
function validateButtons(document) {
  const results = {
    hierarchy: auditButtonHierarchy(document),
    labels: auditButtonLabels(document),
    sizes: auditButtonSizes(document),
    disabled: auditDisabledButtons(document)
  };
  
  const totalIssues = Object.values(results).flat().length;
  
  return {
    passed: totalIssues === 0,
    totalIssues,
    results
  };
}
```

---

## Agent Decision Tree: Buttons

```
Request involves buttons?
├─ "audit buttons" → Run all audit functions
├─ "fix button hierarchy" → Find sections with multiple primaries, demote extras
├─ "fix button labels" → Map vague labels to descriptive alternatives
├─ "implement button system" → Create buttons.css with three-weight system
├─ "fix disabled button" → Add explanation or convert to enabled+validate
└─ "add destructive confirmation" → Add appropriate friction level
```
