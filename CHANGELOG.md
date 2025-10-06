# pocketcrud

## 0.2.0 (Pending Release)

### Minor Changes

- **React Component Support**: Added complete React/TypeScript implementations of all Svelte components
  - LoginForm, SetupForm, CollectionManager, RecordList, DynamicForm
  - Full TypeScript support with proper type definitions
  - Next.js 13+ App Router compatible (includes 'use client' directives)
  - Same CSS theming system as Svelte components
  - Import from `pocketcrud/components/react`

### Package Updates

- Added React and React-DOM as optional peer dependencies
- Added TypeScript configuration for JSX/TSX support
- Added `@types/react` and `@types/react-dom` to devDependencies
- Updated package.json exports to include React component paths
- Added `react` keyword to package metadata

### Documentation

- Comprehensive React usage examples in README
- Next.js integration guide
- Migration guide (Svelte vs React differences)
- Component API documentation for React

### Breaking Changes

- None! This is a fully backward-compatible addition

## 0.1.0

### Minor Changes

- 706e248: PocketBase utilities to help stand up a CRUD interface automatically based on config and schema. Collection of Svelte components.

## 0.1.0

Initial release
