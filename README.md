# PocketCrud

A dynamic PocketBase CRUD system with full schema introspection, form generation, and reusable UI components for rapid admin interface development. Works with **Svelte** and **React**.

## Features

- 🔍 **Schema Introspection** - Automatically discover collection schemas and field types
- 📝 **Dynamic Form Generation** - Create forms automatically based on PocketBase field definitions
- 🎛️ **Complete CRUD Operations** - Create, Read, Update, Delete records with full type safety
- 🎨 **Multi-Framework Components** - Full component libraries for both **Svelte** and **React**
- ⚙️ **Config-Driven** - Customize behavior via props, not hard-coded logic
- ✅ **Form Validation** - Client-side validation based on schema constraints
- 📱 **Responsive Design** - Mobile-friendly admin interfaces
- 🧪 **Well Tested** - Comprehensive unit tests
- 🎯 **Framework Agnostic Core** - Use utilities standalone in any JavaScript project
- 📘 **TypeScript Support** - Full type definitions for React components and utilities

## Installation

### For Svelte/SvelteKit

```bash
npm install pocketcrud pocketbase svelte
# or
bun add pocketcrud pocketbase svelte
```

### For React/Next.js

```bash
npm install pocketcrud pocketbase react react-dom
# or
bun add pocketcrud pocketbase react react-dom
```

**Note:** Framework dependencies (Svelte or React) are peer dependencies - install only what you need.

## Quick Start

### Basic Usage

```typescript
import PocketCrud from 'pocketcrud';

// Initialize with your PocketBase URL
const crud = new PocketCrud({
  url: 'http://127.0.0.1:8090',
});

// Get all collections and their schemas
const collections = await crud.getCollections();
console.log(collections);

// Get schema for a specific collection
const userSchema = await crud.getCollectionSchema('users');
console.log(userSchema);

// Perform CRUD operations
const newUser = await crud.create('users', {
  email: 'john@example.com',
  name: 'John Doe',
});

const users = await crud.getList('users', {
  filter: 'verified = true',
  sort: '-created',
});

await crud.update('users', newUser.id, {
  name: 'John Smith',
});

await crud.delete('users', newUser.id);
```

### Schema Introspection

```typescript
// Get collection with full schema information
const collection = await crud.getCollection('posts');

console.log(collection.schema);
// [
//   {
//     name: 'title',
//     type: 'text',
//     required: true,
//     presentable: true,
//     options: { max: 200 }
//   },
//   {
//     name: 'category',
//     type: 'select',
//     required: true,
//     options: { values: ['tech', 'design', 'business'] }
//   }
//   // ... more fields
// ]
```

### Dynamic Form Generation

```typescript
import { getFormFields, validateFormData, prepareFormData } from 'pocketcrud';

// Get schema and generate form configuration
const schema = await crud.getCollectionSchema('posts');
const formFields = getFormFields(schema);

// formFields contains everything needed to render a form:
// [
//   {
//     name: 'title',
//     type: 'text',
//     required: true,
//     label: 'Title',
//     placeholder: 'Enter title...'
//   },
//   {
//     name: 'category',
//     type: 'select',
//     required: true,
//     label: 'Category',
//     options: ['tech', 'design', 'business']
//   }
// ]

// Validate form data
const formData = { title: '', category: 'tech' };
const errors = validateFormData(formData, schema);
// ['title is required']

// Prepare data for submission
const preparedData = prepareFormData(formData, schema);
// Handles type conversion, JSON parsing, etc.
```

## Component Usage

PocketCrud provides complete component libraries for both **Svelte** and **React** with identical functionality.

### Choosing Your Framework

| Framework | Import Path | Use Cases |
|-----------|-------------|-----------|
| **Svelte** | `pocketcrud/svelte` | SvelteKit, Svelte apps |
| **React** | `pocketcrud/react` | Next.js, Create React App, any React project |
| **Utilities** | `pocketcrud` | Framework-agnostic CRUD utilities |

### Available Components (Both Frameworks)

All five core components are available in both libraries:

| Component | Purpose | Features |
|-----------|---------|----------|
| **LoginForm** | User authentication | Email/password, loading states, error handling |
| **SetupForm** | Admin creation | Password confirmation, validation, success states |
| **DynamicForm** | Schema-driven forms | Auto-generated fields, validation, all field types |
| **RecordList** | Display records | Pagination, responsive table/cards, actions |
| **CollectionManager** | Full CRUD interface | Combines form + list, handles all operations |

**Shared Features:**
- Same CSS styling system (CSS variables)
- Same PocketBase utilities
- Same field type support
- Same responsive behavior

---

## Svelte Component Usage

### Available Svelte Components

```javascript
// Import all Svelte components
import { LoginForm, SetupForm, CollectionManager, RecordList, DynamicForm } from 'pocketcrud/svelte';

// Or import specific groups
import { LoginForm, SetupForm } from 'pocketcrud/svelte/auth';
import { CollectionManager } from 'pocketcrud/svelte/collections';
import { RecordList, DynamicForm } from 'pocketcrud/svelte/records';
```

### LoginForm Component

```html
<script>
  import { LoginForm } from 'pocketcrud/svelte';
  import { goto } from '$app/navigation';
  import PocketCrud from 'pocketcrud';

  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  async function handleLogin(event) {
    const { email, password } = event.detail;
    isLoading = true;
    error = '';

    try {
      await crud.client.collection('users').authWithPassword(email, password);
      goto('/admin');
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<LoginForm bind:email bind:password bind:isLoading bind:error on:submit="{handleLogin}" />
```

### SetupForm Component

```html
<script>
  import { SetupForm } from 'pocketcrud/svelte';
  import { goto } from '$app/navigation';
  import PocketCrud from 'pocketcrud';

  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  let email = '';
  let password = '';
  let passwordConfirm = '';
  let isLoading = false;
  let error = '';
  let success = '';

  async function handleSetup(event) {
    const { email, password, passwordConfirm } = event.detail;

    if (password !== passwordConfirm) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 10) {
      error = 'Password must be at least 10 characters';
      return;
    }

    isLoading = true;
    error = '';
    success = '';

    try {
      await crud.createAdmin(email, password);
      success = 'Admin user created successfully!';
      setTimeout(() => goto('/admin/login'), 2000);
    } catch (err) {
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<SetupForm
  bind:email
  bind:password
  bind:passwordConfirm
  bind:isLoading
  bind:error
  bind:success
  on:submit="{handleSetup}"
/>
```

### CollectionManager Component

```html
<script>
  import { CollectionManager } from 'pocketcrud/svelte';
  import PocketCrud from 'pocketcrud';

  export let collectionName;

  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  // Optional: Configure field overrides for specific collections
  const fieldOverrides = {
    body: { type: 'textarea', rows: 8 },
    content: { type: 'textarea', rows: 6 },
  };

  // Optional: Specify primary display field
  const primaryDisplayField = 'title';
</script>

<CollectionManager {crud} {collectionName} {fieldOverrides} {primaryDisplayField} perPage="{20}" />
```

### RecordList Component

```html
<script>
  import { RecordList } from 'pocketcrud/svelte';

  export let records;
  export let schema;

  let currentPage = 1;
  let totalPages = 10;
  let totalItems = 100;
  let perPage = 20;

  function handleEdit(event) {
    const record = event.detail;
    console.log('Edit record:', record);
  }

  function handleDelete(event) {
    const record = event.detail;
    if (confirm('Delete this record?')) {
      console.log('Delete record:', record);
    }
  }

  function handlePageChange(event) {
    const page = event.detail;
    currentPage = page;
    // Fetch new page of records
  }
</script>

<RecordList
  {records}
  {schema}
  {currentPage}
  {totalPages}
  {totalItems}
  {perPage}
  primaryDisplayField="title"
  on:edit="{handleEdit}"
  on:delete="{handleDelete}"
  on:pageChange="{handlePageChange}"
/>
```

### DynamicForm Component

```html
<script>
  import { DynamicForm } from 'pocketcrud/svelte';

  export let schema;
  export let initialData = null;

  const fieldOverrides = {
    body: { type: 'textarea', rows: 8 },
  };

  function handleSubmit(event) {
    const formData = event.detail;
    console.log('Form submitted:', formData);
    // Save to PocketBase
  }

  function handleCancel() {
    console.log('Form cancelled');
  }
</script>

<DynamicForm
  {schema}
  {initialData}
  {fieldOverrides}
  on:submit="{handleSubmit}"
  on:cancel="{handleCancel}"
/>
```

### Component Customization with Slots

All components support slots for customization:

```html
<script>
  import { LoginForm } from 'pocketcrud/svelte';
</script>

<LoginForm on:submit="{handleLogin}">
  <div slot="email-input">
    <!-- Custom email input using your UI library -->
    <input type="email" bind:value="{email}" label="Email" />
  </div>

  <div slot="password-input">
    <!-- Custom password input -->
    <input type="password" bind:value="{password}" label="Password" />
  </div>

  <div slot="submit-button">
    <!-- Custom button -->
    <button type="submit" disabled="{isLoading}">{isLoading ? 'Logging in...' : 'Login'}</button>
  </div>
</LoginForm>
```

### Configuration File Pattern

For better organization, create a `pocketcrud.config.js` file in your admin routes directory:

```javascript
// routes/admin/pocketcrud.config.js
export const fieldOverrides = {
  posts: {
    body: { type: 'textarea', rows: 8 },
    content: { type: 'textarea', rows: 6 },
  },
  snippets: {
    body: { type: 'textarea', rows: 10 },
    description: { type: 'textarea', rows: 3 },
  },
};

export const primaryDisplayFields = {
  posts: 'title',
  snippets: 'title',
  comments: 'comment',
  categories: 'name',
};

export const suppressedCollections = ['users'];

export const pocketbase = {
  url: 'https://your-app.pockethost.io/',
};

export function getFieldOverrides(collectionName) {
  return fieldOverrides[collectionName] || {};
}

export function getPrimaryDisplayField(collectionName) {
  return primaryDisplayFields[collectionName];
}
```

Then use in your components:

```html
<!-- routes/admin/[slug]/+page.svelte -->
<script>
  import { CollectionManager } from 'pocketcrud/svelte';
  import { getFieldOverrides, getPrimaryDisplayField } from '../pocketcrud.config.js';

  export let collectionName;
  export let crud;
</script>

<CollectionManager
  {crud}
  {collectionName}
  fieldOverrides="{getFieldOverrides(collectionName)}"
  primaryDisplayField="{getPrimaryDisplayField(collectionName)}"
  perPage="{20}"
/>
```

**File structure:**

```
app/
├── src/
│   └── routes/
│       └── admin/
│           ├── pocketcrud.config.js  ← Config file
│           ├── +page.svelte          ← Collection list
│           ├── [slug]/
│           │   └── +page.svelte      ← Collection manager (uses ../pocketcrud.config.js)
│           └── login/
│               └── +page.svelte      ← Login form
```

### Complete Admin Interface Example

For a complete implementation example, see the GitHub repository for working code samples and configuration patterns.

## Supported Field Types

| PocketBase Type | Form Input          | Features                          |
| --------------- | ------------------- | --------------------------------- |
| `text`          | Text input          | Pattern validation, length limits |
| `editor`        | Textarea            | Rich text editing area            |
| `number`        | Number input        | Min/max validation                |
| `bool`          | Checkbox            | Boolean toggle                    |
| `email`         | Email input         | Email format validation           |
| `url`           | URL input           | URL format validation             |
| `date`          | Date input          | Date picker                       |
| `select`        | Select/Multi-select | Single or multiple options        |
| `file`          | File input          | Single or multiple files          |
| `relation`      | Select dropdown     | Related record selection          |
| `json`          | Textarea            | JSON validation and formatting    |

## API Reference

### PocketCrud Class

```typescript
class PocketCrud {
  constructor(options: CrudOptions);

  // Schema introspection
  async getCollections(): Promise<CollectionSchema[]>;
  async getCollection(idOrName: string): Promise<CollectionSchema>;
  async getCollectionSchema(idOrName: string): Promise<CollectionField[]>;

  // CRUD operations
  async create<T>(collection: string, data: Record<string, any>): Promise<T>;
  async getOne<T>(collection: string, id: string, options?: QueryOptions): Promise<T>;
  async getList<T>(collection: string, options?: QueryOptions): Promise<ListResult<T>>;
  async getFullList<T>(collection: string, options?: QueryOptions): Promise<T[]>;
  async update<T>(collection: string, id: string, data: Record<string, any>): Promise<T>;
  async delete(collection: string, id: string): Promise<boolean>;

  // Access underlying PocketBase client
  get client(): PocketBase;
}
```

### Form Utilities

```typescript
// Generate form field configurations from schema
function getFormFieldConfig(field: CollectionField): FormFieldConfig | null;
function getFormFields(schema: CollectionField[]): FormFieldConfig[];

// Validation and data preparation
function validateFormData(data: Record<string, any>, schema: CollectionField[]): string[];
function prepareFormData(data: Record<string, any>, schema: CollectionField[]): Record<string, any>;
```

## Development

### Running Tests

```bash
# Unit tests
bun run test

# Integration tests (requires running SvelteKit app)
bun run test:integration

# Test with UI
bun run test:ui
bun run test:integration:ui
```

### Building

The package uses a TypeScript build pipeline that:
1. Compiles TypeScript React components to JavaScript
2. Resolves path aliases to relative imports
3. Copies Svelte components and CSS to dist/

```bash
bun run build         # Full build (clean + tsc + alias resolution + copy)
bun run build:tsc     # TypeScript compilation only
bun run build:resolve # Resolve path aliases
bun run build:copy    # Copy Svelte/CSS files
```

### Local Development

For local package development and testing:

```bash
# Build the package
bun run build

# Link locally for testing in your projects
yalc publish

# In your test project
yalc add pocketcrud
```

### Linting

```bash
bun run lint      # ESLint
```

## Styling and Theming

PocketCrud components use CSS variables for easy customization. You can override these variables to match your app's design system.

### Available CSS Variables

```css
:root {
  /* Colors */
  --pc-primary: #3b82f6;
  --pc-primary-hover: #2563eb;
  --pc-secondary: #6b7280;
  --pc-secondary-hover: #4b5563;
  --pc-danger: #ef4444;
  --pc-danger-hover: #dc2626;
  --pc-success: #10b981;
  --pc-warning: #f59e0b;

  /* Backgrounds */
  --pc-bg-base: #ffffff;
  --pc-bg-surface: #f9fafb;
  --pc-bg-hover: #f3f4f6;

  /* Borders */
  --pc-border-color: #e5e7eb;
  --pc-border-radius: 0.375rem;
  --pc-border-width: 1px;

  /* Text */
  --pc-text-primary: #111827;
  --pc-text-secondary: #6b7280;
  --pc-text-muted: #9ca3af;
  --pc-text-inverse: #ffffff;

  /* Spacing */
  --pc-spacing-xs: 0.25rem;
  --pc-spacing-sm: 0.5rem;
  --pc-spacing-md: 1rem;
  --pc-spacing-lg: 1.5rem;
  --pc-spacing-xl: 2rem;

  /* Typography */
  --pc-font-family: inherit;
  --pc-font-size-sm: 0.875rem;
  --pc-font-size-base: 1rem;
  --pc-font-size-lg: 1.125rem;

  /* Shadows */
  --pc-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --pc-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --pc-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --pc-transition-speed: 150ms;
  --pc-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Component-Specific Classes

Each component has a unique class for targeted styling:

- `.pocketcrud-login` - Login form wrapper
- `.pocketcrud-setup` - Setup form wrapper
- `.pocketcrud-collection-manager` - Collection manager wrapper
- `.pocketcrud-record-list` - Record list wrapper
- `.pocketcrud-dynamic-form` - Dynamic form wrapper

### Import Base Styles

PocketCrud components require the base CSS file. The styles are shared between both Svelte and React components:

```javascript
// In your app's layout or main component
import 'pocketcrud/styles';
```

**For Next.js App Router:**
```tsx
// app/layout.tsx
import 'pocketcrud/styles';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Note:** The base styles use sensible defaults with Tailwind-like colors. You can either:

1. Import the base styles and override variables
2. Use the component class names to completely override styles

### Customization Example

```css
/* Override in your app's CSS file */
:root {
  --pc-primary: #8b5cf6; /* Purple instead of blue */
  --pc-border-radius: 0.5rem; /* More rounded corners */
  --pc-font-family: 'Inter', sans-serif; /* Custom font */
}

/* Customize specific components */
.pocketcrud-login {
  background: linear-gradient(to bottom right, #667eea, #764ba2);
}

.pocketcrud-btn-primary {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

**File structure for theming:**

```
app/
├── src/
│   └── routes/
│       └── admin/
│           ├── admin.css           ← Your theme overrides
│           ├── +layout.svelte      ← Import admin.css here
│           └── +page.svelte
```

## Architecture

### Package Structure

PocketCrud is built with TypeScript and includes both Svelte and React components:

```
pocketcrud/
├── src/                      # Source files
│   ├── utils/
│   │   ├── crud.js           # PocketCrud class for database operations
│   │   ├── form-utils.js     # Form field generation and validation
│   │   └── index.d.ts        # TypeScript definitions
│   ├── components/
│   │   ├── svelte/           # Svelte components
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.svelte
│   │   │   │   └── SetupForm.svelte
│   │   │   ├── Collections/
│   │   │   │   └── CollectionManager.svelte
│   │   │   └── Records/
│   │   │       ├── RecordList.svelte
│   │   │       └── DynamicForm.svelte
│   │   ├── react/            # React components (TypeScript)
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SetupForm.tsx
│   │   │   ├── Collections/
│   │   │   │   └── CollectionManager.tsx
│   │   │   └── Records/
│   │   │       ├── RecordList.tsx
│   │   │       └── DynamicForm.tsx
│   │   └── styles/           # Shared CSS for all components
│   │       └── pocketcrud.css
│   └── index.js              # Main package entry
├── dist/                     # Built files (published to npm)
│   ├── utils/                # Compiled utilities
│   ├── components/
│   │   ├── svelte/           # Svelte components (copied as-is)
│   │   ├── react/            # Compiled React components (.js + .d.ts)
│   │   └── styles/           # Shared CSS
│   └── index.js
└── demo/                     # Demo apps (not published to npm)
```

**Published to npm:**
- `dist/` directory only (built files)
- Svelte components (source files)
- React components (compiled JavaScript + TypeScript definitions)
- Shared CSS and utilities

### Design Principles

1. **Utilities are framework-agnostic** - Use CRUD utilities in any JavaScript project
2. **Multi-framework support** - Same functionality in both Svelte and React
3. **Shared styling system** - CSS variables work across all components
4. **Components are standalone** - No hard-coded dependencies on UI libraries or app-specific logic
5. **Event-driven architecture** - Components emit events (Svelte) or use callbacks (React)
6. **Customizable via props and slots** - Override defaults without forking code
7. **Config over code** - Pass configuration objects instead of modifying source
8. **TypeScript support** - Full type definitions for React components and utilities

## Real-World Usage

This package provides everything you need to build a complete admin interface in either Svelte or React:

- **Admin interface**: Collection browser and navigation
- **Collection management**: Dynamic CRUD for any PocketBase collection
- **Form generation**: Automatic forms for all field types
- **Framework flexibility**: Choose Svelte or React based on your project
- **Shared utilities**: Framework-agnostic utilities work anywhere

## Contributing

1. Clone the repo: `git clone https://github.com/jackkeller/pocketcrud.git`
2. Install dependencies: `bun install`
3. Run tests: `bun run test`
4. Make your changes
5. Add tests for new functionality
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## React Component Usage

All Svelte components have been ported to React with identical functionality and React-friendly APIs (callbacks instead of events, controlled components).

### Available React Components

```typescript
// Import all React components
import { LoginForm, SetupForm, CollectionManager, RecordList, DynamicForm } from 'pocketcrud/react';

// Or import specific groups
import { LoginForm, SetupForm } from 'pocketcrud/react/auth';
import { CollectionManager } from 'pocketcrud/react/collections';
import { RecordList, DynamicForm } from 'pocketcrud/react/records';
```

### LoginForm Component (React)

```tsx
'use client'; // For Next.js App Router

import { LoginForm } from 'pocketcrud/react';
import { useRouter } from 'next/navigation';
import PocketCrud from 'pocketcrud';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(data: { email: string; password: string }) {
    setIsLoading(true);
    setError('');

    try {
      await crud.client.collection('users').authWithPassword(data.email, data.password);
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LoginForm
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleLogin}
    />
  );
}
```

### SetupForm Component (React)

```tsx
'use client';

import { SetupForm } from 'pocketcrud/react';
import { useRouter } from 'next/navigation';
import PocketCrud from 'pocketcrud';
import { useState } from 'react';

export default function SetupPage() {
  const router = useRouter();
  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSetup(data: { email: string; password: string; passwordConfirm: string }) {
    if (data.password !== data.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (data.password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await crud.createAdmin(data.email, data.password);
      setSuccess('Admin user created successfully!');
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SetupForm
      email={email}
      password={password}
      passwordConfirm={passwordConfirm}
      isLoading={isLoading}
      error={error}
      success={success}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onPasswordConfirmChange={setPasswordConfirm}
      onSubmit={handleSetup}
    />
  );
}
```

### CollectionManager Component (React)

```tsx
'use client';

import { CollectionManager } from 'pocketcrud/react';
import PocketCrud from 'pocketcrud';

interface CollectionPageProps {
  params: { slug: string };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const crud = new PocketCrud({ url: 'https://your-pb-url.com' });

  // Optional: Configure field overrides
  const fieldOverrides = {
    body: { type: 'textarea', rows: 8 },
    content: { type: 'textarea', rows: 6 },
  };

  return (
    <CollectionManager
      crud={crud}
      collectionName={params.slug}
      fieldOverrides={fieldOverrides}
      primaryDisplayField="title"
      perPage={20}
    />
  );
}
```

### RecordList Component (React)

```tsx
'use client';

import { RecordList } from 'pocketcrud/react';

export default function MyRecordList({ records, schema }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  const totalItems = 100;
  const perPage = 20;

  function handleEdit(record) {
    console.log('Edit record:', record);
  }

  function handleDelete(record) {
    if (confirm('Delete this record?')) {
      console.log('Delete record:', record);
    }
  }

  function handlePageChange(page) {
    setCurrentPage(page);
    // Fetch new page of records
  }

  return (
    <RecordList
      records={records}
      schema={schema}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      perPage={perPage}
      primaryDisplayField="title"
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPageChange={handlePageChange}
    />
  );
}
```

### DynamicForm Component (React)

```tsx
'use client';

import { DynamicForm } from 'pocketcrud/react';

export default function MyForm({ schema, initialData }) {
  const fieldOverrides = {
    body: { type: 'textarea', rows: 8 },
  };

  function handleSubmit(formData) {
    console.log('Form submitted:', formData);
    // Save to PocketBase
  }

  function handleCancel() {
    console.log('Form cancelled');
  }

  return (
    <DynamicForm
      schema={schema}
      initialData={initialData}
      fieldOverrides={fieldOverrides}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
```

### Next.js App Router Integration

For Next.js 13+ App Router, all React components include the `'use client'` directive and work seamlessly:

```typescript
// app/admin/[slug]/page.tsx
'use client';

import { CollectionManager } from 'pocketcrud/react';
import PocketCrud from 'pocketcrud';

export default function AdminCollectionPage({ params }: { params: { slug: string } }) {
  const crud = new PocketCrud({ url: process.env.NEXT_PUBLIC_POCKETBASE_URL });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage {params.slug}</h1>
      <CollectionManager crud={crud} collectionName={params.slug} />
    </div>
  );
}
```

### Key Differences from Svelte Components

While functionality is identical, the APIs differ to match each framework's patterns:

| Feature | Svelte | React |
|---------|--------|-------|
| **Events** | Event dispatchers (`on:submit`) | Callback props (`onSubmit`) |
| **Data Binding** | Two-way binding (`bind:value`) | Controlled components (`value` + `onChange`) |
| **Customization** | Slots | Render props / children |
| **Styling** | Same CSS variables | Same CSS variables |

Both use the same `pocketcrud/styles` CSS file.

## Roadmap

- [x] React/Next.js components (port existing Svelte components to React) ✅ **COMPLETED**
- [ ] Advanced field types (rich text, file relationships)
- [ ] Advanced filtering and search
- [ ] Custom field renderers
- [ ] Plugin system for custom field types
- [ ] Real-time updates with PocketBase realtime
