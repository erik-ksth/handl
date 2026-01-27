# Handl - AI Coding Standards

> This is the central rules document for AI-assisted development. Use this as the source of truth and adapt to IDE-specific formats as needed.

## Project Overview

- **Name**: Handl
- **Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
- **Purpose**: AI-powered task analysis and service coordination

---

## Code Style Guidelines

### TypeScript

- Use `"use client"` directive only when component requires client-side features
- Define interfaces for all props and complex objects
- Use explicit return types for functions when not obvious
- Prefer `const` over `let`, never use `var`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Handle errors with try-catch and provide meaningful error messages

```typescript
// ✅ Good
interface Props {
  value: string;
  onChange: (value: string) => void;
}

// ❌ Avoid
const props: any = { value, onChange };
```

### React Components

- Use functional components with hooks
- Name components with PascalCase
- Place hooks at the top of components
- Extract complex logic into custom hooks
- Use `useRef` for DOM references, `useState` for reactive state

```tsx
// ✅ Good: Clear structure
export function MyComponent({ prop }: Props) {
  const [state, setState] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  return <div ref={ref}>{/* content */}</div>;
}
```

### Styling (Tailwind CSS 4)

- Use Tailwind utility classes for styling
- Group related classes logically: layout → spacing → colors → effects
- Use dark mode variants with `dark:` prefix
- Prefer responsive utilities (`md:`, `lg:`) over media queries
- Use `clsx` or `tailwind-merge` for conditional classes

```tsx
// ✅ Good: Logical grouping
<div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg" />

// ❌ Avoid: Random ordering
<div className="shadow-lg flex bg-white p-6 rounded-2xl gap-4" />
```

### File Organization

```
app/
├── api/              # API routes
│   └── [endpoint]/
│       └── route.ts
├── page.tsx          # Page components
└── layout.tsx        # Layouts

components/
├── [component-name].tsx    # React components
└── ui/                     # Reusable UI components
```

---

## API Routes

- Use Next.js App Router conventions (`route.ts`)
- Return `NextResponse.json()` for all responses
- Include proper HTTP status codes
- Validate request body before processing
- Log errors with `console.error` for debugging

```typescript
// ✅ Good: Proper API structure
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();
    
    if (!data) {
      return NextResponse.json({ error: "Data required" }, { status: 400 });
    }
    
    // Process...
    return NextResponse.json({ result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## Animations (Framer Motion)

- Use `motion` components for animated elements
- Prefer spring animations with `damping` and `stiffness`
- Use `AnimatePresence` for enter/exit animations
- Keep animations subtle and purposeful (200-800ms)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", damping: 25, stiffness: 200 }}
/>
```

---

## Environment Variables

- Store secrets in `.env.local` (never commit)
- Access via `process.env.VARIABLE_NAME`
- Validate presence before use in API routes

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MainContent`, `ThemeProvider` |
| Files (components) | kebab-case | `main-content.tsx` |
| Functions | camelCase | `handleSubmit`, `fetchData` |
| Constants | UPPER_SNAKE_CASE | `EXAMPLES`, `API_URL` |
| Interfaces/Types | PascalCase | `Message`, `MainContentProps` |
| CSS classes | Tailwind utilities | `flex items-center` |

---

## Error Handling

- Always wrap async operations in try-catch
- Provide user-friendly error messages
- Log technical details for debugging
- Use TypeScript to narrow error types

```typescript
try {
  // async operation
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("Context:", error);
  // Show user-friendly message
}
```

---

## Performance Best Practices

- Use `useRef` for values that don't trigger re-renders
- Memoize expensive calculations with `useMemo`
- Use `useCallback` for stable function references passed to children
- Lazy load components when appropriate
- Use Next.js `Image` component for optimized images

---

## Comments

- Write self-documenting code; minimize comments
- Use comments for "why", not "what"
- Use `// TODO:` for planned improvements
- Keep comments up-to-date with code changes

---

## Git Practices

- Write clear, concise commit messages
- Use conventional commits format: `feat:`, `fix:`, `refactor:`, `docs:`
- Never commit `.env.local` or `node_modules`
