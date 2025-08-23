# shadcn/ui Implementation Checklist

## ✅ **CRITICAL: Always follow these rules**

### 1. **Installation & Setup**
- [ ] Use `pnpm dlx shadcn@latest init` for initial setup
- [ ] Use `pnpm dlx shadcn@latest add <component>` to add new components
- [ ] Never manually create shadcn/ui components - always use the CLI
- [ ] Ensure `components.json` is properly configured
- [ ] Verify `tailwind.config.ts` has shadcn/ui design tokens
- [ ] Verify `src/styles/globals.css` has shadcn/ui CSS variables

### 2. **Component Usage**
- [ ] Import from `@/components/ui/` (not `@/src/components/ui/`)
- [ ] Use `cn()` utility for className merging
- [ ] Use shadcn/ui design tokens (e.g., `bg-background`, `text-muted-foreground`)
- [ ] Avoid custom gradients - use shadcn/ui design system
- [ ] Use proper component variants (e.g., `variant="outline"`)

### 3. **Design Tokens to Use**
```css
/* ✅ CORRECT - Use these */
bg-background          /* Instead of custom colors */
text-muted-foreground  /* Instead of opacity classes */
border-border          /* Instead of custom borders */
bg-card                /* Instead of custom card backgrounds */
text-card-foreground   /* Instead of custom text colors */

/* ❌ WRONG - Don't use these */
bg-gradient-to-br from-blue-50 to-indigo-100
text-gray-600
border-gray-200
bg-white
```

### 4. **Component Checklist**
- [ ] Button - Use `asChild` prop for links
- [ ] Card - Use CardHeader, CardContent, CardTitle, CardDescription
- [ ] Input - Always pair with Label component
- [ ] Separator - Use for visual separation
- [ ] Add more components as needed: `pnpm dlx shadcn@latest add <component>`

### 5. **File Structure**
```
src/
├── components/
│   └── ui/           # shadcn/ui components only
├── lib/
│   └── utils.ts      # cn() function
└── styles/
    └── globals.css   # shadcn/ui CSS variables
```

### 6. **Before Every Commit**
- [ ] Check all imports use `@/components/ui/`
- [ ] Verify no custom gradients or colors
- [ ] Ensure all components use shadcn/ui design tokens
- [ ] Test that components render correctly

### 7. **Common Mistakes to Avoid**
- ❌ Creating components manually instead of using CLI
- ❌ Using custom CSS instead of Tailwind utilities
- ❌ Using custom colors instead of design tokens
- ❌ Importing from wrong paths
- ❌ Not using `cn()` utility for className merging

### 8. **Useful Commands**
```bash
# Add new component
pnpm dlx shadcn@latest add <component>

# List available components
pnpm dlx shadcn@latest add --help

# Update existing components
pnpm dlx shadcn@latest add <component> --overwrite
```

## 🎯 **Remember: shadcn/ui is a design system, not just components!**
