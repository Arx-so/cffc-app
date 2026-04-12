# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expo React Native mobile app with TypeScript, using Expo Router for file-based routing.

## Commands

This project uses **bun** as its package manager. Never use `npm`.

```bash
bun install          # Install dependencies
bun start            # Start Expo dev server
bun run android      # Run on Android emulator
bun run ios          # Run on iOS simulator
bun run web          # Run on web
bun run lint         # Run ESLint
bunx expo install    # Install Expo-compatible packages
```

## Architecture

### Tech Stack
- **Expo SDK 55** with Expo Router (file-based routing)
- **React 19** with React Native 0.83
- **TypeScript** with strict mode, path aliases (`@/*` → `./src/*`)
- **Zustand** for state management with persistence via SecureStore
- **Supabase** for authentication and database
- **react-query** for data fetching and cache
- **UI Kitten** with Eva Design system for UI components
- **react-i18next** for i18n (en / pt-br / ja)
- **react-native-toast-message** for notifications

### Directory Structure

```
src/
  app/              # Expo Router pages (routing)
  app/(athlete)/    # Routes for the athlete role
  app/(pro)/        # Routes for the pro role
  app/(club)/       # Routes for the club role
  app/(admin)/      # Routes for the admin role
  components/       # Reusable components
  config/           # App configuration (supabase, i18n, themes)
  constants/        # Static constants (Brand, etc.)
  hooks/            # Reusable custom hooks
  locales/          # i18n translation files
  processes/        # Business logic layer (API calls, domain types)
  stores/           # Zustand state stores
  utils/            # Utility functions
  Views/            # Feature-based UI screens (hook pattern)
```

## Business Rules

### User Roles

There are 4 roles defined in `src/processes/types/profileTypes.ts`:

| Role      | Base route      | Description                      |
|-----------|-----------------|----------------------------------|
| `athlete` | `/(athlete)/`   | Athlete — can add videos         |
| `pro`     | `/(pro)/`       | Professional (scout, coach)      |
| `club`    | `/(club)/`      | Football club                    |
| `admin`   | `/(admin)/`     | Platform administrator           |

The role is stored in the `profile` table in Supabase (field `role`).

### Authentication Flow

1. App opens → `authStore.checkAuth()` fetches session from Supabase
2. If session exists → fetch `role` from the `profile` table
3. Root `_layout.tsx` redirects to `/(role)/home` based on the role
4. If unauthenticated and on a role route → redirect to `/` (landing)

```
Unauthenticated → /index (landing) → /login or /signup
Authenticated (athlete) → /(athlete)/home
Authenticated (pro)     → /(pro)/home
Authenticated (club)    → /(club)/home
Authenticated (admin)   → /(admin)/home
```

### Route Protection

- All routes inside `(athlete)`, `(pro)`, `(club)`, `(admin)` are protected
- Route guard lives in `src/app/_layout.tsx` via `useAuthStore`
- Never navigate without considering the user's `role`

### Supabase Tables

| Table             | Description                                                              |
|-------------------|--------------------------------------------------------------------------|
| `profile`         | User data (role, name, avatar, verified, city, state)                    |
| `media`           | Athlete videos (type: "video", status: pending/approved/rejected)        |
| `validation`      | Validations received by the athlete                                      |
| `contact_request` | Contact requests to the athlete                                          |

### Video Status (`ProfileVideoStatus`)

- `pending` — awaiting moderation
- `approved` — approved and visible
- `rejected` — rejected

### Athlete Profile Stats

Stats shown on the profile are counts of **approved** records:
- `videoCount` — videos with `status = approved`
- `validationCount` — validations with `status = approved`
- `contactCount` — contact_requests with `status = accepted`

## Routing

### Route Structure

```
app/
  _layout.tsx           # Root Stack — auth guard and role-based redirect
  index.tsx             # Landing (unauthenticated)
  login.tsx
  signup.tsx
  (athlete)/
    _layout.tsx         # Tabs: home, search, add-videos, favorites, profile
    home/index.tsx
    search/index.tsx
    add-videos/index.tsx
    favorites/index.tsx
    profile/index.tsx
  (pro)/
    _layout.tsx         # Tabs: home, profile
    home/index.tsx
    profile/index.tsx
  (club)/
    _layout.tsx         # Tabs: home, profile
    home/index.tsx
    profile/index.tsx
  (admin)/
    _layout.tsx         # Tabs: home
    home/index.tsx
```

### Role Redirect Map (in `src/app/_layout.tsx`)

```typescript
const ROLE_ROUTES: Record<UserRole, string> = {
  athlete: "/(athlete)/home",
  pro:     "/(pro)/home",
  club:    "/(club)/home",
  admin:   "/(admin)/home",
};
```

### Rules When Adding New Routes

1. New screens for a specific role → create inside the `(role)/` group
2. Screens shared across roles → consider creating as a modal in the root stack
3. Always register new tabs in the corresponding group's `_layout.tsx`
4. Tab bar defaults: `tabBarActiveTintColor: Brand.green`, `tabBarInactiveTintColor: Brand.gray`

## Key Patterns

### Hook Pattern (Views)

Every screen in `src/Views/` must follow this structure:

```
Views/
  ScreenName/
    index.ts              # barrel export
    useScreenName.ts      # hook with all logic (state, handlers, queries)
    ScreenName.tsx        # component that calls the hook and renders UI
    ScreenName.types.ts   # hook and component types
    ScreenName.styles.ts  # StyleSheet
```

```typescript
// ✅ Correct — logic in the hook, component only renders
export const MyView = () => {
  const { data, handlePress } = useMyView();
  return <Button onPress={handlePress}>{data.title}</Button>;
};

// ❌ Wrong — logic inside the component
export const MyView = () => {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(...) }, []);
  return <Button>{data?.title}</Button>;
};
```

### Imports

Always use the `@/` path alias, never relative paths outside the module:

```typescript
// ✅
import { useAuthStore } from "@/stores/authStore";
import { Brand } from "@/constants/theme";

// ❌
import { useAuthStore } from "../../stores/authStore";
```

### Styles

- Use `StyleSheet.create()` in a separate `.styles.ts` file
- Colors and design tokens via `Brand` from `@/constants/theme`
- Never use hardcoded hex values in components

```typescript
// ✅
import { Brand } from "@/constants/theme";
style={{ color: Brand.green, backgroundColor: Brand.bg }}

// ❌
style={{ color: "#00FF00", backgroundColor: "#000" }}
```

### State Management

Zustand stores in `src/stores/`:
- `useAuthStore` — authentication (`isAuthenticated`, `user`, `role`, `checkAuth`, `signOut`)
- `useThemeStore` / `useEffectiveTheme` — theme (light/dark/system)
- `useLanguageStore` — language (en/pt-br/ja)

Never duplicate state that already exists in a store.

### Data Fetching

- Use **react-query** (`useQuery`, `useMutation`) for all Supabase calls
- API functions go in `src/processes/`
- Never call `supabase` directly inside components or UI hooks

```typescript
// ✅ — process in src/processes/profile.ts
const { data } = useQuery({
  queryKey: ["profile", userId],
  queryFn: () => fetchAthleteProfile(userId),
});

// ❌ — supabase directly in a View hook
const { data } = await supabase.from("profile").select(...);
```

### TypeScript

- Strict mode enabled — no unnecessary `any`
- Domain types go in `src/processes/types/`
- Component/hook types go in `ScreenName.types.ts` inside the View

## Internationalization (i18n)

**Never use hardcoded strings** for user-visible text (labels, placeholders, titles, toast messages, buttons, etc.).

Always use `react-i18next` with the `t()` function:

```typescript
// ✅
const { t } = useTranslation();
<Text>{t("editProfile.name")}</Text>
Toast.show({ type: "success", text1: t("editProfile.profileUpdated") });

// ❌
<Text>NAME</Text>
Toast.show({ type: "success", text1: "Profile updated!" });
```

### Translation Files

| File                    | Language            |
|-------------------------|---------------------|
| `src/locales/en.ts`     | English             |
| `src/locales/pt-br.ts`  | Portuguese (Brazil) |
| `src/locales/ja.ts`     | Japanese            |

### Rules When Adding New Strings

1. Add the key in **all 3 files** simultaneously
2. Group by feature/screen (e.g. `editProfile.`, `profile.`, `settings.`)
3. Keep naming consistent with existing keys
4. Numeric placeholders and technical field names may stay untranslated (e.g. "185", "@username")
