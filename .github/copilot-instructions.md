# Copilot Instructions

## Error Prevention Notes
- [2025-12-05]: Always use `response_mime_type="application/json"` with models that support structured output instead of `text/plain` when expecting JSON responses to avoid parse failures.
- [2025-12-05]: When adding new columns to SQLAlchemy models, always include a startup migration function to populate values for existing records and update the Pydantic schema to match.
- [2025-12-09]: When using native modules in Expo (like Google Sign-In), use dynamic `require` with try-catch blocks and mock implementations to prevent crashes in Expo Go.
