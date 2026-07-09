import { ExecutiveProfileContent } from "@/features/user-management/components/customer-executive/ExecutiveProfileContent";

interface ExecutiveProfilePageProps {
  params: Promise<{ executiveId: string }>;
}

export async function generateMetadata({ params }: ExecutiveProfilePageProps) {
  const { executiveId } = await params;

  return {
    title: `Executive Profile ${executiveId} | BuildQuick India`,
    description: "View customer executive profile, metrics, and assignments.",
  };
}

export default async function ExecutiveProfilePage({
  params,
}: ExecutiveProfilePageProps) {
  const { executiveId } = await params;

  return <ExecutiveProfileContent executiveId={executiveId} />;
}
