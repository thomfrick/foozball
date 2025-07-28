# Foosball Tracker UI Design System

## Overview

This document defines the modern, professional UI design system for the Foosball ELO Tracker application. The design emphasizes clean aesthetics, intuitive navigation, and responsive layouts that work seamlessly across all devices.

## Visual Style

### Design Philosophy
- **Clean & Minimalist**: Embrace white space and remove visual clutter
- **Professional**: Business-appropriate styling suitable for office environments
- **Modern**: Contemporary design patterns with subtle animations
- **Accessible**: WCAG 2.1 AA compliant with excellent contrast ratios

### Color Scheme

#### Primary Colors
- **Primary Blue**: `#2563eb` (blue-600) - Main brand color, navigation
- **Primary Purple**: `#7c3aed` (purple-600) - Accent color, CTAs
- **Success Green**: `#059669` (emerald-600) - Positive actions, wins
- **Warning Amber**: `#d97706` (amber-600) - Cautions, attention items

#### Secondary Colors
- **Light Blue**: `#dbeafe` (blue-100) - Subtle backgrounds
- **Light Purple**: `#ede9fe` (purple-100) - Accent backgrounds
- **Light Green**: `#d1fae5` (emerald-100) - Success backgrounds
- **Light Amber**: `#fef3c7` (amber-100) - Warning backgrounds

#### Neutral Colors
- **White**: `#ffffff` - Primary background
- **Gray 50**: `#f9fafb` - Light backgrounds
- **Gray 100**: `#f3f4f6` - Subtle borders
- **Gray 200**: `#e5e7eb` - Dividers
- **Gray 400**: `#9ca3af` - Placeholder text
- **Gray 600**: `#4b5563` - Secondary text
- **Gray 800**: `#1f2937` - Primary text
- **Gray 900**: `#111827` - High contrast text

#### Dark Mode Colors
- **Dark Background**: `#0f172a` (slate-900) - Primary dark background
- **Dark Surface**: `#1e293b` (slate-800) - Cards and panels
- **Dark Border**: `#334155` (slate-700) - Borders and dividers
- **Dark Text**: `#f1f5f9` (slate-100) - Primary dark text

### Typography

#### Font Stack
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
             sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
             "Segoe UI Symbol", "Noto Color Emoji"
```

#### Type Scale
- **Heading 1**: `text-4xl md:text-6xl` (36-60px) - Page titles
- **Heading 2**: `text-2xl md:text-3xl` (24-30px) - Section headers
- **Heading 3**: `text-xl` (20px) - Subsection headers
- **Body Large**: `text-lg` (18px) - Emphasis text
- **Body**: `text-base` (16px) - Default body text
- **Body Small**: `text-sm` (14px) - Secondary text
- **Caption**: `text-xs` (12px) - Labels and captions

#### Font Weights
- **Bold**: `font-bold` (700) - Headings, emphasis
- **Semibold**: `font-semibold` (600) - Subheadings
- **Medium**: `font-medium` (500) - Navigation, buttons
- **Regular**: `font-normal` (400) - Body text

## Layout and Structure

### Grid System
- **Container**: `max-w-7xl mx-auto` - Maximum width with auto margins
- **Padding**: `px-4 sm:px-6 lg:px-8` - Responsive horizontal padding
- **Grid**: CSS Grid and Flexbox for responsive layouts
- **Breakpoints**:
  - Mobile: `< 640px`
  - Tablet: `640px - 1024px`
  - Desktop: `> 1024px`

### Navigation Structure

#### Header Navigation
- **Brand Logo**: Left-aligned with ping pong emoji and text
- **Main Navigation**: Center-aligned horizontal menu (desktop)
- **Theme Toggle**: Right-aligned dark/light mode switcher
- **Mobile Menu**: Hamburger menu for mobile devices

#### Navigation States
- **Active**: White background with brand color text
- **Hover**: Lighter brand color background
- **Focus**: Visible focus ring for accessibility

### Content Areas

#### Page Layout
```
┌─────────────────────────────────┐
│           Header Nav            │
├─────────────────────────────────┤
│                                 │
│         Main Content            │
│     (responsive grid)           │
│                                 │
├─────────────────────────────────┤
│           Footer                │
└─────────────────────────────────┘
```

#### Card Components
- **Background**: White with subtle shadow
- **Border Radius**: `rounded-lg` (8px)
- **Padding**: `p-6` (24px)
- **Shadow**: `shadow-xl` for depth
- **Hover State**: Slight shadow increase and scale

## UI Components

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold
         py-3 px-6 rounded-lg transition-all duration-200
         shadow-lg hover:shadow-xl transform hover:scale-105
         focus:outline-none focus:ring-2 focus:ring-blue-500
         focus:ring-offset-2;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-white hover:bg-gray-50 text-blue-600 border border-blue-600
         font-semibold py-3 px-6 rounded-lg transition-all duration-200
         shadow-lg hover:shadow-xl transform hover:scale-105
         focus:outline-none focus:ring-2 focus:ring-blue-500
         focus:ring-offset-2;
}
```

#### Success Button (Win/Positive Actions)
```css
.btn-success {
  @apply bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
         py-3 px-6 rounded-lg transition-all duration-200
         shadow-lg hover:shadow-xl transform hover:scale-105
         focus:outline-none focus:ring-2 focus:ring-emerald-500
         focus:ring-offset-2;
}
```

#### Danger Button (Delete/Destructive Actions)
```css
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white font-semibold
         py-3 px-6 rounded-lg transition-all duration-200
         shadow-lg hover:shadow-xl transform hover:scale-105
         focus:outline-none focus:ring-2 focus:ring-red-500
         focus:ring-offset-2;
}
```

### Form Components

#### Input Fields
```css
.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         transition-colors duration-200 bg-white text-gray-900
         placeholder-gray-500;
}
```

#### Select Dropdowns
```css
.select-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg
         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         transition-colors duration-200 bg-white text-gray-900;
}
```

#### Form Labels
```css
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}
```

### Data Display Components

#### Rating Display
- **TrueSkill Rating**: Large number with uncertainty indicator
- **Uncertainty Levels**:
  - High: Red indicator (σ > 2.5)
  - Medium: Amber indicator (1.5 < σ ≤ 2.5)
  - Low: Green indicator (σ ≤ 1.5)
- **Tooltips**: Educational explanations on hover

#### Player Cards
- **Avatar**: Circular placeholder with initials
- **Name**: Bold, prominent display
- **Rating**: Conservative rating (μ - 3σ) with uncertainty
- **Stats**: Games played, win rate

#### Game History
- **Timeline Layout**: Vertical list with clear separation
- **Player vs Player**: Clear winner/loser indication
- **Timestamp**: Relative time (e.g., "2 hours ago")
- **Rating Changes**: Delta display with up/down arrows

### Modal Components

#### Dialog Structure
```css
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center
         justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full p-6
         transform transition-all duration-200;
}
```

#### Confirmation Dialogs
- **Clear Heading**: Action being confirmed
- **Descriptive Text**: Consequences explanation
- **Button Placement**: Cancel (left), Confirm (right)
- **Color Coding**: Danger red for destructive actions

### Loading States

#### Spinner Component
```css
.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600;
}
```

#### Skeleton Loading
- **Card Skeletons**: Animated placeholders matching content structure
- **Text Skeletons**: Gray bars with shimmer animation
- **Image Skeletons**: Rectangular placeholders

## Animations and Transitions

### Micro-Interactions
- **Button Hover**: `transform hover:scale-105` (5% scale increase)
- **Card Hover**: Shadow elevation and slight scale
- **Modal Entrance**: Fade in with scale animation
- **Page Transitions**: Smooth color transitions for theme changes

### Duration Standards
- **Fast**: `duration-150` (150ms) - Button states
- **Standard**: `duration-200` (200ms) - Default transitions
- **Slow**: `duration-300` (300ms) - Page/modal transitions

### Easing
- **Default**: `ease-in-out` - Smooth acceleration/deceleration
- **Bounce**: `ease-out` - Quick start, slow finish
- **Sharp**: `ease-in` - Slow start, quick finish

## Responsive Design

### Mobile-First Approach
- **Base Styles**: Mobile-optimized (320px+)
- **Tablet Enhancement**: `sm:` prefix (640px+)
- **Desktop Enhancement**: `lg:` prefix (1024px+)

### Mobile Adaptations
- **Navigation**: Collapsible hamburger menu
- **Cards**: Full-width with reduced padding
- **Forms**: Larger touch targets (44px minimum)
- **Text**: Adjusted scales for readability

### Touch Interactions
- **Minimum Size**: 44x44px for touch targets
- **Spacing**: Adequate spacing between interactive elements
- **Feedback**: Visual feedback for all touch interactions

## Accessibility Features

### Color Contrast
- **AA Compliance**: 4.5:1 ratio for normal text
- **AAA Compliance**: 7:1 ratio for enhanced accessibility
- **Color Independence**: Information not conveyed by color alone

### Keyboard Navigation
- **Tab Order**: Logical sequence through interactive elements
- **Focus Indicators**: Visible focus rings on all controls
- **Skip Links**: Hidden navigation shortcuts
- **Escape Handling**: Modal dismissal with Escape key

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for complex components
- **Live Regions**: Dynamic content announcements
- **Alt Text**: Meaningful descriptions for visual content

## Dark Mode Support

### Theme Toggle
- **Persistence**: User preference saved to localStorage
- **System Preference**: Respects OS dark mode setting
- **Smooth Transitions**: 200ms color transitions

### Dark Mode Adaptations
- **Background Hierarchy**:
  - Primary: `bg-slate-900`
  - Secondary: `bg-slate-800`
  - Elevated: `bg-slate-700`
- **Text Adaptation**: High contrast text colors
- **Border Adjustments**: Subtle borders in dark contexts

## Implementation Guidelines

### CSS Architecture
- **Utility-First**: Tailwind CSS for consistent styling
- **Component Classes**: Custom classes for complex components
- **CSS Variables**: For theme values and dynamic properties

### Performance Considerations
- **Lazy Loading**: Images and heavy components
- **Animation Performance**: GPU-accelerated transforms
- **Bundle Size**: Purged CSS for production builds

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Graceful Degradation**: Fallbacks for older browsers
- **Progressive Enhancement**: Core functionality without JavaScript

## Future Enhancements

### Phase 2 Considerations
- **Advanced Analytics**: Charts and data visualizations
- **Real-time Updates**: Live game tracking
- **Team Management**: Group/team organization features
- **Tournament Mode**: Bracket-style competitions

### Component Library
- **Design Tokens**: Standardized design values
- **Component Documentation**: Storybook integration
- **Design System**: Comprehensive component guidelines
- **Testing**: Visual regression testing for UI consistency

---

This design system provides the foundation for a modern, professional, and highly usable foosball tracking application that scales across devices and user needs.
