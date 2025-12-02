# Chapter 6: Copywriting

## Be Concise

Every word should earn its place. Remove unnecessary words to make text faster to read and easier to understand.

### Words to Remove

| Remove | Why |
|--------|-----|
| Actually | Filler word |
| Basically | Filler word |
| Just | Filler word (usually) |
| Really | Vague intensifier |
| Very | Vague intensifier |
| In order to | Use "to" |
| Due to the fact that | Use "because" |
| At this point in time | Use "now" |
| Would you like to | Use imperative ("Save file") |
| Please | Usually unnecessary in UI |
| Successfully | Implied in success message |

### Before/After Examples

**Before:** "Would you like to save your changes before closing?"
**After:** "Save changes?"

**Before:** "Your message was successfully sent."
**After:** "Message sent."

**Before:** "In order to continue, please enter your password."
**After:** "Enter password to continue."

### Avoid Introductory Phrases

- "Welcome to our app" - They know where they are
- "Here you can..." - Just describe what's there
- "We are pleased to..." - Skip to the point

## Use Sentence Case

**Sentence case:** Capitalize only the first word and proper nouns

**Why sentence case?**
- Easier to read
- More natural
- Less visual noise
- Friendly tone

### Comparison

| Style | Example |
|-------|---------|
| Sentence case ✓ | "Create your account" |
| Title Case | "Create Your Account" |
| ALL CAPS | "CREATE YOUR ACCOUNT" |

### Where to Use Sentence Case

- Buttons
- Headings
- Labels
- Menu items
- Error messages
- Tooltips
- Everything in UI

### Exceptions

- Proper nouns (Google, iPhone)
- Acronyms (API, URL)
- Brand names if they require it

## Use Plain and Simple Language

Write for a general audience. Avoid jargon, technical terms, and complex words.

### Word Substitutions

| Complex | Simple |
|---------|--------|
| Utilize | Use |
| Facilitate | Help |
| Commence | Start |
| Terminate | End |
| Subsequently | Then |
| Prior to | Before |
| In the event that | If |
| Approximately | About |
| Implement | Do, Make |
| Modify | Change |
| Acquire | Get |

### Guidelines

- Write at an 8th-grade reading level
- Short sentences (15-20 words max)
- One idea per sentence
- Active voice over passive voice

### Active vs Passive

**Passive:** "Your file was deleted by the system"
**Active:** "The system deleted your file" or better: "File deleted"

## Front-Load Text

Put the most important information first. People scan from left to right—lead with what matters.

### Examples

**Bad:** "To save your changes, click the Save button"
**Good:** "Click Save to save your changes" or just "Save changes"

**Bad:** "If you have any questions, please contact support"
**Good:** "Contact support for questions"

### Application

- Headings: Key word first
- Instructions: Action first
- Buttons: Verb first (not "Click here to...")
- Error messages: What went wrong first

## Use the Inverted Pyramid

**Structure:** Most important information first, details last.

```
       ┌─────────────────┐
       │  Most Important │  ← Lead with this
       ├─────────────────┤
       │     Details     │  ← Supporting info
       ├─────────────────┤
       │   Background    │  ← Nice to have
       └─────────────────┘
```

### Why?

- People scan, don't read everything
- Important info is seen first
- Works if text is truncated

### Application

- Product descriptions
- Feature explanations
- Help articles
- Email content

## Limit the Use of Abbreviations and Acronyms

Abbreviations and acronyms can confuse users who don't know them.

### Guidelines

1. **Spell out first use:** "Web Content Accessibility Guidelines (WCAG)"
2. **Common abbreviations OK:** FAQ, PDF, URL
3. **Domain-specific:** Only if audience knows them
4. **Avoid creating new ones:** If people won't know it, spell it out

### When Abbreviations Are OK

- Universally known (FAQ, PDF)
- Space is extremely limited
- Technical audience who knows the terms
- After spelling out on first use

### When to Avoid

- General consumer audiences
- Critical instructions
- Error messages
- First-time user experiences

## Limit the Use of UPPERCASE

### Problems with UPPERCASE

1. **Harder to read** - Lose word shapes
2. **Feels like shouting** - Aggressive tone
3. **Takes more space** - Same content, wider
4. **Accessibility** - Screen readers may spell out letters

### Acceptable Uses

- Short labels (1-2 words): "NEW", "SALE"
- Category tabs
- With careful styling (bold, increased letter spacing)

### Requirements for Readable UPPERCASE

- Bold weight
- At least 11-12px size
- Increased letter spacing (+0.05em to +0.1em)
- Maximum 2-3 words

## Break Up Content Using Descriptive Headings and Bullets

### Headings

**Make headings descriptive**, not vague.

| Vague | Descriptive |
|-------|-------------|
| Overview | How our pricing works |
| Features | Features that save you time |
| Details | Shipping and return policies |
| More | Related products you might like |

**Why descriptive?**
- Scannable
- SEO benefits
- Screen readers announce them
- Aid navigation

### Bullets

Use bullets to:
- Break up long paragraphs
- List features/benefits
- Show steps or options

**Bullet guidelines:**
- Keep items parallel (same grammatical structure)
- Start with verbs for action items
- Keep items similar length
- 3-7 items ideal

## Avoid Using "My" on Form Labels

**Prefer:** "Name" over "My name"
**Prefer:** "Email" over "Your email"

### Why?

- Shorter
- Less confusing (whose perspective?)
- Consistent
- Works better for screen readers

### Exception

Sometimes "my" creates clarity:
- "My account" vs "Account" (in navigation)
- "My orders" vs "Orders"

But for form labels, skip it.

## Use Vocabulary Consistently

Use the same word for the same concept throughout.

### Examples

| Inconsistent | Consistent |
|--------------|------------|
| Cart / Bag / Basket | Cart (pick one) |
| Log in / Sign in | Sign in (pick one) |
| Settings / Preferences / Options | Settings (pick one) |
| Cancel / Dismiss / Close | Cancel (context-dependent) |

### Create a Terminology Guide

Document chosen terms:
- Cart (not bag, basket)
- Sign in / Sign out (not log in/out)
- Delete (not remove, for permanent actions)
- Remove (not delete, for reversible actions)

## Use Numerals for Numbers

**Use numerals** (1, 2, 3) instead of words (one, two, three).

### Why Numerals?

- Faster to scan
- Take less space
- Stand out in text
- Easier to compare

### Examples

**Words:** "You have three new messages"
**Numerals:** "You have 3 new messages" ✓

**Words:** "Shipping in five to seven days"
**Numerals:** "Shipping in 5-7 days" ✓

### Formatting Numbers

- Thousands separator: 1,000 (not 1000)
- Decimals: 4.5 (not 4,5 in English)
- Percentages: 25% (not 25 percent)
- Currency: $10 (symbol before number)
- Large numbers: 1.2M, 3.5K (for approximate values)

### Exception

- Beginning of sentence: "Five users joined" (or restructure)
- Stylistic choice for small numbers in prose

## Avoid Full Stops If Possible

**Full stops (periods)** at the end of UI text are usually unnecessary.

### Don't Use Full Stops

- Headings
- Button labels
- Navigation items
- List items (unless full sentences)
- Tooltips
- Labels

### Use Full Stops

- Full sentences in body text
- Multiple sentences together
- Help documentation

### Why Avoid?

- Cleaner appearance
- Matches user expectations
- Reduces visual noise

## Ensure Text Length is Similar Across Similar Interface Elements

When elements should look equal, keep their text lengths similar.

### Examples

**Pricing cards:** Feature lists should have similar number of items and length

**Navigation:** Menu items roughly similar length

**Cards:** Titles and descriptions similar length (or truncate)

### Solutions

- Edit copy to match lengths
- Truncate with ellipsis (...)
- Use line clamping
- Restructure content

## Ensure Text Links Describe Their Destination

Link text should describe where the link goes, not how it works.

### Bad Link Text

- "Click here"
- "Learn more"
- "Read more"
- "Here"

### Good Link Text

- "View pricing plans"
- "Read the full article"
- "Download the PDF"
- "Contact support"

### Why Descriptive Links?

1. **Scannability** - Users scan for links
2. **Accessibility** - Screen readers list links out of context
3. **SEO** - Search engines use link text
4. **Clarity** - Users know what to expect

### Guidelines

- 2-5 words ideal
- Describe the destination
- Avoid "click" (not all users click)
- Front-load keywords

## Write Clear Error Messages

### Error Message Formula

**What went wrong + Why + How to fix it**

### Bad vs Good

**Bad:** "Error"
**Good:** "Password is incorrect. Please try again."

**Bad:** "Invalid input"
**Good:** "Email address must include @ symbol"

**Bad:** "An error occurred"
**Good:** "Unable to save. Check your connection and try again."

### Guidelines

1. **Be specific** - What exactly is wrong?
2. **Be helpful** - How do they fix it?
3. **Be human** - Avoid technical jargon
4. **Be brief** - Get to the point
5. **Don't blame** - "Password incorrect" not "You entered wrong password"

### Format

- Use sentence case
- No exclamation marks
- Don't apologize excessively
- Provide clear next action
