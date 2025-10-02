# PocketCrud Development Workflow

## Local Development with Yalc

Yalc creates a local package store and allows you to link packages without publishing to npm.
It works by creating a `file:.yalc/package-name` reference in package.json and a `.yalc/` directory.

### Initial Setup

```bash
# In pocketcrud repo
cd ~/dev/pocketcrud
bun install
yalc publish

# In consuming app
cd ~/path/to/your-app
yalc add pocketcrud
```

This creates:

- `.yalc/pocketcrud/` - local copy of the package
- `yalc.lock` - tracks yalc dependencies
- Updates package.json with `"pocketcrud": "file:.yalc/pocketcrud"`
- **Note**: `.yalc/` and `yalc.lock` are gitignored

### Making Changes and Testing

1. Make your changes to the pocketcrud source code

2. Push updated version to all linked projects:

   ```bash
   cd ~/dev/pocketcrud
   yalc push
   # This automatically updates all projects using yalc add
   ```

3. Restart your dev server to see changes:
   ```bash
   cd ~/path/to/your-app
   bun run dev
   ```

### Alternative: Manual Update

If you published without `push`:

```bash
cd ~/path/to/your-app
yalc update pocketcrud
```

### Removing Yalc Link (When Ready to Use npm Version)

```bash
cd ~/path/to/your-app
yalc remove pocketcrud
bun install pocketcrud
```

This will:

- Remove `.yalc/pocketcrud/` directory
- Update package.json to use npm version
- Remove yalc.lock if no other yalc dependencies

## Publishing to npm with Changesets

### Creating a Changeset

When you make changes that should be released:

```bash
cd ~/dev/pocketcrud
bun run changeset
```

Follow the prompts:

- Select change type: `patch` (bug fixes), `minor` (new features), or `major` (breaking changes)
- Describe your changes

### Versioning and Publishing

1. **Create version bump**:

   ```bash
   bun run version
   ```

   This updates package.json and CHANGELOG.md

2. **Commit the changes**:

   ```bash
   git add .
   git commit -m "Version bump"
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Create a release PR (or update existing one)
   - When PR is merged, publish to npm automatically

### Manual Publishing (if needed)

```bash
bun run release
```

This requires NPM_TOKEN to be set in your environment.

## GitHub Setup

### Required Secrets

Add these secrets in your GitHub repository settings:

1. **NPM_TOKEN**: Your npm access token
   - Get from: https://www.npmjs.com/settings/[username]/tokens
   - Type: Automation token

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions

### Creating the GitHub Repository

```bash
cd ~/dev/pocketcrud
git remote add origin https://github.com/yourusername/pocketcrud.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Package Structure

```
pocketcrud/
├── src/
│   ├── components/
│   │   └── svelte/
│   │       ├── Auth/
│   │       ├── Collections/
│   │       ├── Records/
│   │       └── pocketcrud.css
│   ├── utils/
│   │   ├── crud.js
│   │   └── form-utils.js
│   ├── index.js
│   └── index.d.ts
├── .changeset/
├── .github/workflows/
├── package.json
├── README.md
└── LICENSE
```

## Testing

Run tests before publishing:

```bash
bun test
```

## Common Workflows

### Adding a New Feature

1. Create a feature branch
2. Make your changes
3. Run tests: `bun test`
4. Create a changeset: `bun run changeset`
5. Commit and push
6. Create PR to main

### Fixing a Bug

1. Make the fix
2. Add tests if applicable
3. Create a changeset (type: patch)
4. Commit and push

### Breaking Change

1. Make the change
2. Update README with migration guide
3. Create changeset (type: major)
4. Document in PR description
