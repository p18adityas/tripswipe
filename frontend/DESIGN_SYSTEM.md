# Travel Planning App - Design System

**Version:** 1.0.0  
**Last Updated:** April 4, 2026  
**App Name:** Premium Travel Planner

---

## 🎨 Color System

### Primary Colors

```css
/* Blue Gradient (Primary Brand) */
--color-blue-50: #eff6ff
--color-blue-100: #dbeafe
--color-blue-200: #bfdbfe
--color-blue-300: #93c5fd
--color-blue-400: #60a5fa
--color-blue-500: #3b82f6
--color-blue-600: #2563eb  /* Primary */
--color-blue-700: #1d4ed8
--color-blue-800: #1e40af
--color-blue-900: #1e3a8a

/* Purple Gradient (Secondary Brand) */
--color-purple-50: #faf5ff
--color-purple-100: #f3e8ff
--color-purple-200: #e9d5ff
--color-purple-300: #d8b4fe
--color-purple-400: #c084fc
--color-purple-500: #a855f7
--color-purple-600: #9333ea  /* Secondary */
--color-purple-700: #7e22ce
--color-purple-800: #6b21a8
--color-purple-900: #581c87
```

### Neutral Colors

```css
/* Slate (UI Base) */
--color-slate-50: #f8fafc   /* Background Light */
--color-slate-100: #f1f5f9  /* Background Alt */
--color-slate-200: #e2e8f0  /* Border */
--color-slate-300: #cbd5e1
--color-slate-400: #94a3b8  /* Icon Inactive */
--color-slate-500: #64748b  /* Text Secondary */
--color-slate-600: #475569  /* Text Primary */
--color-slate-700: #334155
--color-slate-800: #1e293b
--color-slate-900: #0f172a  /* Text Emphasis */

/* Pure Colors */
--color-white: #ffffff
--color-black: #000000
```

### Accent Colors

```css
/* Success */
--color-green-50: #f0fdf4
--color-green-500: #22c55e
--color-green-600: #16a34a
--color-green-700: #15803d

/* Warning */
--color-orange-50: #fff7ed
--color-orange-500: #f97316
--color-orange-600: #ea580c

/* Error/Like */
--color-red-50: #fef2f2
--color-red-500: #ef4444
--color-red-600: #dc2626

/* Info */
--color-teal-50: #f0fdfa
--color-teal-500: #14b8a6
--color-teal-600: #0d9488

/* Special */
--color-yellow-400: #facc15  /* Star/Super-like */
--color-pink-400: #f472b6
--color-pink-500: #ec4899
```

### Gradient Combinations

```css
/* Primary Gradient (Main CTA) */
background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);

/* Hero Gradient (Headers) */
background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);

/* Card Shimmer */
background: linear-gradient(90deg, 
  rgba(255,255,255,0) 0%, 
  rgba(255,255,255,0.8) 50%, 
  rgba(255,255,255,0) 100%
);

/* Overlay Gradient (Image Overlays) */
background: linear-gradient(180deg, 
  rgba(0,0,0,0) 0%, 
  rgba(0,0,0,0.4) 60%, 
  rgba(0,0,0,0.7) 100%
);

/* Auth/Profile Header */
background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);

/* Status Gradients */
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-info: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

### Color Usage Guidelines

| Use Case | Color | CSS Class | Hex |
|----------|-------|-----------|-----|
| Primary CTA | Blue 600 | `bg-blue-600` | #2563eb |
| Secondary CTA | Purple 600 | `bg-purple-600` | #9333ea |
| Text Primary | Slate 900 | `text-slate-900` | #0f172a |
| Text Secondary | Slate 600 | `text-slate-600` | #475569 |
| Text Muted | Slate 500 | `text-slate-500` | #64748b |
| Border Light | Slate 200 | `border-slate-200` | #e2e8f0 |
| Background | Slate 50 | `bg-slate-50` | #f8fafc |
| Card Background | White | `bg-white` | #ffffff |
| Like/Love Action | Red 500 | `text-red-500` | #ef4444 |
| Success State | Green 600 | `bg-green-600` | #16a34a |
| Disabled State | Slate 400 | `text-slate-400` | #94a3b8 |

---

## 📝 Typography

### Font Family

```css
/* Primary Font (System) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
             sans-serif;

/* Monospace (Code/Numbers) */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             Consolas, 'Courier New', monospace;
```

### Font Sizes

```css
/* Tailwind CSS Size Scale */
text-xs:   0.75rem   /* 12px */
text-sm:   0.875rem  /* 14px */
text-base: 1rem      /* 16px */
text-lg:   1.125rem  /* 18px */
text-xl:   1.25rem   /* 20px */
text-2xl:  1.5rem    /* 24px */
text-3xl:  1.875rem  /* 30px */
text-4xl:  2.25rem   /* 36px */
text-5xl:  3rem      /* 48px */
```

### Font Weights

```css
font-light:     300
font-normal:    400  /* Body text */
font-medium:    500  /* Emphasis */
font-semibold:  600  /* Headings */
font-bold:      700  /* Strong emphasis */
font-extrabold: 800
```

### Type Hierarchy

```css
/* Display (Hero Headlines) */
.text-display {
  font-size: 3rem;        /* 48px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* H1 (Page Title) */
.text-h1 {
  font-size: 2.25rem;     /* 36px */
  font-weight: 700;
  line-height: 1.3;
}

/* H2 (Section Title) */
.text-h2 {
  font-size: 1.875rem;    /* 30px */
  font-weight: 600;
  line-height: 1.3;
}

/* H3 (Card Title) */
.text-h3 {
  font-size: 1.5rem;      /* 24px */
  font-weight: 600;
  line-height: 1.4;
}

/* H4 (Subsection) */
.text-h4 {
  font-size: 1.25rem;     /* 20px */
  font-weight: 600;
  line-height: 1.4;
}

/* Body Large */
.text-body-lg {
  font-size: 1.125rem;    /* 18px */
  font-weight: 400;
  line-height: 1.6;
}

/* Body (Default) */
.text-body {
  font-size: 1rem;        /* 16px */
  font-weight: 400;
  line-height: 1.6;
}

/* Body Small */
.text-body-sm {
  font-size: 0.875rem;    /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

/* Caption */
.text-caption {
  font-size: 0.75rem;     /* 12px */
  font-weight: 400;
  line-height: 1.4;
  color: #64748b;
}

/* Label */
.text-label {
  font-size: 0.875rem;    /* 14px */
  font-weight: 500;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## 🎭 Icons

### Icon Library
**Primary:** Lucide React (`lucide-react`)

### Icon Sizes

```css
/* Icon Size Scale */
w-3 h-3:  12px   /* Inline with text-xs */
w-4 h-4:  16px   /* Inline with text-sm/base */
w-5 h-5:  20px   /* Button icons, nav icons */
w-6 h-6:  24px   /* Tab icons, feature icons */
w-8 h-8:  32px   /* Large feature icons */
w-10 h-10: 40px  /* Hero icons */
w-12 h-12: 48px  /* Large hero icons */
w-16 h-16: 64px  /* Extra large */
```

### Common Icons & Usage

| Icon | Component | Usage | Size |
|------|-----------|-------|------|
| `Home` | Navigation | Home tab | 24px |
| `Map` | Navigation | Trips tab | 24px |
| `User` | Navigation | Profile tab | 24px |
| `Heart` | Actions | Like/Save | 20-24px |
| `X` | Actions | Discard/Close | 20px |
| `Star` | Actions | Super like | 20px |
| `ArrowLeft` | Navigation | Back button | 20px |
| `ChevronRight` | Navigation | Forward/Details | 16px |
| `ChevronDown` | UI | Dropdown | 16px |
| `Calendar` | Features | Date picker | 20px |
| `Clock` | Features | Duration | 16px |
| `MapPin` | Features | Location | 16-20px |
| `Users` | Features | Group size | 20px |
| `Settings` | Features | Settings | 20px |
| `Share2` | Actions | Share | 20px |
| `Download` | Actions | Download | 20px |
| `Edit2` | Actions | Edit | 16px |
| `Trash2` | Actions | Delete | 16px |
| `Plus` | Actions | Add | 20px |
| `Search` | Features | Search | 20px |
| `Filter` / `SlidersHorizontal` | Features | Filters | 16px |
| `Check` | Status | Success | 20px |
| `AlertCircle` | Status | Warning | 20px |
| `Info` | Status | Information | 20px |
| `Bell` | Features | Notifications | 20px |
| `LogOut` | Actions | Sign out | 20px |
| `Mail` | Forms | Email | 20px |
| `Phone` | Forms | Phone | 20px |
| `Globe` | Features | Country | 20px |
| `Shield` | Features | Security | 20px |
| `FileText` | Features | Documents | 20px |
| `Lock` | Features | Privacy | 20px |
| `HelpCircle` | Features | Help | 20px |

### Icon Stroke Weights

```tsx
// Default state
<Icon className="w-6 h-6" strokeWidth={2} />

// Active/Selected state
<Icon className="w-6 h-6" strokeWidth={2.5} />

// Emphasis
<Icon className="w-6 h-6" strokeWidth={3} />
```

---

## 🧩 Component Library

### Buttons

#### Primary Button
```tsx
<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
  Label
</Button>
```

**States:**
- Default: `bg-gradient-to-r from-blue-600 to-purple-600`
- Hover: `from-blue-700 to-purple-700`
- Active: Scale 0.98
- Disabled: `opacity-50 cursor-not-allowed`

#### Secondary Button
```tsx
<Button variant="outline" className="border-slate-200 hover:bg-slate-50">
  Label
</Button>
```

#### Ghost Button
```tsx
<Button variant="ghost" className="hover:bg-slate-100">
  Label
</Button>
```

#### Icon Button
```tsx
<Button variant="ghost" size="icon" className="w-10 h-10">
  <Icon className="w-5 h-5" />
</Button>
```

#### Button Sizes
- `size="sm"`: `h-9 px-3 text-sm`
- `size="default"`: `h-10 px-4 text-base`
- `size="lg"`: `h-12 px-6 text-lg`
- `size="icon"`: `h-10 w-10` (square)

### Cards

#### Standard Card
```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

#### Image Card (Place Card)
```tsx
<div className="bg-white rounded-3xl shadow-xl overflow-hidden">
  <div className="relative h-[500px]">
    <img className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

#### Stats Card
```tsx
<div className="bg-white rounded-2xl shadow-lg p-4">
  <div className="text-2xl font-bold text-slate-900">42</div>
  <div className="text-xs text-slate-600">Label</div>
</div>
```

#### Info Card (With Icon)
```tsx
<div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
    <Icon className="w-5 h-5 text-blue-600" />
  </div>
  <div className="flex-1">
    <div className="font-medium text-sm">Title</div>
    <div className="text-xs text-slate-600">Description</div>
  </div>
  <ChevronRight className="w-5 h-5 text-slate-400" />
</div>
```

### Inputs

#### Text Input
```tsx
<Input 
  type="text"
  placeholder="Placeholder"
  className="h-12 px-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
/>
```

#### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
  <Input 
    type="search"
    placeholder="Search..."
    className="pl-11 h-12 border-slate-200 rounded-xl"
  />
</div>
```

#### Select/Dropdown
```tsx
<Select>
  <SelectTrigger className="h-12 border-slate-200 rounded-xl">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### Navigation

#### Bottom Navigation
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
  <div className="flex items-center justify-around h-16">
    <button className="flex flex-col items-center gap-1">
      <Icon className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
      <span className="text-xs font-medium text-blue-600">Label</span>
    </button>
  </div>
</div>
```

**Active State:**
- Icon: `text-blue-600` with `strokeWidth={2.5}`
- Label: `text-blue-600`
- Indicator dot: 4px blue dot below icon

**Inactive State:**
- Icon: `text-slate-400` with `strokeWidth={2}`
- Label: `text-slate-500`

#### Top Header
```tsx
<div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
  <div className="px-4 py-4 flex items-center justify-between">
    <button className="text-slate-600 hover:text-slate-900">
      <ArrowLeft className="w-5 h-5" />
    </button>
    <h1 className="font-semibold">Title</h1>
    <button>Action</button>
  </div>
</div>
```

### Badges & Tags

#### Badge
```tsx
<span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
  Label
</span>
```

**Variants:**
- Info: `bg-blue-100 text-blue-700`
- Success: `bg-green-100 text-green-700`
- Warning: `bg-orange-100 text-orange-700`
- Error: `bg-red-100 text-red-700`
- Neutral: `bg-slate-100 text-slate-700`

#### Tag (Dismissible)
```tsx
<div className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full">
  <span className="text-sm">Tag</span>
  <button><X className="w-3 h-3" /></button>
</div>
```

### Modals & Sheets

#### Bottom Sheet (Mobile)
```tsx
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom" className="max-h-[90vh] rounded-t-3xl">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

**Styling:**
- Border radius: `rounded-t-3xl` (24px top corners)
- Max height: `max-h-[90vh]`
- Handle: Optional drag handle at top

#### Dialog (Desktop)
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent className="max-w-md rounded-2xl">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Status & Feedback

#### Toast Notifications
```tsx
// Success
toast.success('Message');

// Error
toast.error('Message');

// Info
toast.info('Message');

// Custom with icon
toast('Message', { icon: '❤️' });
```

**Duration:** 3 seconds default  
**Position:** Bottom center (mobile), top right (desktop)

#### Progress Indicator
```tsx
<div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
    style={{ width: '60%' }}
  />
</div>
```

#### Loading Spinner
```tsx
<div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
```

#### Empty State
```tsx
<div className="flex flex-col items-center justify-center text-center py-12">
  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
    <Icon className="w-10 h-10 text-slate-400" />
  </div>
  <h3 className="text-xl font-semibold mb-2">No Items</h3>
  <p className="text-slate-600 mb-6">Description of empty state</p>
  <Button>Action</Button>
</div>
```

### Lists

#### Simple List
```tsx
<div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
  <div className="px-4 py-4 hover:bg-slate-50 transition-colors">
    Item 1
  </div>
  <div className="px-4 py-4 hover:bg-slate-50 transition-colors">
    Item 2
  </div>
</div>
```

#### List with Icons
```tsx
<div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
  <button className="w-full px-4 py-4 flex items-center gap-3 hover:bg-slate-50">
    <Icon className="w-5 h-5 text-slate-600" />
    <span className="flex-1 text-left font-medium">Label</span>
    <ChevronRight className="w-5 h-5 text-slate-400" />
  </button>
</div>
```

---

## 📏 Spacing & Layout

### Spacing Scale (Tailwind)

```css
0:    0px
px:   1px
0.5:  0.125rem   /* 2px */
1:    0.25rem    /* 4px */
1.5:  0.375rem   /* 6px */
2:    0.5rem     /* 8px */
3:    0.75rem    /* 12px */
4:    1rem       /* 16px */
5:    1.25rem    /* 20px */
6:    1.5rem     /* 24px */
8:    2rem       /* 32px */
10:   2.5rem     /* 40px */
12:   3rem       /* 48px */
16:   4rem       /* 64px */
20:   5rem       /* 80px */
24:   6rem       /* 96px */
```

### Common Spacing Patterns

```css
/* Container Padding */
.px-4:  1rem (16px)    /* Mobile default */
.px-6:  1.5rem (24px)  /* Desktop default */

/* Section Spacing */
.mb-6:  1.5rem (24px)  /* Between sections */
.mb-8:  2rem (32px)    /* Between major sections */
.mb-12: 3rem (48px)    /* Between page sections */

/* Component Padding */
.p-4:   1rem (16px)    /* Small cards */
.p-6:   1.5rem (24px)  /* Default cards */
.p-8:   2rem (32px)    /* Large cards */

/* Element Gaps */
.gap-2:  0.5rem (8px)   /* Tight elements */
.gap-3:  0.75rem (12px) /* Default gap */
.gap-4:  1rem (16px)    /* Comfortable gap */
.gap-6:  1.5rem (24px)  /* Large gap */
```

### Border Radius

```css
rounded-none:   0px
rounded-sm:     0.125rem  /* 2px */
rounded:        0.25rem   /* 4px */
rounded-md:     0.375rem  /* 6px */
rounded-lg:     0.5rem    /* 8px */
rounded-xl:     0.75rem   /* 12px */
rounded-2xl:    1rem      /* 16px */
rounded-3xl:    1.5rem    /* 24px */
rounded-full:   9999px
```

**Usage:**
- Buttons: `rounded-lg` (8px) or `rounded-xl` (12px)
- Cards: `rounded-2xl` (16px)
- Place Cards: `rounded-3xl` (24px)
- Bottom Sheets: `rounded-t-3xl` (24px top)
- Pills/Badges: `rounded-full`
- Avatar: `rounded-full`

### Shadows

```css
/* Tailwind Shadow Scale */
shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Usage:**
- Cards: `shadow-sm` (default), `shadow-md` (hover)
- Place Cards: `shadow-xl`
- Floating elements: `shadow-lg`
- Modal/Sheet: `shadow-2xl`

### Z-Index Scale

```css
z-0:    0     /* Base layer */
z-10:   10    /* Card stack depth */
z-20:   20    /* Sticky header, floating UI */
z-30:   30    /* Dropdown, popover */
z-40:   40    /* Modal overlay */
z-50:   50    /* Modal content, bottom nav */
```

---

## 🎬 Motion & Animation

### Animation Library
**Primary:** Motion (formerly Framer Motion) - `motion/react`

### Timing Functions

```css
/* Easing */
ease-linear:     cubic-bezier(0.0, 0.0, 1.0, 1.0)
ease-in:         cubic-bezier(0.4, 0.0, 1.0, 1.0)
ease-out:        cubic-bezier(0.0, 0.0, 0.2, 1.0)
ease-in-out:     cubic-bezier(0.4, 0.0, 0.2, 1.0)

/* Spring (Motion) */
type: "spring"
stiffness: 300
damping: 30
```

### Transition Durations

```css
duration-75:   75ms    /* Instant feedback */
duration-100:  100ms   /* Quick transition */
duration-150:  150ms   /* Default transition */
duration-200:  200ms   /* Comfortable */
duration-300:  300ms   /* Smooth */
duration-500:  500ms   /* Deliberate */
```

### Common Animations

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Scale (Tap)
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  Button
</motion.button>
```

#### Card Swipe
```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.7}
  onDragEnd={(e, { offset, velocity }) => {
    // Handle swipe
  }}
>
  Card
</motion.div>
```

#### Stagger Children
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

#### Layout Animation (Tab Indicator)
```tsx
<motion.div
  className="absolute bottom-0 bg-blue-600"
  layoutId="activeIndicator"
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### Loading States

#### Pulse (Card Loading)
```tsx
<div className="animate-pulse">
  <div className="h-40 bg-slate-200 rounded-2xl mb-4"></div>
  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
</div>
```

#### Spin (Loader)
```tsx
<div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full" />
```

#### Bounce (Success)
```tsx
<div className="animate-bounce">🎉</div>
```

---

## 🖼️ Images & Media

### Image Handling

#### Aspect Ratios
- Hero Images: `16:9` or `21:9`
- Place Cards: `2:3` (portrait) or `4:5`
- Thumbnails: `1:1` (square)
- City Cards: `16:9` or `4:3`

#### Object Fit
```css
object-cover:    /* Default - fill container */
object-contain:  /* Show full image */
object-top:      /* Top-aligned */
object-center:   /* Center-aligned */
```

#### Image Overlays
```css
/* Gradient Overlay (Bottom) */
.image-overlay-bottom {
  background: linear-gradient(
    180deg, 
    rgba(0,0,0,0) 0%, 
    rgba(0,0,0,0.4) 60%, 
    rgba(0,0,0,0.7) 100%
  );
}

/* Gradient Overlay (Top) */
.image-overlay-top {
  background: linear-gradient(
    180deg, 
    rgba(0,0,0,0.5) 0%, 
    rgba(0,0,0,0) 40%
  );
}

/* Dark Overlay */
.image-overlay-dark {
  background: rgba(0, 0, 0, 0.4);
}
```

#### Image Component Usage
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback 
  src={imageUrl}
  alt="Description"
  className="w-full h-full object-cover"
/>
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

```css
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Small laptops */
xl:   1280px  /* Laptops */
2xl:  1536px  /* Desktops */
```

### Mobile-First Approach

```tsx
// Base styles are mobile (320px+)
<div className="px-4 sm:px-6 lg:px-8">
  {/* 16px mobile, 24px tablet, 32px desktop */}
</div>

<div className="text-2xl md:text-3xl lg:text-4xl">
  {/* Responsive text */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

### Container Max Width

```css
.max-w-md:   448px   /* Forms, modals */
.max-w-2xl:  672px   /* App container */
.max-w-4xl:  896px   /* Wide content */
.max-w-6xl:  1152px  /* Full width */
```

**Usage:**
```tsx
<div className="max-w-2xl mx-auto px-4">
  {/* Centered container with horizontal padding */}
</div>
```

### Safe Area (Mobile)

```css
/* Bottom spacing for iOS safe area */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Bottom nav with safe area */
<div className="fixed bottom-0 pb-safe">
  {/* Content */}
</div>
```

---

## 🎯 Interaction Patterns

### Swipe Gestures (Place Cards)

**Left Swipe (Discard):**
- Threshold: 150px or velocity > 500
- Visual: Card rotates and fades left
- Feedback: Toast "Skipped" with 👎

**Right Swipe (Like):**
- Threshold: 150px or velocity > 500
- Visual: Card rotates and fades right
- Feedback: Toast "Liked!" with ❤️

**Up Swipe (Super Like):**
- Threshold: 100px upward
- Visual: Card scales and fades up
- Feedback: Toast "Super Liked!" with ⭐

### Button States

**Default → Hover → Active → Focus**

```tsx
<button className="
  bg-blue-600 
  hover:bg-blue-700 
  active:scale-98 
  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  transition-all duration-150
">
  Button
</button>
```

### Touch Targets

**Minimum Size:** 44x44px (iOS HIG) or 48x48px (Material Design)

```css
/* Icon buttons */
.min-w-10 .min-h-10   /* 40px - acceptable for non-primary */
.min-w-11 .min-h-11   /* 44px - recommended */
.min-w-12 .min-h-12   /* 48px - comfortable */
```

### Loading States

**Button Loading:**
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

---

## 📋 Form Patterns

### Input States

```tsx
// Default
<Input className="border-slate-200 focus:ring-2 focus:ring-blue-500" />

// Error
<Input className="border-red-300 focus:ring-2 focus:ring-red-500" />

// Success
<Input className="border-green-300 focus:ring-2 focus:ring-green-500" />

// Disabled
<Input disabled className="bg-slate-100 cursor-not-allowed opacity-60" />
```

### Form Layout

```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      Label
    </label>
    <Input />
    <p className="text-xs text-slate-500 mt-1">Helper text</p>
  </div>
  
  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

### Validation Messages

```tsx
// Error
<p className="text-sm text-red-600 flex items-center gap-1 mt-1">
  <AlertCircle className="w-4 h-4" />
  Error message
</p>

// Success
<p className="text-sm text-green-600 flex items-center gap-1 mt-1">
  <Check className="w-4 h-4" />
  Success message
</p>
```

---

## 🎨 Special Components

### Confetti Effect

```tsx
import confetti from 'canvas-confetti';

// Success celebration
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

// Continuous confetti
const duration = 3000;
const end = Date.now() + duration;

const frame = () => {
  confetti({
    particleCount: 2,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#2563eb', '#9333ea', '#ec4899']
  });
  
  confetti({
    particleCount: 2,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#2563eb', '#9333ea', '#ec4899']
  });

  if (Date.now() < end) {
    requestAnimationFrame(frame);
  }
};

frame();
```

### Bottom Sheet Handle

```tsx
<div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
```

### Floating Action Button (FAB)

```tsx
<button className="
  fixed bottom-24 right-6 
  w-14 h-14 
  bg-gradient-to-r from-blue-600 to-purple-600 
  rounded-full 
  shadow-lg hover:shadow-xl 
  flex items-center justify-center
  text-white
  transition-all duration-200
  active:scale-95
">
  <Plus className="w-6 h-6" />
</button>
```

### Avatar

```tsx
// With Image
<div className="w-12 h-12 rounded-full overflow-hidden">
  <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
</div>

// Initials
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
  JD
</div>

// Sizes
.w-8 .h-8    /* Small - 32px */
.w-12 .h-12  /* Medium - 48px */
.w-16 .h-16  /* Large - 64px */
.w-24 .h-24  /* XL - 96px */
```

### Skeleton Loader

```tsx
<div className="animate-pulse space-y-4">
  {/* Image skeleton */}
  <div className="h-48 bg-slate-200 rounded-2xl" />
  
  {/* Text skeletons */}
  <div className="h-4 bg-slate-200 rounded w-3/4" />
  <div className="h-4 bg-slate-200 rounded w-1/2" />
  
  {/* Button skeleton */}
  <div className="h-10 bg-slate-200 rounded-lg w-full" />
</div>
```

---

## 🌐 Accessibility

### Focus States

```css
/* Default focus ring */
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

/* Subtle focus for complex components */
focus:outline-none focus:ring-2 focus:ring-blue-500/50

/* Remove outline (use with caution) */
focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
```

### Screen Reader Text

```tsx
<span className="sr-only">Text for screen readers</span>
```

### ARIA Labels

```tsx
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>

<input 
  type="text" 
  aria-describedby="email-helper"
  aria-invalid={hasError}
/>
<p id="email-helper">Helper text</p>
```

### Keyboard Navigation

- Tab order should be logical
- All interactive elements should be keyboard accessible
- Escape should close modals/sheets
- Enter should submit forms
- Arrow keys for navigation where appropriate

---

## 📖 Usage Guidelines

### DO's ✅

1. **Consistency**
   - Use the defined color palette
   - Maintain consistent spacing
   - Follow component patterns
   - Use standard icon sizes

2. **Mobile-First**
   - Design for mobile screens first
   - Scale up for larger screens
   - Test touch targets (min 44x44px)
   - Consider thumb zones

3. **Performance**
   - Optimize images (WebP, lazy loading)
   - Use Motion for complex animations
   - Minimize re-renders
   - Lazy load off-screen content

4. **Accessibility**
   - Include ARIA labels
   - Ensure keyboard navigation
   - Maintain color contrast (WCAG AA)
   - Provide focus indicators

### DON'Ts ❌

1. **Avoid**
   - Creating new color variations
   - Inconsistent spacing
   - Hard-coded values (use Tailwind classes)
   - Missing loading/error states

2. **Don't**
   - Use more than 2 font weights per component
   - Animate too many properties at once
   - Remove focus indicators without alternatives
   - Ignore empty states

3. **Never**
   - Use text smaller than 12px
   - Create touch targets smaller than 40px
   - Use pure black (#000) on pure white (#fff)
   - Stack more than 3 levels of cards

---

## 🔧 Implementation Examples

### Complete Screen Structure

```tsx
export function ExampleScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Screen Title</h1>
          <button>Action</button>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Section */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Section Title
          </h2>
          
          {/* Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              Content
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
```

### Card with Action

```tsx
<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
  <div className="relative h-48">
    <ImageWithFallback 
      src={image} 
      alt="Title"
      className="w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
    <div className="absolute bottom-4 left-4 right-4 text-white">
      <h3 className="font-semibold text-lg mb-1">Title</h3>
      <p className="text-sm text-white/90">Subtitle</p>
    </div>
  </div>
  
  <div className="p-4">
    <p className="text-slate-600 text-sm mb-4">Description</p>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="w-4 h-4" />
        Location
      </div>
      <Button size="sm">View</Button>
    </div>
  </div>
</div>
```

---

## 📦 Dependencies

### Core Libraries

```json
{
  "react": "^19.0.0",
  "react-router": "^7.1.1",
  "motion": "^11.16.4",
  "zustand": "^5.0.3",
  "lucide-react": "^0.468.0",
  "sonner": "^1.7.3",
  "canvas-confetti": "^1.9.3"
}
```

### UI Components (Radix UI)

```json
{
  "@radix-ui/react-dialog": "latest",
  "@radix-ui/react-select": "latest",
  "@radix-ui/react-checkbox": "latest",
  "@radix-ui/react-radio-group": "latest"
}
```

### Styling

```json
{
  "tailwindcss": "^4.0.0",
  "autoprefixer": "latest"
}
```

---

## 🎯 Design Principles

1. **Mobile-First, Travel-Focused**
   - Optimize for one-handed use
   - Large, tappable targets
   - Image-led experiences
   - Quick, gestural interactions

2. **Premium & Polished**
   - Smooth animations
   - Attention to detail
   - Consistent visual hierarchy
   - Professional imagery

3. **Clear & Confident**
   - Obvious CTAs
   - Clear navigation
   - Helpful feedback
   - Guided experiences

4. **Performant & Responsive**
   - Fast load times
   - Smooth scrolling
   - Optimized images
   - Responsive layouts

---

## 📝 Notes

- All spacing and sizing follows the Tailwind CSS default scale
- Color palette is based on Tailwind CSS v3+ colors
- Icons use Lucide React library (no custom icon system)
- Animations prefer spring physics over duration-based timing
- Component library built with Radix UI primitives
- CSS is written using Tailwind utility classes
- Design system version: 1.0.0

---

**Last Updated:** April 4, 2026  
**Maintained By:** Development Team  
**Questions?** Refer to this document or ask the team lead.
