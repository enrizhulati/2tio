# Copywriting Reference (Agent Execution)

## Quick Reference: Copy Rules

| Rule | Bad | Good |
|------|-----|------|
| Sentence case | Create Your Account | Create your account |
| Be concise | Would you like to save your changes? | Save changes? |
| Front-load | To save changes, click Save | Click Save to save |
| Descriptive links | Click here | View pricing |
| No periods in UI | Save changes. | Save changes |
| Positive framing | Don't forget | Remember |

---

## Workflow: Audit Copy

### Step 1: Find All UI Text

```javascript
function extractUIText(document) {
  const textElements = {
    buttons: [],
    labels: [],
    headings: [],
    links: [],
    errors: [],
    placeholders: [],
    tooltips: []
  };
  
  // Buttons
  document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"], .btn').forEach(el => {
    textElements.buttons.push({
      text: el.textContent?.trim() || el.value,
      selector: getSelector(el)
    });
  });
  
  // Labels
  document.querySelectorAll('label, .label, .form-label').forEach(el => {
    textElements.labels.push({
      text: el.textContent?.trim(),
      selector: getSelector(el)
    });
  });
  
  // Headings
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    textElements.headings.push({
      text: el.textContent?.trim(),
      level: el.tagName,
      selector: getSelector(el)
    });
  });
  
  // Links
  document.querySelectorAll('a').forEach(el => {
    textElements.links.push({
      text: el.textContent?.trim(),
      href: el.href,
      selector: getSelector(el)
    });
  });
  
  // Placeholders
  document.querySelectorAll('[placeholder]').forEach(el => {
    textElements.placeholders.push({
      text: el.placeholder,
      selector: getSelector(el)
    });
  });
  
  return textElements;
}
```

### Step 2: Check for Issues

```javascript
function auditCopy(document) {
  const issues = [];
  const text = extractUIText(document);
  
  // Check buttons for vague labels
  const vagueButtonLabels = ['submit', 'click', 'click here', 'ok', 'yes', 'no', 'go', 'send', 'continue', 'next', 'back'];
  text.buttons.forEach(btn => {
    if (vagueButtonLabels.includes(btn.text?.toLowerCase())) {
      issues.push({
        type: 'vague-button',
        text: btn.text,
        selector: btn.selector,
        fix: 'Use [Verb] + [Object] format: "Save changes", "Create account"'
      });
    }
  });
  
  // Check links for vague labels
  const vagueLinks = ['click here', 'here', 'read more', 'learn more', 'more', 'link'];
  text.links.forEach(link => {
    if (vagueLinks.includes(link.text?.toLowerCase())) {
      issues.push({
        type: 'vague-link',
        text: link.text,
        selector: link.selector,
        fix: 'Use descriptive text: "View pricing", "Read the documentation"'
      });
    }
  });
  
  // Check for Title Case (should be Sentence case)
  const titleCaseRegex = /^([A-Z][a-z]+\s){2,}[A-Z][a-z]+$/;
  [...text.buttons, ...text.labels, ...text.headings].forEach(item => {
    if (titleCaseRegex.test(item.text)) {
      issues.push({
        type: 'title-case',
        text: item.text,
        selector: item.selector,
        fix: `Use sentence case: "${toSentenceCase(item.text)}"`
      });
    }
  });
  
  // Check for wordy phrases
  const wordyPhrases = {
    'would you like to': '',
    'please': '',
    'in order to': 'to',
    'due to the fact that': 'because',
    'at this point in time': 'now',
    'successfully': '',
    'are you sure you want to': '',
    'click the button to': '',
    'please note that': ''
  };
  
  Object.entries(wordyPhrases).forEach(([phrase, replacement]) => {
    document.body.innerHTML.toLowerCase().includes(phrase) && issues.push({
      type: 'wordy-phrase',
      phrase,
      replacement: replacement || '(remove)',
      fix: `Replace "${phrase}" with "${replacement || '(nothing)'}"`
    });
  });
  
  // Check for periods in button/label text (should be removed)
  [...text.buttons, ...text.labels].forEach(item => {
    if (item.text?.endsWith('.') && !item.text.includes('...')) {
      issues.push({
        type: 'unnecessary-period',
        text: item.text,
        selector: item.selector,
        fix: 'Remove period from UI text'
      });
    }
  });
  
  return issues;
}

function toSentenceCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```

---

## Fix Patterns

### Vague Button Labels

| Before | After (Context-Aware) |
|--------|----------------------|
| Submit | Create account, Send message, Save changes |
| OK | Confirm, Accept, Got it |
| Yes | Delete item, Confirm purchase |
| No | Cancel, Keep item |
| Continue | Continue to checkout, Next: Payment |
| Send | Send invitation, Submit request |
| Click here | View details, Download PDF |

### Vague Link Text

| Before | After |
|--------|-------|
| Click here | View our pricing plans |
| Read more | Read the full article |
| Learn more | Learn about our features |
| Here | the documentation |
| Link | Download the report (PDF) |

### Title Case → Sentence Case

```javascript
function convertToSentenceCase(text) {
  // List of words that should stay capitalized
  const properNouns = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                       'january', 'february', 'march', 'april', 'may', 'june', 'july', 
                       'august', 'september', 'october', 'november', 'december'];
  
  return text
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
    .replace(new RegExp(`\\b(${properNouns.join('|')})\\b`, 'gi'), m => 
      m.charAt(0).toUpperCase() + m.slice(1)
    );
}
```

| Before | After |
|--------|-------|
| Create Your Account | Create your account |
| Sign In To Continue | Sign in to continue |
| View Your Orders | View your orders |
| Update Payment Method | Update payment method |

### Wordy Phrases

| Before | After |
|--------|-------|
| Would you like to save? | Save changes? |
| Please enter your email | Email |
| In order to continue | To continue |
| Successfully saved | Saved |
| Are you sure you want to delete? | Delete this item? |
| Click the button to submit | Submit |
| Please note that | (remove or rephrase) |

### Remove Unnecessary Periods

```javascript
function removePeriodFromUIText(element) {
  const text = element.textContent || element.value;
  if (text.endsWith('.') && !text.endsWith('...')) {
    if (element.value !== undefined) {
      element.value = text.slice(0, -1);
    } else {
      element.textContent = text.slice(0, -1);
    }
  }
}
```

---

## Error Message Patterns

### Formula: What's Wrong + How to Fix

```javascript
const errorMessageTemplates = {
  required: '{field} is required',
  email: 'Enter a valid email address (e.g., name@example.com)',
  minLength: '{field} must be at least {min} characters',
  maxLength: '{field} must be {max} characters or fewer',
  pattern: '{field} format is invalid',
  number: 'Enter a number',
  url: 'Enter a valid URL (e.g., https://example.com)',
  date: 'Enter a valid date',
  mismatch: '{field} doesn\'t match',
  server: 'Something went wrong. Please try again.',
  network: 'Check your internet connection and try again.'
};
```

### Bad vs Good Error Messages

| Bad | Good |
|-----|------|
| Invalid | Enter a valid email address |
| Error | Password must be at least 8 characters |
| Required | Email is required |
| Please enter a valid value | Enter a number between 1 and 100 |
| Form submission failed | Unable to save. Check your connection and try again. |
| An error occurred | We couldn't process your payment. Please check your card details. |

### Error Message CSS

```css
.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-error);
}

/* Icon (optional but recommended) */
.form-error::before {
  content: "";
  width: 1em;
  height: 1em;
  background-image: url("data:image/svg+xml,...");
}
```

---

## Microcopy Guidelines

### Form Field Labels

| Bad | Good |
|-----|------|
| Your Name | Name |
| Enter Email | Email |
| Your Password | Password |
| Input Phone Number | Phone |

### Placeholder Text

Use placeholders for **format examples only**, not as labels.

| Good Use | Bad Use |
|----------|---------|
| `e.g., john@example.com` | `Email` |
| `MM/DD/YYYY` | `Enter date` |
| `+1 (555) 123-4567` | `Phone number` |

### Empty States

```javascript
const emptyStateTemplates = {
  list: {
    title: 'No {items} yet',
    description: '{Action} to get started',
    cta: 'Add {item}'
  },
  search: {
    title: 'No results for "{query}"',
    description: 'Try a different search term',
    cta: 'Clear search'
  },
  filter: {
    title: 'No {items} match your filters',
    description: 'Try adjusting your filters',
    cta: 'Clear filters'
  }
};
```

---

## Validation Script

```javascript
function validateCopy(document) {
  const issues = auditCopy(document);
  
  return {
    passed: issues.length === 0,
    totalIssues: issues.length,
    issues,
    summary: {
      vagueButtons: issues.filter(i => i.type === 'vague-button').length,
      vagueLinks: issues.filter(i => i.type === 'vague-link').length,
      titleCase: issues.filter(i => i.type === 'title-case').length,
      wordyPhrases: issues.filter(i => i.type === 'wordy-phrase').length,
      unnecessaryPeriods: issues.filter(i => i.type === 'unnecessary-period').length
    }
  };
}
```

---

## Bulk Fix Script

```javascript
async function fixCopyIssues(document, issues) {
  const fixes = [];
  
  for (const issue of issues) {
    const element = document.querySelector(issue.selector);
    if (!element) continue;
    
    switch (issue.type) {
      case 'title-case':
        const original = element.textContent;
        element.textContent = toSentenceCase(original);
        fixes.push({ type: 'title-case', original, fixed: element.textContent });
        break;
        
      case 'unnecessary-period':
        element.textContent = element.textContent.slice(0, -1);
        fixes.push({ type: 'period-removed', selector: issue.selector });
        break;
        
      // Vague labels require human decision - just flag them
      case 'vague-button':
      case 'vague-link':
        fixes.push({ 
          type: 'needs-human-review', 
          selector: issue.selector,
          suggestion: issue.fix 
        });
        break;
    }
  }
  
  return fixes;
}
```

---

## Agent Decision Tree: Copy

```
Request involves copy/text/labels?
├─ "audit copy" → Run auditCopy()
├─ "fix title case" → Apply toSentenceCase() to flagged elements
├─ "fix button labels" → Output suggestions (needs human decision)
├─ "fix link text" → Output suggestions (needs human decision)
├─ "write error messages" → Apply errorMessageTemplates
└─ "review microcopy" → Check against guidelines, output suggestions
```
