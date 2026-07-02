import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function SubHubNetworkPage() {
  return (
    <DevModuleScreen
      title="Sub-Hub Network"
      subtitle="Oversee regional sub-hubs, capacity, and inter-hub transfers."
      features={[
        "Hub Directory",
        "Capacity Planning",
        "Transfer Requests",
        "Hub Performance",
        "Coverage Map",
      ]}
    />
  );
}
