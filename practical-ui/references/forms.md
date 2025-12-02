# Chapter 7: Forms

## Stack Forms in a Single Column Layout

**Use single column layouts** for forms whenever possible.

### Why Single Column?

1. **Clear path** - Top to bottom, no confusion
2. **Mobile-friendly** - Naturally responsive
3. **Faster completion** - No left-right eye movement
4. **Screen magnifiers** - Users see full width
5. **Accessibility** - Tab order is logical

### When Multi-Column is OK

- Related short fields (First name / Last name)
- Date fields (Day / Month / Year)
- Address fields (City / State / ZIP)
- Very long forms where space is limited

### Multi-Column Rules

- Keep related fields together
- Maintain logical tab order
- Test on mobile

## Minimise the Number of Form Fields

Every field you add:
- Increases completion time
- Increases cognitive load
- Reduces conversion

**Question every field:** Is this essential to complete the task?

### Strategies to Reduce Fields

1. **Remove optional fields** - If optional, is it needed?
2. **Combine fields** - "Full name" vs "First" + "Last"
3. **Auto-detect** - Derive country from IP, city from postal code
4. **Defer collection** - Get info later when needed
5. **Use defaults** - Pre-select common options

### Example

**Before:** First name, Last name, Company, Phone, Email, Address, City, State, ZIP, Country, How did you hear about us?

**After:** Email

## Mark Optional Fields

If you have optional fields, mark them clearly.

### Options

1. **Mark optional:** "Company (optional)"
2. **Mark required:** "Email *" with legend "* Required"
3. **Mark both:** Best for clarity

### Which to Mark?

| Situation | Mark |
|-----------|------|
| Mostly required fields | Mark optional |
| Mostly optional fields | Mark required |
| Mixed | Mark both |

**Recommendation:** Mark both for maximum clarity.

## Try to Avoid Optional Fields by Using Opt-ins

Instead of an optional field that most people skip, use a checkbox to reveal the field for those who need it.

### Example

**Before:**
```
Phone (optional): [____________]
```

**After:**
```
☐ Contact me by phone
   [Shows phone field when checked]
```

### Benefits

- Cleaner form for most users
- Progressive disclosure
- Clear intent from users who fill it

## Mark Both Required and Optional Fields

**Safest approach:** Mark everything clearly.

```
Email *                    Company (optional)
[________________]         [________________]

* Required fields
```

### Why Both?

- No ambiguity
- Accessible to screen readers
- Works for any mix of required/optional
- Users don't have to guess

### Formatting

- Required: asterisk (*) with legend explaining it
- Optional: "(optional)" text after label
- Place legend at top of form

## Match Field Width to the Intended Input

**Field width should hint at expected input length.**

### Width Guidelines

| Input Type | Width |
|------------|-------|
| Full name | Full width |
| Email | Full width |
| Phone | ~50% width |
| ZIP/Postal code | 4-6 characters |
| CVV | 3-4 characters |
| State abbreviation | 2 characters |
| Year | 4 characters |
| Credit card | ~16 characters |

### Why Match Width?

- Sets expectations
- Reduces errors
- Guides input
- Looks intentional

### Implementation

Don't make ALL fields full width. Use appropriate widths based on expected content.

## Stick with Conventional Form Field Styles

Users recognize form fields by their appearance. Unconventional styles cause confusion.

### Conventional Styles

- **Rectangle** with visible border
- **Label above** the field (or to the left on wide forms)
- **Rounded corners** OK but not too rounded
- **Background** slightly different from page (optional)
- **Border colour** meets 3:1 contrast

### Avoid

- Borderless fields (hard to identify as inputs)
- Underline-only (minimal but confusing)
- Unusual shapes
- Overly styled/decorated
- Fields that look like buttons

### Border Contrast

**WCAG 2.1 AA:** Form field borders must have at least **3:1 contrast** against background.

## Display Hints Above Form Fields

**Hint placement:** Above the field is safest.

### Why Above?

- Always visible (below may be cut off on mobile)
- Read before entering input
- Doesn't disappear when typing
- Works with screen magnifiers

### When Below is OK

- Very short hints
- Format examples ("mm/dd/yyyy")

### Hint Guidelines

- Keep hints short
- Explain why info is needed
- Show format if important
- Don't repeat the label

### Example

**Label:** Password
**Hint:** Must be at least 8 characters
**Field:** [________________]

## Don't Use Placeholder Text Instead of a Label

**Placeholders are NOT labels.**

### Problems with Placeholder-as-Label

1. **Disappears** when user types
2. **Low contrast** (typically light grey)
3. **Memory burden** - Can't check what field is for
4. **Screen reader issues** - May not announce properly
5. **Auto-fill confusion** - Field looks filled but isn't labelled

### Proper Use of Placeholders

- Format examples: "mm/dd/yyyy"
- Sample input: "e.g., john@example.com"
- Keep contrast sufficient (4.5:1)
- Always have a visible label too

### What to Use Instead

```
Label:        Email
Placeholder:  (optional hint or example)
Field:        [e.g., john@example.com    ]
```

## Try to Use Radio Buttons Instead of Dropdowns

**Radio buttons > Dropdowns** when you have few options.

### When to Use What

| Options | Control |
|---------|---------|
| 2 options | Checkbox, toggle, or radio buttons |
| 3-5 options | Radio buttons |
| 6-10 options | Radio buttons or dropdown |
| 11+ options | Autocomplete/search |

### Why Radio Buttons?

- **Visible** - All options shown at once
- **Faster** - Single click vs two clicks
- **Comparable** - Easy to compare options
- **Less cognitive load** - No memory needed

### When Dropdowns Are OK

- Many options (6+)
- Very limited space
- Alphabetical list (countries, states)
- Data the user knows (their birth year)

## Use an Autocomplete Instead of a Long Dropdown

For 10+ options, use an autocomplete (searchable dropdown).

### Benefits

- **Faster** - Type to filter
- **Scalable** - Works with hundreds of options
- **Flexible** - Handles typos with fuzzy matching
- **Mobile-friendly** - Brings up keyboard

### Implementation

- Allow typing to filter
- Show top results
- Keyboard navigation
- Clear selection option

### Example

Country dropdown with 200+ options → Autocomplete that filters as you type

## Use Steppers for Numeric Fields Instead of Dropdowns

For small numeric ranges, **steppers** (+ and - buttons) work better than dropdowns.

### When to Use Steppers

- Quantity selection (1-10)
- Guests/travelers
- Small number adjustments
- Ages (within small range)

### Stepper Design

- Horizontal layout preferred
- "+" and "-" buttons (not arrows)
- Direct text input allowed
- 48pt minimum target size
- Start at sensible default

### Stepper Example

```
Quantity
[-] 2 [+]
```

### Benefits

- Faster for small adjustments
- Visual feedback
- Works on touch devices
- Prevents invalid input

## Use a Checkbox or Toggle Switch for 2 Options

For yes/no, on/off, true/false options:

### Checkbox
- For agreement/acceptance
- For forms submitted later
- When unchecked state needs to be explicit

### Toggle Switch
- For immediate effect (settings)
- For on/off states
- When change happens instantly

### Key Difference

- **Checkbox:** Commit later (form submission)
- **Toggle:** Immediate effect

### Design

- Checkbox: Small square, checkmark when selected
- Toggle: Sliding switch, ON/OFF visual
- Both: Clear label describing the action

## Use Positive Phrasing for Checkboxes

**Frame checkboxes positively** - checked = enabled/yes.

### Bad (Negative Phrasing)

```
☐ Don't send me emails
```
Confusing: Does checking mean no emails or yes emails?

### Good (Positive Phrasing)

```
☐ Send me email updates
```
Clear: Checking means yes to emails.

### Test for Clarity

If you can't tell what happens when it's checked, rephrase it.

## Break Up Long Forms into Multiple Steps

For forms with many fields, **break into steps** (wizard/multi-step form).

### Guidelines

- **5-7 fields per step** ideal
- **Progress indicator** showing current step
- **Back button** to review/edit previous steps
- **Save progress** for long forms
- **Clear step labels** (not just "Step 1")

### Progress Indicator

```
Step 1 of 3: Contact Details
[●]——[○]——[○]
```

### Benefits

- Less overwhelming
- Focused attention
- Sense of progress
- Can save and resume

### When Single Form is OK

- Under 5-6 fields
- Simple task
- All fields related

## Group Related Fields Under Headings

**Group related fields** visually and with headings.

### Example Groups

- Contact Details (name, email, phone)
- Shipping Address (street, city, state, zip)
- Payment Information (card number, expiry, CVV)

### Implementation

- Clear heading for each group
- Visual spacing between groups
- Keep related fields adjacent
- Logical flow between groups

## Ensure Form Field Borders Are High Contrast

**WCAG 2.1 AA:** Form field borders must have **3:1 contrast** against background.

### Why?

- Users need to find input fields
- Low contrast borders invisible to many
- Essential for low vision users

### Testing

Use a contrast checker to verify border colour against page background.

### Alternatives to Borders

- Filled background (different from page)
- Underline (must be 3:1 contrast)
- Combination of both

## Write Clear Error Messages

See Copywriting chapter for full details.

### Error Message Formula

**What's wrong + Why + How to fix**

### Examples

**Bad:** "Invalid"
**Good:** "Enter a valid email address (e.g., name@example.com)"

**Bad:** "Error"  
**Good:** "Password must be at least 8 characters"

## Ensure Form Field Labels Are Close to Their Fields

**Labels should be close to their fields** - proximity indicates relationship.

### Spacing

- **Maximum gap:** ~8pt between label and field
- Closer is better
- More space between fields than between label and its field

### Why?

- Users can see what label belongs to what field
- Especially important with multiple fields
- Screen magnifiers show both together

### Layout

```
Label          [Gap: 4-8pt]
[Input field_______________]

[Gap: 24pt]

Label          [Gap: 4-8pt]
[Input field_______________]
```

## Validate on Submit Rather Than Inline

**Validate when user submits**, not while they're typing.

### Problems with Inline Validation

- Interrupts typing
- Premature errors (email flagged before @ typed)
- Confusing UX
- Annoying for complex fields

### When Inline Validation is OK

- After field loses focus (on blur)
- For confirming password match
- For checking username availability (after delay)
- Format validation (after typing stops)

### Best Approach

1. Let user complete field
2. Validate on blur (leaving field) OR
3. Validate on submit
4. Show all errors at once
5. Focus first error field

## Error Display

### Summary at Top

Show error summary above form:
- "Please fix 3 errors below"
- Link to each error field

### Individual Errors

Show error message above each field:
- Red icon + red border
- Error text explaining issue
- Focus first error field

### Error States

- **Border:** Red (or thicker + red)
- **Icon:** Error icon before label or in field
- **Background:** Light red tint (optional)
- **Text:** Error message above or below field
