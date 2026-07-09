import { ManagerProfileContent } from "@/features/user-management/components/sub-hub-manager/ManagerProfileContent";

interface ManagerProfilePageProps {
  params: Promise<{ managerId: string }>;
}

export async function generateMetadata({ params }: ManagerProfilePageProps) {
  const { managerId } = await params;

  return {
    title: `Manager Profile ${managerId} | BuildQuick India`,
    description:
      "View Sub-Hub Manager profile, operational metrics, and hub information.",
  };
}

export default async function ManagerProfilePage({
  params,
}: ManagerProfilePageProps) {
  const { managerId } = await params;

  return <ManagerProfileContent managerId={managerId} />;
}
