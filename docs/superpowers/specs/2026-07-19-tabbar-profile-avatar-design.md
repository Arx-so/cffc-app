# Tab Bar Profile Avatar — Design Spec
Date: 2026-07-19

## Overview

The pill-shaped tab bar (`src/components/RoleGroupTabsLayout.tsx`) already matches the target Figma design (Best Scout — Guide, node 50-1439) in shape, color, and active-tab-label behavior. The one gap is the Profile tab: it currently renders a generic `person`/`person-outline` Ionicons icon instead of the logged-in user's avatar photo, as shown in the design.

---

## Architecture & Data Flow

### New process function

`src/processes/profile.ts` gets a new lightweight function:

```typescript
export const fetchCurrentUserAvatar = async (
  userId: string
): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profile")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return getSignedUrl(MEDIA_BUCKET, data?.avatar_url ?? null);
};
```

This avoids reusing `fetchAthleteProfile`, which also fetches video/validation/contact counts — unnecessary work for a tab bar icon that stays mounted across every screen in a role group.

### RoleGroupTabsLayout changes

- Reads `user` from `useAuthStore`.
- Uses `useQuery({ queryKey: ["tabBarAvatar", user?.id], queryFn: () => fetchCurrentUserAvatar(user!.id), enabled: !!user?.id })`.
- The Profile tab's `tabBarIcon` renders:
  - A circular `Image` (24px diameter) with `source={{ uri: avatarUrl }}` when `avatarUrl` is present.
  - Falls back to the existing `person`/`person-outline` Ionicons icon when `avatarUrl` is null (no avatar set) or still loading.
- No tint/ring is applied to the avatar in either active or inactive state — matches the Figma reference, which shows a plain circular photo in all three example states.

### Active label (no change needed)

`TabBarButton` already renders the tab's `label` next to its icon whenever `isSelected` is true, regardless of what icon/element is passed as `children`. Swapping the Profile tab's icon for the avatar image does not require any change to this mechanism — "Profile" will keep appearing next to the avatar exactly as "Home" and "Search" do next to their icons today.

### Scope

Applies to the three role groups that share `RoleGroupTabsLayout`: athlete, pro, club. The admin tab layout (`src/app/(admin)/_layout.tsx`) uses a separate plain `Tabs` component with a single "home" tab and is out of scope.

---

## Error Handling

- If the avatar fetch fails (network error, missing profile row), `useQuery` surfaces no data — the fallback icon renders. No error UI/toast, since a tab bar icon is not an actionable surface for error recovery.

## Testing

- Manual verification in the running app (Home/Search/Profile active states, with and without an avatar set) since this is a visual-only change to an existing, already-styled component.
