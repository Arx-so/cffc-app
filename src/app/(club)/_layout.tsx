import { RoleGroupTabsLayout } from "@/components/RoleGroupTabsLayout";

export default function ClubTabLayout() {
  return (
    <RoleGroupTabsLayout addVideosMode="navigate" groupBasePath="/(club)" showAddVideos={false} />
  );
}
