import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function UserManagementPage() {
  return (
    <DevModuleScreen
      title="User Management"
      subtitle="Create and manage admin users, roles, and access permissions."
      features={[
        "User Directory",
        "Role Assignment",
        "Permission Matrix",
        "Activity Logs",
        "Invite Users",
      ]}
    />
  );
}
