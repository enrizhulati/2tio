# Forms Reference (Agent Execution)

## Quick Reference: Input Selection

| Options | Control | Why |
|---------|---------|-----|
| 2 options | Checkbox or toggle | Visible, single click |
| 2-5 options | Radio buttons | All options visible |
| 6-10 options | Radio or dropdown | Dropdown saves space |
| 11+ options | Autocomplete search | Type to filter |
| Free text, short | Input | Standard |
| Free text, long | Textarea | Multiple lines |
| Yes/No | Checkbox | Immediate understanding |
| On/Off (instant effect) | Toggle switch | Implies immediate action |

---

## Workflow: Audit Forms

### Step 1: Find All Forms

```javascript
function findAllForms(document) {
  return document.querySelectorAll('form, [role="form"]');
}

function findAllFormFields(document) {
  return document.querySelectorAll('input, select, textarea');
}
```

### Step 2: Check Labels

```javascript
function auditFormLabels(document) {
  const issues = [];
  const fields = document.querySelectorAll('input, select, textarea');
  
  fields.forEach(field => {
    // Skip hidden, submit, button types
    if (['hidden', 'submit', 'button', 'reset'].includes(field.type)) return;
    
    const id = field.id;
    const name = field.name;
    
    // Check for associated label
    const hasLabelFor = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = field.getAttribute('aria-label');
    const hasAriaLabelledBy = field.getAttribute('aria-labelledby');
    const hasWrappingLabel = field.closest('label');
    
    if (!hasLabelFor && !hasAriaLabel && !hasAriaLabelledBy && !hasWrappingLabel) {
      issues.push({
        type: 'missing-label',
        field: field.type || field.tagName.toLowerCase(),
        name: name || id,
        selector: getSelector(field),
        placeholder: field.placeholder,
        fix: hasPlaceholderOnly(field) 
          ? 'Add visible <label> - placeholder is not a label substitute'
          : 'Add <label for="id"> or aria-label'
      });
    }
    
    // Check for placeholder-only (anti-pattern)
    if (field.placeholder && !hasLabelFor && !hasAriaLabel && !hasAriaLabelledBy && !hasWrappingLabel) {
      issues.push({
        type: 'placeholder-as-label',
        field: field.type,
        placeholder: field.placeholder,
        selector: getSelector(field),
        fix: 'Add visible <label> element above field'
      });
    }
  });
  
  return issues;
}

function hasPlaceholderOnly(field) {
  return field.placeholder && !field.id;
}
```

### Step 3: Check Required/Optional Marking

```javascript
function auditRequiredFields(document) {
  const issues = [];
  const forms = findAllForms(document);
  
  forms.forEach(form => {
    const fields = form.querySelectorAll('input, select, textarea');
    const required = Array.from(fields).filter(f => f.required || f.getAttribute('aria-required') === 'true');
    const optional = Array.from(fields).filter(f => !f.required && f.getAttribute('aria-required') !== 'true');
    
    // Skip if all required or all optional
    if (required.length === 0 || optional.length === 0) return;
    
    // Check if required fields are marked
    required.forEach(field => {
      const label = document.querySelector(`label[for="${field.id}"]`);
      const hasAsterisk = label?.textContent.includes('*') || label?.querySelector('.required');
      const hasRequiredText = label?.textContent.toLowerCase().includes('required');
      
      if (!hasAsterisk && !hasRequiredText) {
        issues.push({
          type: 'unmarked-required',
          field: field.name || field.id,
          selector: getSelector(field),
          fix: 'Add asterisk (*) to label or "(required)" text'
        });
      }
    });
    
    // Check if optional fields are marked (when few optionals)
    if (optional.length < required.length) {
      optional.forEach(field => {
        const label = document.querySelector(`label[for="${field.id}"]`);
        const hasOptionalText = label?.textContent.toLowerCase().includes('optional');
        
        if (!hasOptionalText && field.type !== 'hidden') {
          issues.push({
            type: 'unmarked-optional',
            field: field.name || field.id,
            selector: getSelector(field),
            fix: 'Add "(optional)" to label'
          });
        }
      });
    }
  });
  
  return issues;
}
```

### Step 4: Check Field Widths

```javascript
function auditFieldWidths(document) {
  const issues = [];
  const widthGuidelines = {
    'tel': { maxWidth: 200, reason: 'Phone numbers are ~10-15 characters' },
    'text': { check: 'name' }, // Check by name attribute
    'number': { maxWidth: 120, reason: 'Numbers are typically short' }
  };
  
  const nameWidths = {
    'zip': 100,
    'postal': 100,
    'cvv': 80,
    'cvc': 80,
    'state': 100,
    'year': 80,
    'month': 80,
    'day': 80
  };
  
  const fields = document.querySelectorAll('input');
  
  fields.forEach(field => {
    const rect = field.getBoundingClientRect();
    const name = (field.name || '').toLowerCase();
    
    // Check phone fields
    if (field.type === 'tel' && rect.width > 250) {
      issues.push({
        type: 'oversized-field',
        field: field.name,
        current: `${Math.round(rect.width)}px`,
        recommended: '200px max',
        reason: 'Phone numbers are ~10-15 characters'
      });
    }
    
    // Check by name patterns
    Object.entries(nameWidths).forEach(([pattern, maxWidth]) => {
      if (name.includes(pattern) && rect.width > maxWidth * 1.5) {
        issues.push({
          type: 'oversized-field',
          field: field.name,
          current: `${Math.round(rect.width)}px`,
          recommended: `${maxWidth}px`,
          reason: `${pattern} values are short`
        });
      }
    });
  });
  
  return issues;
}
```

### Step 5: Check Input Type Selection

```javascript
function auditInputTypes(document) {
  const issues = [];
  
  // Find dropdowns with few options
  const selects = document.querySelectorAll('select');
  selects.forEach(select => {
    const optionCount = select.options.length;
    
    if (optionCount <= 5 && optionCount > 1) {
      issues.push({
        type: 'dropdown-few-options',
        field: select.name,
        optionCount,
        selector: getSelector(select),
        fix: 'Consider radio buttons for ≤5 options - all visible, single click'
      });
    }
  });
  
  // Find long dropdowns without search
  selects.forEach(select => {
    const optionCount = select.options.length;
    
    if (optionCount > 10) {
      issues.push({
        type: 'dropdown-many-options',
        field: select.name,
        optionCount,
        selector: getSelector(select),
        fix: 'Consider autocomplete/searchable dropdown for >10 options'
      });
    }
  });
  
  // Check for appropriate input types
  const inputs = document.querySelectorAll('input[type="text"]');
  inputs.forEach(input => {
    const name = (input.name || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    
    const typeHints = {
      email: 'email',
      phone: 'tel',
      telephone: 'tel',
      url: 'url',
      website: 'url',
      search: 'search',
      password: 'password'
    };
    
    Object.entries(typeHints).forEach(([hint, correctType]) => {
      if ((name.includes(hint) || placeholder.includes(hint)) && input.type !== correctType) {
        issues.push({
          type: 'wrong-input-type',
          field: input.name,
          current: input.type,
          recommended: correctType,
          fix: `Change type to "${correctType}" for proper keyboard on mobile`
        });
      }
    });
  });
  
  return issues;
}
```

### Step 6: Check Error Handling

```javascript
function auditErrorHandling(form) {
  const issues = [];
  
  // Check if form has error container
  const hasErrorSummary = form.querySelector('[role="alert"], .error-summary, .form-errors');
  
  if (!hasErrorSummary) {
    issues.push({
      type: 'missing-error-summary',
      fix: 'Add error summary container with role="alert" above form'
    });
  }
  
  // Check each field for error message container
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach(field => {
    const id = field.id;
    const errorId = `${id}-error`;
    const hasErrorContainer = document.getElementById(errorId) || 
                              field.parentElement.querySelector('.error-message, .field-error');
    const hasAriaDescribedBy = field.getAttribute('aria-describedby');
    
    if (!hasErrorContainer && !hasAriaDescribedBy) {
      issues.push({
        type: 'missing-error-container',
        field: field.name || id,
        fix: `Add error container with id="${errorId}" and aria-describedby="${errorId}" on input`
      });
    }
  });
  
  return issues;
}
```

---

## Workflow: Implement Form System

### Step 1: Create Form CSS

```css
/* forms.css */

/* ==========================================================================
   FORM LAYOUT
   ========================================================================== */
.form {
  max-width: 480px; /* Optimal form width */
}

.form-group {
  margin-bottom: var(--space-md);
}

/* Single column by default */
.form-row {
  display: flex;
  gap: var(--space-sm);
}

.form-row > * {
  flex: 1;
}

/* ==========================================================================
   LABELS
   ========================================================================== */
.form-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
}

/* Required indicator */
.form-label-required::after {
  content: " *";
  color: var(--color-error);
}

/* Optional indicator */
.form-label-optional::after {
  content: " (optional)";
  font-weight: var(--font-normal);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* ==========================================================================
   HINTS
   ========================================================================== */
.form-hint {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* ==========================================================================
   INPUTS
   ========================================================================== */
.form-input,
.form-select,
.form-textarea {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: var(--space-xs) var(--space-sm);
  
  font-family: inherit;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-text-primary);
  
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

/* Textarea */
.form-textarea {
  min-height: 120px;
  resize: vertical;
}

/* Select */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-sm) center;
  padding-right: var(--space-xl);
}

/* ==========================================================================
   FIELD WIDTHS
   ========================================================================== */
.form-input-xs { max-width: 80px; }   /* CVV, state abbrev */
.form-input-sm { max-width: 120px; }  /* ZIP, year */
.form-input-md { max-width: 200px; }  /* Phone */
.form-input-lg { max-width: 320px; }  /* Email */
/* Full width is default */

/* ==========================================================================
   CHECKBOXES & RADIOS
   ========================================================================== */
.form-check {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  min-height: 44px;
  padding-block: calc((44px - 1.5em) / 2);
}

.form-check-input {
  flex-shrink: 0;
  width: 1.25em;
  height: 1.25em;
  margin-top: 0.125em;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

/* Radio group */
.form-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

/* Inline options */
.form-radio-group-inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-md);
}

/* ==========================================================================
   ERROR STATES
   ========================================================================== */
.form-input-error,
.form-select-error,
.form-textarea-error {
  border-color: var(--color-error);
}

.form-input-error:focus,
.form-select-error:focus,
.form-textarea-error:focus {
  box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.15);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-error);
}

.form-error::before {
  content: "";
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23dc2626'%3E%3Cpath fill-rule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-size: contain;
}

/* ==========================================================================
   ERROR SUMMARY
   ========================================================================== */
.form-error-summary {
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  background-color: var(--color-error-bg);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
}

.form-error-summary h2 {
  font-size: var(--text-base);
  margin-bottom: var(--space-sm);
  color: var(--color-error);
}

.form-error-summary ul {
  margin: 0;
  padding-left: var(--space-md);
}

.form-error-summary a {
  color: var(--color-error);
}

/* ==========================================================================
   SUCCESS STATE
   ========================================================================== */
.form-input-success {
  border-color: var(--color-success);
}
```

### Step 2: HTML Patterns

```html
<!-- Standard field -->
<div class="form-group">
  <label for="email" class="form-label form-label-required">Email</label>
  <input type="email" id="email" name="email" class="form-input" required aria-describedby="email-error">
  <p id="email-error" class="form-error" hidden></p>
</div>

<!-- With hint -->
<div class="form-group">
  <label for="password" class="form-label form-label-required">Password</label>
  <p class="form-hint" id="password-hint">Must be at least 8 characters</p>
  <input type="password" id="password" name="password" class="form-input" required 
         aria-describedby="password-hint password-error" minlength="8">
  <p id="password-error" class="form-error" hidden></p>
</div>

<!-- Optional field -->
<div class="form-group">
  <label for="company" class="form-label form-label-optional">Company</label>
  <input type="text" id="company" name="company" class="form-input">
</div>

<!-- Radio buttons -->
<fieldset class="form-group">
  <legend class="form-label form-label-required">Plan</legend>
  <div class="form-radio-group">
    <label class="form-check">
      <input type="radio" name="plan" value="free" class="form-check-input" required>
      <span class="form-check-label">Free</span>
    </label>
    <label class="form-check">
      <input type="radio" name="plan" value="pro" class="form-check-input">
      <span class="form-check-label">Pro - $9/month</span>
    </label>
  </div>
</fieldset>

<!-- Checkbox -->
<label class="form-check">
  <input type="checkbox" name="terms" class="form-check-input" required>
  <span class="form-check-label">I agree to the <a href="/terms">terms of service</a></span>
</label>

<!-- Error summary -->
<div class="form-error-summary" role="alert" hidden>
  <h2>Please fix the following errors:</h2>
  <ul id="error-list"></ul>
</div>
```

---

## Fix Patterns

### Placeholder-Only → Add Label

**Before:**
```html
<input type="email" placeholder="Email address">
```

**After:**
```html
<div class="form-group">
  <label for="email" class="form-label form-label-required">Email address</label>
  <input type="email" id="email" class="form-input" required>
</div>
```

### Dropdown → Radio Buttons (≤5 options)

**Before:**
```html
<select name="size">
  <option value="s">Small</option>
  <option value="m">Medium</option>
  <option value="l">Large</option>
</select>
```

**After:**
```html
<fieldset class="form-group">
  <legend class="form-label">Size</legend>
  <div class="form-radio-group form-radio-group-inline">
    <label class="form-check">
      <input type="radio" name="size" value="s" class="form-check-input">
      <span class="form-check-label">Small</span>
    </label>
    <label class="form-check">
      <input type="radio" name="size" value="m" class="form-check-input">
      <span class="form-check-label">Medium</span>
    </label>
    <label class="form-check">
      <input type="radio" name="size" value="l" class="form-check-input">
      <span class="form-check-label">Large</span>
    </label>
  </div>
</fieldset>
```

---

## Validation Script

```javascript
function validateForm(formElement) {
  const results = {
    labels: auditFormLabels(document),
    required: auditRequiredFields(document),
    widths: auditFieldWidths(document),
    types: auditInputTypes(document),
    errors: auditErrorHandling(formElement)
  };
  
  return {
    passed: Object.values(results).flat().length === 0,
    results
  };
}
```
