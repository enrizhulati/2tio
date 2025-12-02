# Chapter 2: Less is More

## Remove Unnecessary Information

Every element you add to your interface competes with existing elements. This can make it harder for people to understand. Unnecessary information is a distraction that increases cognitive load, so try to ensure every interface element has a logical reason behind it.

### Quick Tips

1. **Remove repeated elements** to instantly simplify your interface without losing information
2. **Avoid unneeded words and introductory phrases** (covered in Copywriting chapter)
3. **Reveal less important information gradually** (progressive disclosure)

### Example: Repeated Course Names

**Before:**
```
Contents
UI Design Fundamentals Course - Chapter 1 - Colours
UI Design Fundamentals Course - Chapter 2 - Typography
UI Design Fundamentals Course - Chapter 3 - Layout
```

**After:**
```
UI Design Fundamentals Course

Contents
Chapter 1 - Colours
Chapter 2 - Typography
Chapter 3 - Layout
```

Making the course name a subheading removes the repetition and simplifies the design. It also helps people differentiate between the chapters.

## Remove Unnecessary Styles

Just like unnecessary information can be distracting and increase cognitive load, so can unnecessary styles. Avoid unnecessary lines, colours, backgrounds, and animations to create a simpler, more focused interface.

**Unnecessary styles are those that don't convey information—they're purely decorative.**

Not saying you shouldn't have any decorative styles (aesthetics are important), but try to ensure they don't hinder usability.

### Common Problems

1. **Decorative colours without purpose** - List items with different colours that lack meaning. This could be confusing to some who assume the colours have meaning
2. **Blue underlined headings that aren't links** - People will try to click them
3. **Decorative icons that look like buttons** - Could be confused for interactive elements
4. **Overly prominent icons** - All very prominent and competing for attention

### Style Trends Fade

It's tempting to use the latest popular visual style trends, but trends are always changing. The more trendy effects you use, the worse your interface will age over time. Sticking with minimal styles that highlight quality content is better for longevity.

### Problematic Style Trends

**Glassmorphism** - Frosted glass effect with blur
- Very difficult to create clear visual hierarchy
- Difficult to achieve sufficient contrast
- Background images can interfere with readability

**Neuomorphism** - Soft, extruded shapes with subtle shadows
- Very difficult to create clear visual hierarchy
- Insufficient contrast between elements
- Button states are hard to distinguish

**The advice:** Experiment with different visual styles, but make sure they don't hinder usability or exclude people from being able to use your interface.

## Not All Links Need to Be Underlined

For accessibility, consistency, and good usability, it's safest to make text links coloured and underlined. This conventional link treatment helps differentiate links from other text and clearly indicates interactivity.

**However:** Some UI elements already look and feel interactive, so you don't need to underline and colour the text:
- Navigation menus
- Cards
- Tabs
- Buttons

These have other cues to indicate they're interactive. Removing the conventional link treatment for these components can help simplify your interface.

### Example: Interactive Cards

Cards with image and text inside a raised box have sufficient visual cues to indicate the card is interactive. The combination of:
- Image
- Text
- Raised box/container
- Often a subtle hover state

...makes the interactivity clear without blue underlined text.

Feel free to keep the conventional link treatment for extra clarity if desired.

## Use Progressive Disclosure

**Definition:** Progressive disclosure is the act of revealing information gradually as needed.

Show people only what they need to know to complete the task at hand, rather than overwhelming them with all of the information upfront. For those who want more information, allow them to easily access it without overwhelming others.

**Trade-off:** Progressively disclosing information slightly increases interaction cost, but can significantly decrease cognitive load and speed up decision making.

### Example: Feature Benefits

**Before (all information visible):**
```
Strengthen your brand with a custom domain

Look professional and help your customers find you online by adding a custom domain.

Benefits of a custom domain
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper hendrerit turpis ac condimentum. Vivamus pretium iaculis lobortis. Pellentesque non blandit neque. Quisque nibh libero, sodales sit amet posuere at, elementum. Aliquam finibus turpis magna, lobortis tempus lectus fermentum at cras ac imperdiet turpis.

• Lorem ipsum dolor sit amet
• Donec semper hendrerit turpis ac
• Vivamus pretium iaculis lobortis

[Add domain]
```

**After (progressive disclosure):**
```
Strengthen your brand with a custom domain

Look professional and help your customers find you online by adding a custom domain.

▶ Benefits of a custom domain  [expandable accordion]

[Add domain]
```

### Label Best Practice

Don't use generic "Show more" text in accordion components. Instead, use a descriptive label to:
- Aid scanning
- Ensure the action makes sense when read out of context

### Example: Form Fields

Progressively disclose the mobile number field to those who need it:

**Before:** Mobile number field always visible (optional)

**After:** 
```
☐ Receive updates via text message
```
When checked, the mobile number field appears. This:
- Avoids the need for an optional field
- Simplifies the form for people who aren't interested

## Don't Confuse Minimalism with Simplicity

**Key insight:** Minimal doesn't mean simple.

We have a tendency to favour minimal interfaces as they can look beautiful and clean. A minimal interface has fewer elements and styles, but isn't necessarily simple to understand and use.

**Problem:** Minimal interfaces can often be vague or confusing as they lack crucial details needed for good usability.

**Simplification isn't just about reduction.** Removing or hiding too much can harm usability. You need to make sure that you're not removing critical information or details.

### Example: Photo Editor Interface

**Minimal (problematic):**
- Interface, photo filters, and bottom navigation aren't labelled
- Selected state of filters and navigation is very subtle
- Share and save actions are hidden
- Contrast of icons is insufficient

**Simple (clear):**
- All sections labelled (Exposure, Presets, Colour, Contrast)
- Clear selected states
- Visible action buttons (Edit, Share, Save)
- Filter names visible (Natural, Warm, Cool, Soft, Greyscale)

**Fixes:**
- Make sure important actions are clearly visible
- Label interface elements
- Use sufficient contrast
- Show clear selected states

## Design for the Smallest Screen First

Assuming your product will be used across a range of different screen sizes, **start designing on the smallest size first** (mobile-first).

**Why:**
- The restricted space forces you to prioritise important elements
- Forces you to remove unnecessary elements
- Results in simpler interfaces on larger screens too

**Problem with desktop-first:** If you start designing on a large screen first, there's a tendency to want to fill the screen with more information. You don't need to fill the screen—more information can increase cognitive load and slow down decision making.

**Analogy:** It's similar to living in a large home compared to a small one. We tend to fill large homes with lots of stuff we don't need. In a small one, we have no choice but to be more organised and focused on the essentials.

## Break Up Choices to Speed Up Decision Making

**Hick's Law:** The time it takes to make a decision increases with the number and complexity of choices.

Present fewer choices more simply to help people make decisions faster.

### 4 Ways to Break Up Choices

#### 1. Remove Choices

The most obvious way—actually remove unnecessary options.

Whether you're designing a form, navigation, or landing page, make sure every option earns its place. If it's not necessary, it's a potential distraction.

**Example: Newsletter Subscription**

Before:
```
First name *
Company name *
Email *
[Subscribe]
```

After:
```
Email
[Subscribe]
```

Benefits of removing fields:
- Much simpler form
- Faster and easier to complete
- Higher conversion (less work, less personal information required)

#### 2. Group or Categorise Choices

Reduce the number and complexity of choices by grouping or categorising them.

It's simpler and faster to decide between a small number of categories than to choose an option from a large list.

**Example: Blog Articles**

Before: All 185 articles in one list

After:
```
Articles
[All (185)] [Interiors] [Architecture] [Gardens]
```

Articles are categorised to break them up and make them easier to browse.

#### 3. Break Up Choices into Multiple Steps

Make large, complex tasks seem less overwhelming by breaking them into multiple smaller steps.

**Benefits:**
- Decreases cognitive load
- Allows people to focus on one small thing at a time

**Applications:**
- Long forms broken into multiple steps
- Large navigation menus broken into multiple levels

**Example: Multi-level Navigation**
```
Features ▼

Analytics                    Marketing
├─ Trend monitoring         ├─ Website builder
├─ Custom reports           ├─ Email marketing
├─ User segmentation        ├─ Discount codes
└─ Live dashboard           └─ Affiliate program
```

Navigation menu broken into multiple levels helps people find what they're looking for, one decision at a time.

#### 4. Recommend Choices

Make decisions easier by recommending popular or common choices.

If a lot of people prefer certain choices, there's a good chance others will too.

**Examples:**
- Video streaming websites recommend popular videos
- Search boxes suggest common search terms to help people narrow down their search faster

**Example: Search Suggestions**
```
[Int_____________]

Suggested searches:
• Interior design
• Interior decor
• Renovated interiors
```

Suggested search terms help people narrow down their search faster.
