# Chapter 1: Fundamentals

## Minimise Usability Risks

While it might not sound very fun or creative, base many design decisions on risk—the risk that someone could have difficulty using an interface.

**Common usability risks:**
- Thin, light grey text can look sleek and trendy, but there's a risk that some may find it difficult to read
- Icons without labels can look clean and minimal, but there's a risk that some might not understand what the icons mean. This risk is greater for those with cognitive and vision impairments
- It might look nice to add colour to heading text, but there's a risk that some could mistake it for a link

Usability testing should highlight large risks, but smaller ones could go unnoticed. It depends on the diversity of users you test with and the effectiveness of the testing. Most of the time you don't know the different types of people that will be using your product, so it's safest to cater to as many as possible.

**Consider:** People with poor eyesight, low computer literacy, reduced dexterity, and cognitive ability. Make sure that your designs meet Web Content Accessibility Guidelines (WCAG).

**Target:** WCAG 2.1 Level AA requirements—this is the medium level of conformance and a good place to start.

Keep an eye out for potential usability risks. If there's anything that's slightly vague, confusing or unclear, simplify it to make it crystal clear before investing time and money in usability testing.

## Have a Logical Reason for Every Design Detail

The importance of UI design is often trivialised as being nothing more than making an interface look pretty. This demonstrates an ignorance of the logic behind UI design. Sure, some elements are purely decorative, but if an interface is designed well, every detail will have a logical reason behind it that improves usability.

UI design is about so much more than how it looks. It's about how it works and why it works that way. When designing an interface, you're literally designing the user's experience.

**Benefits of designing with logic:**
- Faster and easier design decisions
- Support decisions in discussions
- Provide constructive feedback to other designers

"That looks nice" or "I don't like it" are just subjective opinions, not logical or constructive feedback.

**Example logical reasons for a simple row of text blocks with icons:**
- Icons and text are left aligned to create a neat left edge—improves readability and aesthetics while decreasing cognitive load
- Headings and text links are descriptive so they're scannable and can be read out of context by screen readers
- Secondary text is less important than headings, so it's made less prominent (using size and contrast) to create a clear visual hierarchy
- Secondary text line height is at least 1.5 to improve readability
- Text links are coloured blue to indicate they're interactive and underlined so the colour blind can distinguish them from other text
- Spacing inside each block is less than the spacing between each block to create groups of related information
- Spacing is based on a set of predefined spacing options to improve consistency
- Information is broken up into smaller groups to make it easier to understand and to help speed up decision making
- Colours are based on an accessible monochromatic colour palette with rules that govern its usage

## Minimise Interaction Cost

**Definition:** Interaction cost is the sum of physical and mental effort required to achieve a task.

**Components:** Looking, scrolling, searching, reading, clicking, waiting, typing, thinking, and remembering all add to interaction cost.

The higher the interaction cost, the harder it is for someone to achieve their task. The great thing about interaction cost is that you can measure it—try to minimise it to make it easier for people to achieve their goals.

Simple apps that focus on doing a specific task efficiently are often the most successful because they keep interaction costs down.

### How to Minimise Interaction Cost

**1. Keep related actions close (Fitts's Law)**
According to Fitts's Law, the closer and larger a target, the faster it is to click on that target. Keep actions close to the element they relate to and try to ensure they have a sufficient target area (at least 48pt by 48pt is a safe size).

**2. Reduce distractions**
Attention grabbing distractions like animated banners, pop-ups, and unnecessary visuals can pull people's attention away from the task they're trying to complete.

**3. Minimise choice (Hick's Law)**
According to Hick's Law, the time it takes to make a decision increases with the number and complexity of choices. Reduce choices to speed up decisions. You can also highlight a smaller set of recommended or popular items to help people make decisions faster.

### Interaction Cost Example

**Before (high cost):** Dropdown quantity selector
- 2 clicks to open and select
- 1 scroll through options
- Move mouse to "Add to cart" button
- 1 click
- **Total: 3 clicks, a scroll, and a short mouse movement**

**After (low cost):** Stepper component + left-aligned button
- Stepper allows increase/decrease with single button press or typing
- Button close to quantity selector
- Left-aligned button ensures it won't be missed by screen magnifier users
- **Total: 2 clicks and a very small mouse movement**

## Minimise Cognitive Load

**Definition:** Cognitive load is the amount of brain power required to use an interface.

**Goal:** Minimise cognitive load to make your interface as easy to use as possible. This frees up mental resources for people to focus on the task they're trying to achieve.

### Quick Ways to Reduce Cognitive Load

1. **Remove unnecessary styles, information, and decisions** to reduce distractions
2. **Break up information into smaller groups** to clearly show relationships and speed up decision making
3. **Use conventional design patterns** that people are familiar with
4. **Maintain consistency** by ensuring that similar elements look and work in a similar way
5. **Create a clear visual hierarchy** to show the level of importance of information

### Example: Breaking Up Complex Forms

People can get overwhelmed by large, complex problems. Breaking them down into smaller, simpler ones makes them easier to solve.

A large complex form with many fields → Multiple simple steps with fewer fields each, progress indicator showing "Step 2 of 4"

## Create a Design System

Having endless design possibilities sounds great in theory, but in practice, it can be frustrating and time consuming. When designing an interface, there are so many options to choose from regarding layout, spacing, typography, and colour, it can quickly get overwhelming.

That's why having a system of predefined options and guidelines to help you efficiently make design decisions is crucial. This is known as a design system.

### 3 Steps to Create a Design System

#### Step 1: Set Predefined Style Options

Rather than choosing from unlimited options for things like colour, typography, and spacing, create a small set of predefined options to choose from. Limiting your options in this way helps improve consistency and speeds up design decisions.

**Predefined options should cover:**
- Spacing scale
- Colour palette
- Typography scale
- Border radius
- Shadow/elevation levels
- Icon sizes

#### Step 2: Create Reusable Modules

Design a library of reusable UI components (modules) that include the predefined style options. For example: buttons, form fields, cards, navigation, modals.

**Benefits:**
- Faster design and development
- Consistency across product
- Easier maintenance
- Reduced cognitive load for users

#### Step 3: Define Usage Guidelines

Document when and how to use each style option and component. Guidelines ensure consistency as teams grow and products evolve.

**Example guidelines:**
- Indicate actions using the primary colour
- Use sentence case
- Left align buttons
- Left align text
- Try to avoid disabled buttons
- Front-load text
- Be concise and use plain and simple language

### Design System Components

**Colour Palette Example (HSB values):**
| Shade | HSB Values | Usage |
|-------|------------|-------|
| Darkest | 220, 90, 30 | Heading text |
| Dark | 220, 40, 57 | Secondary text |
| Medium | 220, 34, 72 | Dark borders |
| Light | 220, 10, 95 | Light borders |
| Lightest | 220, 2, 98 | Background |

**Spacing Scale:**
| Token | Size |
|-------|------|
| XS | 8pt |
| S | 16pt |
| M | 24pt |
| L | 32pt |
| XL | 48pt |
| XXL | 80pt |

**Type Scale:**
| Level | Size | Weight |
|-------|------|--------|
| Heading 1 | 40px | Bold |
| Heading 2 | 32px | Bold |
| Heading 3 | 24px | Bold |
| Heading 4 | 20px | Bold |
| Small | 18px | Regular |
| Tiny | 16px | Regular |

**Button Weights:**
| Weight | Style |
|--------|-------|
| Primary | Solid fill |
| Secondary | Border/outline |
| Tertiary | Text only |

**Form Controls:**
| Control | Usage |
|---------|-------|
| Input | Free text entry |
| Dropdown | Select from list |
| Radio buttons | Single choice from few options |
| Checkboxes | Multiple choices |

## Ensure an Interface is Accessible

Accessibility ensures that people with disabilities can use your interface. This includes people with visual, auditory, motor, and cognitive impairments.

### Assistive Technologies

**Screen Readers** - Read out the content of a website. Used by people with visual impairments or those who prefer to listen rather than read.
- Enable people to navigate websites using a keyboard
- Read out text, buttons, links, and other elements
- Describe images using alt text
- Navigate using headings, lists, and landmarks

**Screen Magnifiers** - Enlarge content for people with low vision.
- Users see only a portion of the screen at a time
- Important content should be left-aligned so it's visible
- Buttons and actions should be close to related content

### WCAG 2.1 Guidelines Summary

**Level A** (Minimum)
- Text alternatives for images
- Captions for audio
- Content can be accessed with keyboard
- No content that flashes more than 3 times per second

**Level AA** (Target this level)
- Colour contrast of at least 4.5:1 for normal text
- Colour contrast of at least 3:1 for large text and UI components
- Text can be resized up to 200%
- Multiple ways to navigate
- Focus indicators are visible
- Consistent navigation and identification

**Level AAA** (Enhanced)
- Colour contrast of at least 7:1 for normal text
- Sign language for audio
- Extended audio descriptions

### Key Accessibility Rules

1. **Don't rely on colour alone** - Use icons, patterns, or text in addition to colour
2. **Provide text alternatives** - Alt text for images, captions for videos
3. **Ensure keyboard navigation** - All functionality available via keyboard
4. **Maintain sufficient contrast** - 4.5:1 for small text, 3:1 for large text and UI
5. **Use clear, descriptive labels** - Buttons, links, and form fields should be clear
6. **Provide visible focus states** - Show which element is currently focused
7. **Don't time out unexpectedly** - Warn users before timing out

## Use Common Design Patterns

Design patterns are proven solutions to common design problems. They're familiar to users, so using them reduces cognitive load and improves usability.

**Benefits of using common patterns:**
- Users already know how they work
- Less time needed for usability testing
- Faster development
- Reduced errors

**Examples of common patterns:**
- Navigation menus at the top or left
- Logo links to homepage
- Search in the header
- Shopping cart icon in the corner
- Form labels above inputs
- Primary action button on the right (for wizards) or left (for forms)
- Modal dialogs for confirmations
- Tabs for switching between views

**When to deviate from patterns:**
- When usability testing shows the pattern doesn't work for your users
- When the pattern creates accessibility issues
- When you have strong evidence a new pattern is significantly better

Even then, test thoroughly before implementing.

## Use the 80/20 Rule to Prioritise

**The Pareto Principle (80/20 Rule):** Roughly 80% of results come from 20% of efforts.

In UI design, focus on the 20% of features and content that provide 80% of the value to users. This helps you:
- Prioritise what to design first
- Decide what to emphasise visually
- Know what to test most thoroughly
- Identify what to simplify or remove

**Application examples:**
- Focus on core user flows, not edge cases
- Emphasise primary actions over secondary ones
- Test main features before nice-to-haves
- Remove rarely-used features

## Keep Costs in Mind

If you're working on a commercial project, time isn't free. Every minute spent on user research, design, usability testing, development, and quality assurance costs money.

**Ways to improve efficiency:**
- Consider using an existing design system or UI kit to save time
- Outsource time-intensive tasks (e.g., use an existing icon set rather than creating your own)
- Stick with familiar UI patterns to save time and money on usability testing
- Learn how interfaces are built and coded to understand technical constraints
- Talk to developers early and often to achieve more from your design for less

The simple approach is usually cheaper to build and easier for customers to understand and use.

## Be Consistent

**Definition:** Consistency in UI design means that similar elements look and work in a similar way.

This should be true:
1. **Within your product** (internal consistency)
2. **Compared with other products** (external consistency)

This predictable functionality improves usability and reduces errors, as people don't need to keep learning how things work.

### Internal Consistency

To maintain visual and functional consistency within your product, create a design system to define guidelines for:
- Components
- Templates
- Visual styles
- Language

### External Consistency

Be consistent with other products people are familiar with. If your product sits on a certain platform (iOS, Android), follow platform guidelines unless they test poorly or result in accessibility issues.

**Follow well-established patterns:**
- Link text is underlined
- Form checkboxes are small squares with a tick icon
- Input fields are rectangles with a label on top
- Navigation is at the top or side
- Logo links to homepage
