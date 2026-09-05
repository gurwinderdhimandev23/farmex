import { EnquiryDetailPage } from "@/features/farmer/pages/EnquiryDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EnquiryDetailPage id={id} />;
}
