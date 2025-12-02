# Chapter 8: Buttons

## Define 3 Button Weights

Establish a hierarchy with **three button weights**:

### Primary Button
- **Style:** Solid fill with contrasting text (usually white)
- **Usage:** Most important action on the page
- **Rule:** Only ONE primary button per view/section
- **Examples:** Submit, Save, Continue, Sign up, Buy now

### Secondary Button
- **Style:** Border/outline only, no fill
- **Usage:** Less important actions
- **Examples:** Cancel, Back, Learn more, Save draft

### Tertiary Button
- **Style:** Text only (underlined or just coloured)
- **Usage:** Least important actions
- **Examples:** Skip, Dismiss, Reset, View details

### Visual Hierarchy

```
[████ PRIMARY ████]    Most prominent
[    Secondary    ]    Medium prominence
     Tertiary          Least prominent
```

### Contrast Requirements

| Element | Requirement |
|---------|-------------|
| Button shape/border | 3:1 against background |
| Button text | 4.5:1 against button fill |
| Between button weights | 3:1 contrast difference |

## Use a Single Primary Button for the Most Important Action

**One primary button per view** - multiple primary buttons create confusion.

### Why Only One?

- Clear call-to-action
- Guides user to main goal
- Reduces decision fatigue
- Creates visual hierarchy

### Exception

Side-by-side equally important options:
- "Sign in" and "Create account" (both could be primary-styled)
- But even then, consider which is MORE important

### Common Mistake

```
[████ DELETE ████]  [████ SAVE ████]  ← Wrong: two primary
```

```
[████ SAVE ████]  [ Delete ]  ← Right: primary + secondary
```

## Use Secondary Buttons for Less Important Actions

**Secondary buttons** for actions that are available but not the main goal.

### Common Uses

- Cancel
- Back
- Save as draft
- Skip
- Alternative actions

### Pairing with Primary

```
[████ Submit ████]  [ Cancel ]
```

Primary always more prominent than secondary.

## Use Tertiary Buttons for the Least Important Actions

**Tertiary buttons** (text links styled as buttons) for lowest-priority actions.

### Common Uses

- Reset form
- Skip this step
- Dismiss
- View more details
- Less prominent navigation

### Style

- Text only
- Underline (optional but recommended for accessibility)
- Same colour as primary or muted

## Try to Avoid Disabled Buttons

**Disabled buttons are problematic:**

### Problems

1. **Low contrast** - Hard to see
2. **No explanation** - User doesn't know why
3. **Not focusable** - Can't be reached by keyboard
4. **Frustrating UX** - Dead end without guidance

### 4 Alternatives to Disabled Buttons

#### Alternative 1: Keep Button Enabled, Validate on Click

Let users click, then show what's wrong:
- Show error messages
- Highlight incomplete fields
- Guide user to fix issues

**Best for:** Forms, input validation

#### Alternative 2: Remove Unavailable Actions

If action isn't available, don't show the button at all:
- Show explanation of why action isn't available
- Show when it will become available

**Best for:** Permission-based features, eligibility requirements

#### Alternative 3: Use Lock Icon with Tooltip

Show button normally but with a lock icon:
- Still visible and recognizable
- Tooltip explains why it's locked
- Can be keyboard-focused

**Best for:** Premium features, permission needed

#### Alternative 4: If You Must Use Disabled

If disabled button is absolutely necessary:

**Requirements:**
1. Add explanation text nearby explaining why
2. Make it keyboard-focusable for screen readers
3. Add tooltip with explanation
4. Use 3:1 contrast (minimum)
5. Use `aria-describedby` for explanation

```html
<button disabled aria-describedby="disable-reason">
  Submit
</button>
<p id="disable-reason">
  Complete all required fields to submit
</p>
```

## Left Align Buttons

**Left-align buttons** in most cases.

### Why Left Align?

1. **F-pattern reading** - Eyes start left, buttons visible
2. **Screen magnifiers** - Left content always visible
3. **Mobile consistency** - Touch targets at expected location
4. **Reduced interaction cost** - Closer to most content

### Button Placement

#### Forms
```
[████ Submit ████]  [ Cancel ]
```
Both left-aligned, primary first.

#### Modal Dialogs
```
                    [ Cancel ]  [████ Confirm ████]
```
Exception: Modals often right-align with primary rightmost.

#### Mobile
```
[████████████ Primary ████████████]
[          Secondary              ]
```
Full-width, stacked vertically, primary on top.

### When Right Align is OK

- Modal confirmation dialogs
- Wizard "Next" buttons (progress flows right)
- Table row actions

## Ensure Button Text Describes the Action

**Button labels should describe what happens**, not how.

### Bad Labels

- "Click here"
- "Submit"
- "OK"
- "Yes / No"
- "Continue"

### Good Labels

- "Create account"
- "Send message"
- "Delete project"
- "Save changes"
- "Add to cart"

### Formula: Verb + Noun

```
[Verb] + [Object]
"Save" + "changes" = "Save changes"
"Delete" + "file" = "Delete file"
"Send" + "invitation" = "Send invitation"
```

### Why Descriptive?

- User knows what will happen
- Reduces anxiety
- Confirms intent
- Accessible to screen readers

### Context Exception

When context makes it clear:
- In a "Delete Project" modal: "Delete" is OK (context provides object)
- In a form: "Submit" could work if form purpose is clear

## Ensure Buttons Have a Sufficient Target Size

**Minimum touch target: 48pt × 48pt** (WCAG 2.1)

### Why 48pt?

- Average fingertip ~10mm
- Accounts for imprecise tapping
- Includes people with motor impairments
- Room for error

### Measuring Target Size

Target includes:
- Button content
- Padding
- Any clickable area

Can be achieved with:
- Large button (48pt+ height)
- Smaller button with larger clickable area (padding)

### Guidelines

| Device | Minimum Target |
|--------|----------------|
| Touch (mobile) | 48pt × 48pt |
| Desktop (mouse) | 32pt × 32pt (24pt minimum) |

### Common Mistakes

- Icon buttons too small
- Link text with no padding
- Close buttons in corners (hard to tap)

## Balance Icon and Text Pairs

When buttons have **both icon and text**, balance their visual weight.

### Icon Position

| Position | Usage |
|----------|-------|
| Leading (left of text) | Most common, natural reading flow |
| Trailing (right of text) | "Next" with arrow, external links |

### Visual Balance

- **Icon size:** Match the x-height of text (or slightly larger)
- **Spacing:** 8pt between icon and text
- **Weight:** Icon shouldn't overpower text (or vice versa)

### Examples

```
[🔍 Search]        ← Leading icon
[Next ➡]           ← Trailing icon
[+ Add item]       ← Leading icon
[Download ↓]       ← Trailing icon
```

### Icon-Only Buttons

If icon-only (no text):
- **Must have accessible label** (`aria-label`)
- **Consider tooltip** for clarity
- **48pt minimum target**

## Add Friction to Destructive Actions

**Destructive actions** (delete, remove permanently) need **friction** to prevent accidents.

### Friction Levels

| Level | Method | Example |
|-------|--------|---------|
| Light | Confirmation dialog | "Delete this file?" |
| Medium | Retype confirmation | "Type DELETE to confirm" |
| Heavy | Multi-step confirmation | Slack's channel deletion |
| Best | Allow undo | Gmail's "Undo" after delete |

### Choosing Friction Level

| Consequence | Friction |
|-------------|----------|
| Reversible (soft delete) | Light or none |
| Moderate impact | Light confirmation |
| Significant impact | Medium confirmation |
| Irreversible, high impact | Heavy confirmation |

### Best Practice: Allow Undo

If possible, don't truly delete immediately:
1. "Delete" moves to trash
2. Show "Undo" option (5-10 seconds)
3. Empty trash later or auto-delete after period

**Gmail example:** "Message deleted. Undo"

### Destructive Button Styling

**Don't use primary style for destructive actions:**

```
[████ DELETE ████]  ← Dangerous: looks like primary action
[     Delete     ]  ← Better: secondary style
[ Delete ]          ← Best: tertiary with red text
```

Consider using:
- Red text colour for destructive actions
- Secondary or tertiary weight
- Warning icon

## Common Button Mistakes

### 1. Multiple Primary Buttons
Only one primary button per view.

### 2. Disabled Without Explanation
Add text explaining why button is disabled.

### 3. Vague Labels
"Submit" → "Create account"

### 4. Wrong Hierarchy
Delete as primary, Save as secondary → Swap them.

### 5. Poor Contrast
Ensure 4.5:1 text contrast, 3:1 shape contrast.

### 6. Tiny Touch Targets
Minimum 48pt × 48pt for touch.

### 7. Icons Without Labels
Always add accessible labels for icon-only buttons.

### 8. Inconsistent Styling
Same button type should look the same everywhere.

### 9. Missing Focus State
All buttons need visible focus state for keyboard users.

## Button States

Every button needs these states designed:

| State | Description |
|-------|-------------|
| Default | Normal appearance |
| Hover | Mouse over (desktop) |
| Active/Pressed | Being clicked |
| Focus | Keyboard focus |
| Disabled | Can't be used (if necessary) |

### Focus State

Must be clearly visible:
- Outline (not just colour change)
- 3:1 contrast against surroundings
- Doesn't rely on colour alone
