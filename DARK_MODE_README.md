# Dark Mode Implementation - Navis MVP Frontend

This document outlines the comprehensive dark mode implementation for the Navis MVP frontend application using Tailwind CSS and shadcn/ui best practices.

## Overview

The dark mode implementation provides a seamless user experience with system preference detection, manual toggle, and persistent theme storage. The implementation follows modern web standards and accessibility guidelines.

## Features

- ✅ **System Preference Detection**: Automatically detects user's OS theme preference
- ✅ **Manual Toggle**: Three-state theme selector (Light, Dark, System)
- ✅ **Persistent Storage**: Theme preference saved to localStorage
- ✅ **Smooth Transitions**: Animated theme transitions for better UX
- ✅ **Accessibility**: ARIA compliant with proper contrast ratios
- ✅ **Component Coverage**: All UI components support dark mode
- ✅ **Custom Scrollbars**: Dark mode compatible scrollbar styling

## Implementation Details

### 1. Tailwind Configuration

Updated `tailwind.config.js` to enable dark mode:

```javascript
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  // ... color system with CSS custom properties
}
```

### 2. CSS Custom Properties

Added comprehensive CSS custom properties in `src/index.css`:

```css
:root {
  /* Light mode colors */
  --background: 210 20% 98%;
  --foreground: 222.2 84% 4.9%;
  /* ... other light mode variables */
}

.dark {
  /* Dark mode colors */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark mode variables */
}
```

### 3. Theme Management

**Hook: `useTheme`** (`src/hooks/useTheme.ts`)
- Manages theme state and persistence
- Handles system preference detection
- Provides theme toggle functionality
- Applies theme changes to DOM

**Component: `ThemeToggle`** (`src/components/ThemeToggle.tsx`)
- Dropdown menu with Light/Dark/System options
- Visual feedback for current theme
- Keyboard accessible
- Follows shadcn/ui patterns

### 4. Component Updates

All UI components have been updated to support dark mode:

#### Button Component
- Uses semantic color tokens (`primary`, `secondary`, `accent`)
- Proper focus states with `ring` colors
- Hover states with opacity variations

#### Card Component
- Background uses `bg-card` with `text-card-foreground`
- Border uses `border-border` token
- Consistent shadow system

#### Input Component
- Background uses `bg-background`
- Border uses `border-input`
- Placeholder uses `text-muted-foreground`

#### Dropdown Menu
- Background uses `bg-popover`
- Hover states use `hover:bg-accent`
- Text uses semantic foreground colors

### 5. Page-Level Updates

#### Dashboard
- Status badges with dark mode variants
- Notification icons with proper contrast
- Priority indicators with dark mode colors

#### LiveCall
- Transcript background with dark mode support
- Chat interface with proper message styling
- Modal overlays with dark mode backgrounds

#### Header & Sidebar
- Sticky header with backdrop blur
- Navigation items with hover states
- Theme toggle integration

## Color System

### Semantic Color Tokens

The color system uses semantic tokens that automatically adapt to light/dark themes:

```css
/* Primary colors */
bg-background      /* Page background */
text-foreground    /* Primary text */
bg-card           /* Card backgrounds */
text-card-foreground /* Card text */

/* Interactive colors */
bg-primary        /* Primary buttons */
text-primary-foreground /* Primary button text */
bg-secondary      /* Secondary elements */
text-secondary-foreground /* Secondary text */

/* State colors */
bg-accent         /* Hover states */
text-accent-foreground /* Accent text */
bg-muted          /* Muted backgrounds */
text-muted-foreground /* Muted text */

/* Borders and inputs */
border-border     /* General borders */
border-input      /* Input borders */
ring-ring         /* Focus rings */
```

### Status Colors

Status colors maintain accessibility in both themes:

```css
/* Success states */
bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400

/* Warning states */
bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400

/* Error states */
bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400

/* Info states */
bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400
```

## Usage Guidelines

### For New Components

1. **Use Semantic Tokens**: Always use semantic color tokens instead of specific colors
2. **Test Both Themes**: Verify component appearance in both light and dark modes
3. **Maintain Contrast**: Ensure WCAG AA compliance for text contrast
4. **Interactive States**: Define hover, focus, and active states for both themes

### Example Implementation

```tsx
// ✅ Good: Using semantic tokens
<div className="bg-card border border-border text-card-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>

// ❌ Bad: Using specific colors
<div className="bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
  <button className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
    Click me
  </button>
</div>
```

### Theme Toggle Usage

```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### Theme Detection

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## Accessibility Considerations

1. **Contrast Ratios**: All color combinations meet WCAG AA standards
2. **Focus Management**: Proper focus indicators in both themes
3. **Reduced Motion**: Respects user's motion preferences
4. **Screen Readers**: Semantic HTML and ARIA attributes maintained

## Testing Checklist

- [ ] System preference detection works correctly
- [ ] Manual theme toggle functions properly
- [ ] Theme preference persists across sessions
- [ ] All pages render correctly in both themes
- [ ] Interactive elements maintain proper contrast
- [ ] Focus indicators are visible in both themes
- [ ] Status colors are distinguishable in both themes
- [ ] Transitions are smooth and not jarring

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Future Enhancements

1. **Custom Theme Colors**: Allow users to customize brand colors
2. **Theme Scheduling**: Automatic theme switching based on time
3. **Component-Level Themes**: Per-component theme overrides
4. **Theme Export**: Save and share custom themes
5. **High Contrast Mode**: Additional accessibility theme

## Troubleshooting

### Common Issues

1. **FOUC (Flash of Unstyled Content)**: Ensure theme is applied before React renders
2. **Inconsistent Colors**: Use semantic tokens instead of specific colors
3. **Missing Dark Variants**: Add dark mode variants for custom styles
4. **Storage Issues**: Handle localStorage availability and errors

### Development Tips

1. **Use Browser Dev Tools**: Test theme switching in dev tools
2. **Check Contrast**: Use accessibility tools to verify contrast ratios
3. **Test System Preferences**: Change OS theme to test auto-detection
4. **Validate with Screen Readers**: Test with assistive technologies

## Conclusion

The dark mode implementation provides a modern, accessible, and maintainable theme system that enhances the user experience while maintaining code quality and performance. The use of semantic color tokens and CSS custom properties ensures easy maintenance and consistent styling across all components.

For questions or issues, please refer to the component documentation or create an issue in the project repository.
