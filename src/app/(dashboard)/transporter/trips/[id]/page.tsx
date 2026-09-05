import { TripDetailPage } from "@/features/transporter/pages/TripDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TripDetailPage id={id} />;
}
