# Mainalyze UI Design System

## 🎨 Overview
This document outlines the comprehensive UI overhaul for Mainalyze, implementing a modern, professional design system with enhanced user experience.

## 📝 Typography

### Primary Font Family
- **Font**: Roboto (Google Fonts)
- **Weights Used**: 
  - 300 (Light)
  - 400 (Regular)
  - 500 (Medium)
  - 700 (Bold)
  - 900 (Black)

### Monospace Font
- **Font**: Roboto Mono
- **Weights Used**: 400, 500, 700

### Font Applications
- **Headings**: Font-black (900) for major headings
- **Subheadings**: Font-bold (700)
- **Body Text**: Font-medium (500) and Font-regular (400)
- **Labels**: Font-black (900) for form labels

## 🎨 Color Palette

### Primary Colors
```css
--primary: #6366f1 (Indigo 500)
--primary-dark: #4f46e5 (Indigo 600)
--secondary: #8b5cf6 (Purple 500)
--accent: #ec4899 (Pink 500)
```

### Status Colors
```css
--success: #10b981 (Emerald 500)
--warning: #f59e0b (Amber 500)
--error: #ef4444 (Red 500)
```

### Gradient Combinations

#### Primary Gradient (Indigo → Purple → Pink)
- Used for: Main branding, CTAs, auth pages
- `from-indigo-600 via-purple-600 to-pink-600`

#### Success Gradient (Emerald → Teal → Cyan)
- Used for: Signup page, success states, Prelims section
- `from-emerald-600 via-teal-600 to-cyan-600`

#### Background Gradients
- Dashboard: `from-slate-50 via-blue-50 to-indigo-50`
- Auth pages: Animated gradient backgrounds with floating orbs

## 🎯 Design Principles

### 1. **Depth & Elevation**
- Multiple shadow levels (sm, md, lg, xl, 2xl)
- Glass morphism effects with backdrop blur
- Layered borders (2px borders for emphasis)

### 2. **Motion & Animation**
- Smooth transitions (200ms cubic-bezier)
- Hover scale effects (scale-105, scale-110)
- Floating animations for decorative elements
- Pulse glow effects for important elements
- Fade-in, slide-in, and scale-up animations

### 3. **Spacing & Layout**
- Generous padding (p-8, p-10, p-12 for cards)
- Consistent border radius (rounded-2xl, rounded-3xl)
- Proper whitespace for readability

### 4. **Interactive Elements**
- Clear hover states with color transitions
- Active states with scale feedback
- Disabled states with reduced opacity
- Focus-visible outlines for accessibility

## 🧩 Component Patterns

### Navigation Bar
- **Height**: 80px (h-20)
- **Background**: White with 90% opacity + backdrop blur
- **Border**: 2px bottom border in indigo-100
- **Logo**: 48px (w-12 h-12) with gradient background
- **Links**: Bold font, emoji prefixes, rounded hover states
- **User Avatar**: Gradient background with initials

### Cards
- **Border Radius**: 24-32px (rounded-3xl)
- **Border**: 1-2px solid with light colors
- **Shadow**: Soft shadows with hover elevation
- **Background**: White with optional gradient overlays
- **Padding**: 32-48px (p-8 to p-12)

### Buttons

#### Primary Button
- Gradient background (indigo → purple → pink)
- Bold/Black font weight
- Large padding (py-5 px-6)
- Rounded-2xl
- Hover scale (1.03)
- Shadow elevation on hover

#### Secondary Button
- White background with 2px border
- Bold font
- Hover background color change
- Rounded-2xl

### Form Inputs
- **Border**: 2px solid gray-300
- **Padding**: py-4 (16px vertical)
- **Icons**: 24px (h-6 w-6) in input-left position
- **Focus**: 4px ring with color/30 opacity
- **Border Radius**: rounded-2xl
- **Font**: Medium weight

### Status Badges
- Rounded-lg
- Bold font
- Gradient backgrounds based on status
- Small padding (px-3 py-1.5)
- Shadow-sm for depth

## 🎭 Animations

### Keyframe Animations

#### gradient-shift
```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```
**Duration**: 15s
**Timing**: ease infinite

#### float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
```
**Duration**: 4s
**Timing**: ease-in-out infinite

#### pulse-glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.1); }
  50% { box-shadow: 0 0 30px rgba(99,102,241,0.5), 0 0 60px rgba(99,102,241,0.2); }
}
```
**Duration**: 2.5s
**Timing**: ease-in-out infinite

#### fadeIn, slideInRight, scaleUp
- Used for page transitions and component mounting
- Duration: 0.3-0.5s
- Timing: ease-out

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Stacked navigation menu (slide-in animation)
- Full-width cards
- Adjusted padding (p-4 to p-6)
- Larger touch targets
- Simplified gradients

## ♿ Accessibility

### Focus States
- 3px solid outline with color/50 opacity
- 2px offset
- Visible on all interactive elements

### Color Contrast
- All text meets WCAG AA standards
- Enhanced contrast for important information
- Clear visual hierarchy

### Selection Styling
- Custom selection color (indigo-600)
- White text on selection

## 🎨 Custom Scrollbar

### Track
- Background: #f8fafc (slate-50)
- Rounded corners

### Thumb
- Gradient: indigo-600 → purple-600
- 2px border matching track
- Rounded corners
- Darker on hover

## 🌟 Special Effects

### Glass Morphism
```css
background: white/95
backdrop-blur: 2xl
border: 2px white/30
```

### Glow Effect
- Applied to important CTAs and icons
- Animated pulse shadow
- Indigo color scheme

### Floating Orbs
- Large blurred circles (w-96+ h-96+)
- White with 10% opacity
- Blur-3xl
- Staggered float animations

## 📋 Page-Specific Designs

### Login/Signup Pages
- Full-screen animated gradient background
- Floating orbs for depth
- Large glass morphism card
- 96px icon containers
- 5xl heading (font-black)
- Emoji decorations

### Dashboard
- Gradient background (slate → blue → indigo)
- Large stat cards with hover effects
- Icon badges (48px w-12 h-12)
- Recent activity list with status indicators
- Prominent CTAs with gradient backgrounds

### Mains/Prelims Pages
- Consistent card-based layout
- Gradient headers matching section theme
- Multi-step forms with clear visual feedback
- Progress indicators
- Result displays with celebration effects

## 🎯 Best Practices

1. **Consistency**: Use defined color gradients and spacing
2. **Feedback**: All interactions provide visual feedback
3. **Performance**: Animations use transform and opacity
4. **Accessibility**: All interactive elements are keyboard navigable
5. **Readability**: Proper contrast and font sizes
6. **Modern**: Utilizes latest CSS features and design trends

## 🚀 Implementation Notes

- All pages use Roboto font family
- Consistent use of emoji for visual interest
- Gradient backgrounds for depth and brand identity
- Bold, confident typography with heavy weights
- Generous use of whitespace
- Smooth transitions everywhere
- Glass morphism for premium feel
- Shadow elevation for depth perception

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Designer**: FirebringerLabs
