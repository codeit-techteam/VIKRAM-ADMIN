import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function SystemSettingsPage() {
  return (
    <DevModuleScreen
      title="System Settings"
      subtitle="Configure platform-wide settings, integrations, and security policies."
      features={[
        "General Settings",
        "API Integrations",
        "Security Policies",
        "Audit Logs",
        "Backup & Recovery",
      ]}
    />
  );
}
