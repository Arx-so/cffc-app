# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expo React Native mobile app with TypeScript, using Expo Router for file-based routing.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo dev server (npx expo start)
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator
npm run web          # Run on web
npm run lint         # Run ESLint
npm run reset-project # Reset project template
```

## Architecture

### Tech Stack
- **Expo SDK 55** with Expo Router (file-based routing)
- **React 19** with React Native 0.83
- **TypeScript** with strict mode, path aliases (`@/*` → `./src/*`)
- **Zustand** for state management with persistence
- **Supabase** for authentication
- **react-query** for data fetching
- **UI Kitten** with Eva Design system for UI components
- **react-i18next** for i18n (en/ja)
- **react-native-toast-message** for notifications

### Directory Structure

```
src/
  app/          # Expo Router pages (routing)
  app/(tabs)/   # Tab navigator routes
  config/       # App configuration (supabase, i18n, themes)
  constants/    # Static constants
  hooks/        # Reusable hooks
  locales/      # i18n translation files
  processes/    # Business logic layer (auth, API calls)
  stores/       # Zustand state stores
  utils/        # Utility functions
  Views/        # UI components (feature-based, with Container pattern)
```

### State Management

Zustand stores with persistence via SecureStore:
- `authStore` - Authentication state (isAuthenticated, user, checkAuth, signOut)
- `themeStore` - Theme mode (light/dark/system) with system detection
- `languageStore` - Language preference (en/ja) with i18n sync

### Authentication Flow

Auth is managed via Supabase client configured in `config/supabase.ts`:
- Session persistence in SecureStore
- Auto-refresh enabled
- `authStore.checkAuth()` validates session on app start
- Protected routes guarded via auth state in `_layout.tsx`

### Routing

Expo Router with nested structure:
- Root Stack: `index`, `login`, `(tabs)`
- Tabs: `inbox`, `explore`
- Auth check redirects: authenticated → explore, unauthenticated → index

### Key Patterns

- **Container pattern**: Views use `<ViewName>Container.tsx` for business logic
- **Path aliases**: Use `@/` for imports (configured in `tsconfig.json`)
- **Type safety**: Strict TypeScript enabled
