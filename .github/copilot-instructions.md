# Copilot Instructions

## Error Prevention Notes
- [2025-12-05]: Always use `response_mime_type="application/json"` with models that support structured output instead of `text/plain` when expecting JSON responses to avoid parse failures.
- [2025-12-05]: When adding new columns to SQLAlchemy models, always include a startup migration function to populate values for existing records and update the Pydantic schema to match.
- [2025-12-09]: When using native modules in Expo (like Google Sign-In), use dynamic `require` with try-catch blocks and mock implementations to prevent crashes in Expo Go.
- [2025-12-09]: EAS local builds fail in resource-constrained environments (codespaces) when the Gradle daemon crashes during Metro bundling. Use `eas build --platform android` (cloud build) instead for CI/codespace environments; reserve local builds for developer machines.
- [2025-12-09]: Keep Expo/EAS configuration files (`app.json`, `eas.json`) only within specific project folders (e.g., `android/`), not at repository root when managing multiple apps in a monorepo to avoid SDK detection conflicts.
- [2025-12-10]: In monorepos, install dependencies in the same package.json where their peer dependencies (like React) exist, not at repository root, to prevent multiple package instances causing "Invalid hook call" errors.
- [2025-12-10]: When implementing PWA features, ensure the service worker and manifest files are in the `public/` directory so Vite copies them to `dist/` during build; configure `publicDir: 'public'` in `vite.config.ts`.
- [2025-12-10]: When editing JSX conditionals, always ensure opening and closing braces match the intended component structure—remove conditional wrapping if the content should always render to avoid "character is not valid inside JSX element" errors.
- [2025-12-10]: Always check package.json for missing dependencies before importing libraries.
- [2025-12-10]: Always use import type for TypeScript interfaces and types that are not runtime values.
- [2025-12-10]: Always use the correct syntax for TypeScript imports when mixing value and type imports: import { value, type Type } from 'module';
- [2025-12-10]: When importing a type exported from another module, always use `import type` or `import { type TypeName }` to avoid runtime errors where the bundler expects a value export.
- [2025-12-10]: For real-time content loading, use separate state variables instead of nested objects to ensure React re-renders properly when API data arrives. Show loading immediately on app open, display content as soon as API succeeds, and show error only after 3-second delay on failure.
