# Styles

Tailwind config and global styles for the Navis MVP.

## Color Palette

Our design system uses a modern gray/white theme with blue accents:

- **Primary**: `#2563eb` (Blue-600) - Main accent color for buttons, links, and highlights
- **Background**: `#f9fafb` (Gray-50) - Light gray background for the application
- **Foreground**: `#111827` (Gray-900) - Almost black for primary text
- **Card**: `#ffffff` (White) - White background for cards and surfaces
- **Border**: `#d1d5db` (Gray-300) - Border color for inputs and dividers
- **Muted**: `#e5e7eb` (Gray-200) - Muted backgrounds and secondary elements
- **Secondary**: `#6b7280` (Gray-500) - Secondary text color

### Semantic Colors

- **Success**: `#10b981` (Green-500) - Success states and positive actions
- **Warning**: `#f59e0b` (Amber-500) - Warning states and caution
- **Error**: `#ef4444` (Red-500) - Error states and destructive actions

## Typography

- **Font Family**: Inter for body text (clean, readable)
- **Heading Font**: Poppins for headings (modern, bold)
- **Font Weights**: 400, 500, 600, 700 for Inter; 600, 700 for Poppins

## Component Library

We use **shadcn/ui** components for all UI primitives:

- Button: Primary, secondary, outline, ghost, and link variants
- Card: Container component with header, content, and footer sections
- Input: Form inputs with proper styling and states
- Dialog: Modal dialogs and overlays
- Dropdown: Menu and select components

## Usage Guidelines

1. **Layout & Spacing**: Use Tailwind utility classes for all layout and spacing
2. **Interactive Elements**: Use shadcn/ui components for all buttons, inputs, and interactive elements
3. **Color Usage**: Stick to the defined color palette using Tailwind's semantic color names
4. **Typography**: Use `font-heading` for headings and default `font-sans` for body text
5. **Consistency**: Maintain visual consistency by using the defined design tokens

## Example Usage

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Using our design system
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground font-heading">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-secondary">Content text</p>
    <Button className="bg-primary text-white">Action</Button>
  </CardContent>
</Card>
```
