import { DevModuleScreen } from "@/components/shared/DevModuleScreen";

export default function LogisticsPage() {
  return (
    <DevModuleScreen
      title="Logistics"
      subtitle="Track fleet, deliveries, routes, and driver assignments in real time."
      features={[
        "Live Fleet Map",
        "Delivery Tracking",
        "Route Optimization",
        "Driver Management",
        "Trip History",
      ]}
    />
  );
}
