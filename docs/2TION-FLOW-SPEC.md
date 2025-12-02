# 2TION Water Setup Flow
## Complete UX Specification

---

## Part 1: User Mindset & Journey Context

### The User's Mental State
When someone clicks "Set Up My Water," they're experiencing:
- **Stress**: Moving is one of life's most stressful events
- **Time pressure**: Need utilities working on move-in day
- **Decision fatigue**: Already made hundreds of moving decisions
- **Trust concerns**: Sharing personal/financial info with a new service
- **Uncertainty**: "Will this actually work? Will I have water when I arrive?"

### User Goals (in priority order)
1. **Certainty**: Know water will be ON when I move in
2. **Speed**: Get this done in under 5 minutes
3. **Simplicity**: Don't make me think or research
4. **Confirmation**: Proof that everything is set up correctly

### The Promise We Make
> "We handle the utility companies so you don't have to."

---

## Part 2: Design System Tokens

### Spacing (8pt base)
| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 8px | Icon-to-label, label-to-input |
| `space-s` | 16px | Related elements within groups |
| `space-m` | 24px | Between form fields, section padding |
| `space-l` | 32px | Between sections |
| `space-xl` | 48px | Major section breaks |
| `space-xxl` | 80px | Page sections |

### Typography (1.25 scale)
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 44px | Bold | 1.1 | Page titles only |
| H2 | 35px | Bold | 1.2 | Section headings |
| H3 | 28px | Bold | 1.25 | Card titles |
| H4 | 22px | Bold | 1.3 | Subheadings |
| Body | 18px | Regular | 1.5 | Primary text |
| Small | 16px | Regular | 1.5 | Secondary text, hints |
| Tiny | 14px | Regular | 1.5 | Legal, fine print |

### Color Palette (Monochromatic, HSB base: 220)
| Token | HSB | Hex | Usage |
|-------|-----|-----|-------|
| `primary` | 220, 70, 65 | #3366CC | Interactive elements, CTAs |
| `primary-hover` | 220, 70, 55 | #2B57AD | Button hover states |
| `darkest` | 220, 60, 20 | #141D33 | Headings, primary text |
| `dark` | 220, 30, 45 | #505F73 | Secondary text |
| `medium` | 220, 20, 66 | #8A95A8 | Borders, icons |
| `light` | 220, 8, 92 | #D8DCE3 | Dividers, inactive |
| `lightest` | 220, 3, 97 | #F4F5F7 | Backgrounds |
| `white` | 0, 0, 100 | #FFFFFF | Main background |
| `success` | 145, 65, 50 | #2D8046 | Success states |
| `error` | 0, 70, 60 | #CC3333 | Error states |

### Button Hierarchy
| Weight | Style | Usage |
|--------|-------|-------|
| Primary | Solid `primary` fill, white text | ONE per view - main action |
| Secondary | `primary` border only, `primary` text | Back, alternative actions |
| Tertiary | Underlined `primary` text | Skip, dismiss, less important |

### Form Controls
- Labels: Above fields, `space-xs` (8px) gap
- Field height: 48px minimum (touch target)
- Field border: 2px `medium` (3:1 contrast)
- Field border radius: 8px
- Error state: 2px `error` border + error icon + message above field

---

## Part 3: Flow Architecture

### Critical Path (5 steps)
```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  1. Address │ → │ 2. Profile  │ → │ 3. Services │ → │ 4. Verify   │ → │ 5. Confirm  │
│     Entry   │   │    Info     │   │   & Plans   │   │  Identity   │   │   & Done    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
     30s              45s               60s               60s              15s
```

**Total time target: 3-4 minutes**

### Progress Indicator
Simple step indicator showing: `Step X of 5`
No clickable steps (prevents skipping), but shows names:
1. Address
2. About you
3. Your services
4. Verification
5. Confirmation

---

## Part 4: Screen-by-Screen Specification

---

### Screen 1: Address Entry
**Goal**: Confirm we can service this address and capture move-in date

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 1 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Where are you moving?                                       │
│  ─────────────────────                                       │
│  We'll check which utilities we can set up for you.         │
│                                                              │
│  Street address                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Autocomplete input]                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Apartment, suite, unit (optional)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  When are you moving in?                                     │
│  ┌────────────────────┐                                      │
│  │ [Date picker]      │                                      │
│  └────────────────────┘                                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Check availability                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Where are you moving?

**Subheading (Body, dark)**
> We'll check which utilities we can set up for you.

**Field Labels**
- `Street address` (required, no asterisk - all fields required by default)
- `Apartment, suite, unit (optional)` - marked optional per guidelines
- `When are you moving in?`

**Date Hint (Small, below label)**
> We'll schedule your services to start on this date.

**Primary Button**
> Check availability

**Autocomplete Placeholder**
> Start typing your address...

#### Validation Rules
- Address: Required, must resolve via Google Places API
- Move-in date: Required, must be today or future, within 90 days
- Apartment: Optional, max 20 characters

#### Error Messages
| Condition | Message |
|-----------|---------|
| Address not found | Enter a valid street address. Try including the city and state. |
| Address not serviceable | We don't service this area yet. Check back soon or enter a different address. |
| Move-in date in past | Choose a date that's today or later. |
| Move-in date too far | Choose a move-in date within the next 90 days. |

#### Loading State
After "Check availability" click:
- Button shows spinner + "Checking..."
- Disable button (with visible explanation)
- Expected duration: 1-2 seconds

---

### Screen 1.5: Service Availability (Inline Reveal)
**Goal**: Show what services are available with strategic upsell framing

#### Layout (replaces form after successful check)
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 1 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Great news!                                                 │
│  ───────────                                                 │
│  We can set up utilities for:                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  123 Main Street, Apt 4B                              │   │
│  │  Dallas, TX 75201                                     │   │
│  │  Move-in: January 15, 2026                            │   │
│  │                                                [Edit] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Available services                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  💧  Water                                            │   │
│  │      City of Dallas Water Utilities                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ⚡  Electricity                                       │   │
│  │      Choose from 12 providers                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📡  Internet                                          │   │
│  │      Choose from 5 providers                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Continue                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Setting up all utilities together saves time and ensures   │
│  everything works when you arrive.                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Great news!

**Subheading (Body)**
> We can set up utilities for:

**Address Card**: Show full address with "Edit" tertiary link

**Service Cards** (each service available):
| Icon | Service | Provider Line |
|------|---------|---------------|
| 💧 | Water | `[Provider name]` |
| ⚡ | Electricity | `Choose from [X] providers` |
| 📡 | Internet | `Choose from [X] providers` |

**Upsell Hook (Small, below button)**
> Setting up all utilities together saves time and ensures everything works when you arrive.

**Primary Button**
> Continue

---

### Screen 2: Profile Information
**Goal**: Collect minimum info needed for utility setup

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 2 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Tell us about yourself                                      │
│  ──────────────────────                                      │
│  This info is required by utility providers.                 │
│                                                              │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │ First name              │ │ Last name               │    │
│  │ [                     ] │ │ [                     ] │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
│                                                              │
│  Email                                                       │
│  We'll send your confirmation and account details here.     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Phone                                                       │
│  For account setup and service notifications.                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ (   )    -                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ☐ Text me service updates and reminders                    │
│                                                              │
│                                                              │
│  [ Back ]          ┌────────────────────────────────────┐   │
│                    │           Continue                   │   │
│                    └────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Tell us about yourself

**Subheading (Body, dark)**
> This info is required by utility providers.

**Field Labels & Hints**
| Field | Label | Hint |
|-------|-------|------|
| First name | `First name` | — |
| Last name | `Last name` | — |
| Email | `Email` | We'll send your confirmation and account details here. |
| Phone | `Phone` | For account setup and service notifications. |

**SMS Opt-in (Checkbox, positive phrasing)**
> Text me service updates and reminders

**Buttons**
- Secondary (left): `Back`
- Primary (right): `Continue`

#### Field Specifications
| Field | Type | Width | Format |
|-------|------|-------|--------|
| First name | Text | 50% | Capitalize first letter |
| Last name | Text | 50% | Capitalize first letter |
| Email | Email | 100% | Standard email validation |
| Phone | Tel | 100% | (XXX) XXX-XXXX auto-format |

#### Error Messages
| Condition | Message |
|-----------|---------|
| First name empty | Enter your first name. |
| Last name empty | Enter your last name. |
| Email invalid | Enter a valid email address like name@example.com |
| Phone invalid | Enter a 10-digit phone number. |

---

### Screen 3: Service Selection & Plans
**Goal**: Select services and plans with strategic upsell presentation

#### Core Principle
Water is already selected (they clicked "Set Up My Water"). Present electricity and internet as natural additions, not intrusive upsells.

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 3 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Choose your services                                        │
│  ──────────────────────                                      │
│  Select the utilities you want us to set up.                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ✓  💧 Water                                          │   │
│  │      City of Dallas Water Utilities                   │   │
│  │      Standard residential service                     │   │
│  │                                                       │   │
│  │      Monthly estimate: ~$45-65                        │   │
│  │      Setup fee: $0                           [●────]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ☐  ⚡ Electricity                          + Add     │   │
│  │      12 providers available                           │   │
│  │      Starting at $0.08/kWh                            │   │
│  │                                                       │   │
│  │      ⭐ Most people set this up with water            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ☐  📡 Internet                             + Add     │   │
│  │      5 providers available                            │   │
│  │      Starting at $39.99/mo                            │   │
│  │                                                       │   │
│  │      📦 Bundle with electricity for faster setup      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│                                                              │
│  [ Back ]          ┌────────────────────────────────────┐   │
│                    │      Continue with water            │   │
│                    └────────────────────────────────────┘   │
│                                                              │
│               or  Set up all three services                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Choose your services

**Subheading (Body)**
> Select the utilities you want us to set up.

**Water Card (pre-selected)**
- Icon + "Water" (H3, checkmark indicates selected)
- Provider: `City of Dallas Water Utilities`
- Plan: `Standard residential service`
- Estimate: `Monthly estimate: ~$45-65`
- Fee: `Setup fee: $0`
- Toggle: ON by default, labeled

**Electricity Card (upsell)**
- Icon + "Electricity" (H3)
- `12 providers available`
- `Starting at $0.08/kWh`
- Social proof badge: `Most people set this up with water`
- Action: `+ Add` button (secondary style)

**Internet Card (upsell)**
- Icon + "Internet" (H3)
- `5 providers available`
- `Starting at $39.99/mo`
- Bundle hook: `Bundle with electricity for faster setup`
- Action: `+ Add` button (secondary style)

**Primary Button (Dynamic)**
| Selected Services | Button Text |
|-------------------|-------------|
| Water only | Continue with water |
| Water + Electricity | Continue with 2 services |
| Water + Internet | Continue with 2 services |
| All three | Continue with 3 services |

**Tertiary Alternative (below button)**
> or Set up all three services

#### When User Clicks "+ Add" on Electricity
Expand card to show plan selection:

```
┌──────────────────────────────────────────────────────────────┐
│  ✓  ⚡ Electricity                              [Remove]     │
│                                                              │
│  Choose your plan                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ○  TXU Energy - Free Nights                           │ │
│  │     $0.12/kWh days, free 9pm-6am                       │ │
│  │     12 month contract                                  │ │
│  │     ⭐ Best for night owls                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ●  Reliant - Simply Prepaid                RECOMMENDED │ │
│  │     $0.10/kWh flat rate                                │ │
│  │     No contract, pay as you go                         │ │
│  │     ⭐ Most flexible option                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ○  Green Mountain - 100% Renewable                    │ │
│  │     $0.11/kWh flat rate                                │ │
│  │     24 month contract                                  │ │
│  │     🌱 100% wind power                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  View all 12 plans →                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Plan Selection Copy**

**Section label (H4)**
> Choose your plan

**Plan Card Elements**
- Radio button (single selection)
- Provider + Plan name (Bold)
- Rate: `$X.XX/kWh [details]`
- Contract: `[Term] contract` or `No contract`
- Badge: Recommendation or differentiator

**Recommended Plan Badge**
> RECOMMENDED

**View All Link (Tertiary)**
> View all 12 plans →

#### When User Clicks "+ Add" on Internet
Similar expansion with ISP options:

```
┌──────────────────────────────────────────────────────────────┐
│  ✓  📡 Internet                                 [Remove]     │
│                                                              │
│  Choose your plan                                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ○  AT&T Fiber - 300 Mbps                              │ │
│  │     $55/mo for 12 months                               │ │
│  │     Best for streaming and remote work                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ●  Spectrum - 500 Mbps                    RECOMMENDED  │ │
│  │     $49.99/mo, no contract                             │ │
│  │     Free installation this month                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ○  Frontier - 1 Gbps                                  │ │
│  │     $79.99/mo, 2 year price lock                       │ │
│  │     Fastest option available                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  View all 5 plans →                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Identity Verification
**Goal**: Collect required verification documents with clear explanation of WHY

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 4 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Verify your identity                                        │
│  ─────────────────────                                       │
│  Utility providers require ID and proof of residence.        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📄  Driver's license or state ID                     │   │
│  │                                                       │   │
│  │  Required by City of Dallas Water Utilities           │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │                                                │  │   │
│  │  │     📷  Take photo or upload file              │  │   │
│  │  │                                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  Accepted formats: JPG, PNG, PDF (max 10MB)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📄  Lease agreement or utility bill                  │   │
│  │                                                       │   │
│  │  Proves you'll live at 123 Main St, Dallas TX         │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │                                                │  │   │
│  │  │     📷  Take photo or upload file              │  │   │
│  │  │                                                │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  First page with your name and address is fine.       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  🔒 Your documents are encrypted and only shared with       │
│     utility providers. We delete them after setup.          │
│                                                              │
│                                                              │
│  [ Back ]          ┌────────────────────────────────────┐   │
│                    │         Submit for review           │   │
│                    └────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Verify your identity

**Subheading (Body)**
> Utility providers require ID and proof of residence.

**Document 1: ID**
- Icon + Label (H4): `Driver's license or state ID`
- Requirement note: `Required by [Provider Name]`
- Upload area: `Take photo or upload file`
- Format hint: `Accepted formats: JPG, PNG, PDF (max 10MB)`

**Document 2: Proof of Residence**
- Icon + Label (H4): `Lease agreement or utility bill`
- Requirement note: `Proves you'll live at [Address]`
- Upload area: `Take photo or upload file`
- Helpul hint: `First page with your name and address is fine.`

**Privacy Assurance (Small, with lock icon)**
> Your documents are encrypted and only shared with utility providers. We delete them after setup.

**Buttons**
- Secondary: `Back`
- Primary: `Submit for review`

#### Upload States

**Empty State**
```
┌────────────────────────────────────────────────┐
│                                                │
│     📷  Take photo or upload file              │
│                                                │
└────────────────────────────────────────────────┘
```

**Uploading State**
```
┌────────────────────────────────────────────────┐
│  ████████████░░░░░░░░  65%                     │
│  drivers_license.jpg                           │
│                                      [Cancel]  │
└────────────────────────────────────────────────┘
```

**Uploaded State**
```
┌────────────────────────────────────────────────┐
│  ✓  drivers_license.jpg              [Remove]  │
│     2.4 MB • Uploaded                          │
└────────────────────────────────────────────────┘
```

**Error State**
```
┌────────────────────────────────────────────────┐
│  ✗  File too large. Choose a file under 10MB. │
│                                                │
│     📷  Take photo or upload file              │
│                                                │
└────────────────────────────────────────────────┘
```

#### Error Messages
| Condition | Message |
|-----------|---------|
| No ID uploaded | Upload your driver's license or state ID. |
| No proof uploaded | Upload a lease agreement or utility bill. |
| File too large | File too large. Choose a file under 10MB. |
| Wrong format | Upload a JPG, PNG, or PDF file. |
| Upload failed | Upload failed. Check your connection and try again. |

---

### Screen 5: Order Review & Confirmation
**Goal**: Show everything clearly, build confidence, complete the order

#### Layout (Before Submit)
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                              Step 5 of 5       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Review your order                                           │
│  ─────────────────                                           │
│  Make sure everything looks right before we submit.          │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  Service address                                     [Edit]  │
│  123 Main Street, Apt 4B                                     │
│  Dallas, TX 75201                                            │
│  Starting January 15, 2026                                   │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  Your information                                    [Edit]  │
│  Test Testing                                                │
│  test@example.com                                            │
│  (555) 123-4567                                              │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  Services                                            [Edit]  │
│                                                              │
│  💧 Water                                                    │
│     City of Dallas Water Utilities                           │
│     Standard residential • Setup: $0                         │
│                                                              │
│  ⚡ Electricity                                               │
│     Reliant - Simply Prepaid                                 │
│     $0.10/kWh flat rate • No contract                        │
│                                                              │
│  📡 Internet                                                  │
│     Spectrum - 500 Mbps                                      │
│     $49.99/mo • Free installation                            │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  Documents                                           [Edit]  │
│  ✓ Driver's license uploaded                                 │
│  ✓ Lease agreement uploaded                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  By placing this order, you agree to the Terms of Service    │
│  and authorize us to set up utilities on your behalf.        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Place order                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [ Back ]                                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Heading (H1)**
> Review your order

**Subheading (Body)**
> Make sure everything looks right before we submit.

**Section Headers (H4, with Edit links)**
- `Service address`
- `Your information`
- `Services`
- `Documents`

**Service Details Format**
```
[Icon] [Service Name]
   [Provider - Plan Name]
   [Rate/Terms] • [Contract/Setup info]
```

**Documents Section**
- `✓ Driver's license uploaded`
- `✓ Lease agreement uploaded`

**Legal (Tiny, above button)**
> By placing this order, you agree to the Terms of Service and authorize us to set up utilities on your behalf.

**Primary Button**
> Place order

**Secondary Button**
> Back

---

### Screen 5b: Order Confirmed (Success State)
**Goal**: Confirm success, set expectations, provide next steps

#### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  [2TION Logo]                                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                          ✓                                   │
│                                                              │
│  You're all set!                                             │
│  ───────────────                                             │
│  We're setting up your utilities now.                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Order #2TION-78432                                   │   │
│  │                                                       │   │
│  │  123 Main Street, Apt 4B                              │   │
│  │  Dallas, TX 75201                                     │   │
│  │                                                       │   │
│  │  Services starting January 15, 2026                   │   │
│  │                                                       │   │
│  │  ────────────────────────────────────────────────     │   │
│  │                                                       │   │
│  │  💧 Water                           Setting up...     │   │
│  │     City of Dallas Water Utilities                    │   │
│  │                                                       │   │
│  │  ⚡ Electricity                      Setting up...     │   │
│  │     Reliant - Simply Prepaid                          │   │
│  │                                                       │   │
│  │  📡 Internet                         Setting up...     │   │
│  │     Spectrum - 500 Mbps                               │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  What happens next                                           │
│  ─────────────────                                           │
│                                                              │
│  1. We submit your information to each provider              │
│  2. You'll receive confirmation emails within 24 hours       │
│  3. Utilities will be active on your move-in date            │
│                                                              │
│  Questions? Contact support@2tion.com                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            View order details                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│              Download confirmation (PDF)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### UX Copy

**Success Icon**: Large checkmark in success green

**Heading (H1)**
> You're all set!

**Subheading (Body)**
> We're setting up your utilities now.

**Order Card**
- Order number: `Order #2TION-XXXXX`
- Address (full)
- Service date: `Services starting [Date]`
- Service list with status: `Setting up...` or `✓ Confirmed`

**What Happens Next (H3)**
> What happens next

**Steps (numbered list)**
1. We submit your information to each provider
2. You'll receive confirmation emails within 24 hours
3. Utilities will be active on your move-in date

**Support (Small)**
> Questions? Contact support@2tion.com

**Primary Button**
> View order details

**Tertiary Link**
> Download confirmation (PDF)

---

## Part 5: Mobile Adaptations

### General Mobile Rules
- All buttons: Full width, stacked vertically
- Primary button always on top when stacked
- Touch targets: 48px minimum height
- Form fields: Full width
- Cards: Full width, no side margins
- Step indicator: Simplified to "Step X of 5" text only

### Screen 3 (Service Selection) Mobile
```
┌────────────────────────────────────┐
│  [Logo]           Step 3 of 5      │
├────────────────────────────────────┤
│                                    │
│  Choose your services              │
│  ─────────────────────             │
│                                    │
│  ┌────────────────────────────┐   │
│  │ ✓ 💧 Water                  │   │
│  │   City of Dallas           │   │
│  │   ~$45-65/mo   [────●]     │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ ☐ ⚡ Electricity             │   │
│  │   12 providers              │   │
│  │   From $0.08/kWh  [+ Add]  │   │
│  │   ⭐ Most add this          │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │ ☐ 📡 Internet               │   │
│  │   5 providers               │   │
│  │   From $39.99/mo  [+ Add]  │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │    Continue with water      │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │         Back                │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

---

## Part 6: Error States & Edge Cases

### Global Error Handling

**Connection Error (Toast)**
> Connection lost. Check your internet and try again.
> [Retry]

**Server Error (Toast)**
> Something went wrong on our end. Please try again.
> [Retry]

**Session Timeout (Modal)**
> Your session expired
> For security, we logged you out after 30 minutes of inactivity.
> [Start over]

### Address Edge Cases

**Apartment/Multi-unit Required**
When address is multi-unit building but no unit provided:
> This address has multiple units. Enter your apartment or unit number.

**Service Area Boundary**
When address is just outside service area:
> We don't service [City] yet, but we're expanding soon. Enter your email to get notified.
> [Email field] [Notify me]

### Document Upload Edge Cases

**Blurry Image**
> This image is blurry. Take another photo with better lighting.

**Wrong Document Type**
> This doesn't look like a driver's license. Upload a clear photo of your ID.

**Document Expired**
> This ID appears to be expired. Upload a current ID.

---

## Part 7: Accessibility Checklist

### Per Screen
- [ ] All form fields have visible labels (not placeholder-only)
- [ ] Error messages appear above fields and describe how to fix
- [ ] Focus order follows logical reading order
- [ ] All interactive elements have 48px minimum touch target
- [ ] Color is not the only indicator of state (icons, text used too)
- [ ] Contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI elements
- [ ] Page has single H1, logical heading hierarchy
- [ ] Links describe their destination
- [ ] Buttons describe their action

### Global
- [ ] Skip link to main content
- [ ] Focus visible on all interactive elements
- [ ] No keyboard traps
- [ ] Form validation on submit, not real-time
- [ ] Loading states announced to screen readers
- [ ] Modals trap focus and have close button

---

## Part 8: Analytics Events

### Key Conversion Funnel
| Event | Description |
|-------|-------------|
| `address_entered` | User entered valid address |
| `availability_checked` | Availability API returned |
| `profile_completed` | User submitted profile info |
| `service_selected` | User toggled a service on/off |
| `electricity_added` | User added electricity (upsell) |
| `internet_added` | User added internet (upsell) |
| `plan_selected` | User selected specific plan |
| `documents_uploaded` | User uploaded both documents |
| `order_submitted` | User clicked Place order |
| `order_confirmed` | Order successfully processed |

### Drop-off Points to Track
- Address not serviceable rate
- Profile abandonment rate
- Document upload abandonment
- Time per step

---

## Part 9: Content Requirements from Backend

### Address Check Response
```json
{
  "serviceable": true,
  "address": {
    "street": "123 Main Street",
    "unit": "Apt 4B",
    "city": "Dallas",
    "state": "TX",
    "zip": "75201"
  },
  "services": {
    "water": {
      "available": true,
      "provider": "City of Dallas Water Utilities",
      "plans": [...]
    },
    "electricity": {
      "available": true,
      "provider_count": 12,
      "starting_rate": "$0.08/kWh",
      "plans": [...]
    },
    "internet": {
      "available": true,
      "provider_count": 5,
      "starting_rate": "$39.99/mo",
      "plans": [...]
    }
  }
}
```

### Plan Object Structure
```json
{
  "id": "reliant-prepaid",
  "provider": "Reliant",
  "name": "Simply Prepaid",
  "rate": "$0.10/kWh",
  "rate_type": "flat",
  "contract_months": 0,
  "contract_label": "No contract",
  "setup_fee": 0,
  "features": ["Pay as you go", "No credit check"],
  "badge": "RECOMMENDED",
  "badge_reason": "Most flexible option"
}
```

---

## Summary: Design Principles Applied

| Practical UI Principle | How Applied |
|------------------------|-------------|
| Single column forms | All forms single column except first/last name |
| Minimize form fields | Only essential fields, optional clearly marked |
| Label above field | Every field has label above with 8px gap |
| Progressive disclosure | Service plans expand only when selected |
| Single primary button | One primary CTA per screen |
| Descriptive button labels | "Continue with water" not "Continue" |
| Clear error messages | What's wrong + how to fix |
| 48px touch targets | All buttons, inputs meet minimum |
| 4.5:1 text contrast | All text meets WCAG AA |
| Break up complex forms | 5 steps instead of one long form |
| Left-aligned buttons | All buttons left-aligned (except modals) |
| Consistent vocabulary | "Services" not "utilities/services/plans" |
| Sentence case | All copy uses sentence case |
| Avoid disabled buttons | Validate on click, show errors |
| Generous white space | 24-32px between form groups |
| Monochromatic palette | Single brand color, tinted greys |
| Front-load text | Key info first in every sentence |

---

*Specification Version 1.0*
*Created for 2TION Water Setup Flow*
*Based on Practical UI by Adham Dannaway*
