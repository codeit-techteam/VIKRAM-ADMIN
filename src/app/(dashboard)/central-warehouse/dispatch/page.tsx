import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function DispatchControlPage() {
  return (
    <DevModuleScreen
      title="Dispatch Control"
      subtitle="Monitor and manage outbound dispatches from the central warehouse."
      features={[
        "Dispatch Queue",
        "Vehicle Assignment",
        "Loading Verification",
        "Dispatch Timeline",
        "Delivery Handoff",
      ]}
    />
  );
}
