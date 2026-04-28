# TailwindCSS and shadcn/ui Setup Documentation

## Overview

This document describes the TailwindCSS 4+ and shadcn/ui configuration for the GM Secret House platform.

## TailwindCSS 4+ Configuration

### Installation

TailwindCSS 4+ is installed and configured using the new CSS-first approach:

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

### PostCSS Configuration

File: `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### CSS Configuration

File: `app/globals.css`

TailwindCSS 4 uses CSS-based configuration instead of a JavaScript config file. All theme customization is done through CSS custom properties in the `@theme` directive.

#### Dark Fantasy Theme with Crimson Accents

The platform uses a dark fantasy aesthetic with crimson (#dc143c) as the primary accent color:

```css
@theme {
  /* Color Palette - Dark Fantasy with Crimson */
  --color-background: #0a0a0a; /* Deep black background */
  --color-foreground: #ededed; /* Light gray text */
  --color-card: #1a1a1a; /* Dark card background */
  --color-primary: #dc143c; /* Crimson primary */
  --color-accent: #8b0000; /* Dark red accent */
  --color-ring: #dc143c; /* Crimson focus ring */

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### Key Features

1. **CSS-First Configuration**: No JavaScript config file needed
2. **Custom Properties**: All theme values defined as CSS variables
3. **Dark Theme by Default**: Platform uses dark mode as the primary theme
4. **Responsive Design**: Mobile-first approach (320px to 3840px viewports)
5. **Performance**: Optimized for fast builds and small bundle sizes

## shadcn/ui Configuration

### Installation

shadcn/ui is configured with the Radix Nova style:

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.11.0",
    "radix-ui": "^1.4.3",
    "shadcn": "^4.5.0",
    "tailwind-merge": "^3.5.0"
  }
}
```

### Configuration File

File: `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Installed Components

The following shadcn/ui components are currently installed:

1. **Button** (`components/ui/button.tsx`)
   - Variants: default, outline, secondary, ghost, destructive, link
   - Sizes: xs, sm, default, lg, icon variants
   - Full keyboard and screen reader support

2. **Card** (`components/ui/card.tsx`)
   - Components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
   - Sizes: default, sm
   - Flexible layout with grid-based header

3. **Input** (`components/ui/input.tsx`)
   - Styled text input with focus states
   - File input support
   - Validation states (aria-invalid)

4. **Label** (`components/ui/label.tsx`)
   - Accessible form labels
   - Radix UI Label primitive
   - Disabled state support

### Utility Functions

File: `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

The `cn()` utility combines `clsx` for conditional classes and `tailwind-merge` to properly merge Tailwind classes without conflicts.

## Adding New Components

To add additional shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Examples:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add select
```

## TypeScript Configuration

Path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows imports like:

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## Theme Customization

### Modifying Colors

To change theme colors, edit the CSS custom properties in `app/globals.css`:

```css
@theme {
  --color-primary: #your-color;
  --color-accent: #your-accent;
}
```

### Adding Custom Utilities

Add custom utilities in the `@theme` block:

```css
@theme {
  --spacing-custom: 2.5rem;
  --font-custom: "Your Font", sans-serif;
}
```

## Accessibility

All shadcn/ui components follow accessibility best practices:

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Management**: Clear focus states with crimson ring color

## Performance Considerations

1. **Code Splitting**: Components are imported individually
2. **Tree Shaking**: Unused components are automatically removed
3. **CSS Optimization**: TailwindCSS 4 generates minimal CSS
4. **Bundle Size**: Target <200KB gzipped for initial JavaScript

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `npm install`
3. Rebuild: `npm run build`

### Style Not Applying

1. Verify `@import "tailwindcss"` is at the top of `globals.css`
2. Check that `postcss.config.mjs` includes the TailwindCSS plugin
3. Ensure components use the `cn()` utility for class merging

### Component Import Errors

1. Verify path aliases in `tsconfig.json`
2. Check that `components.json` has correct alias configuration
3. Ensure component files exist in `components/ui/`

## Next Steps

For the GM Secret House platform, the following components will be needed:

- [ ] Form components (form, select, textarea, checkbox, radio)
- [ ] Navigation components (dropdown-menu, navigation-menu)
- [ ] Feedback components (toast, alert, dialog)
- [ ] Data display (table, badge, avatar)
- [ ] Layout components (separator, tabs, accordion)

## Resources

- [TailwindCSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

## Design System Reference

See `design.md` for complete design system specifications including:

- Component hierarchy
- Interface definitions
- Styling guidelines
- Accessibility requirements
