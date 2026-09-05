import { Metadata } from "next";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";

export const metadata: Metadata = {
  title: "User Management & KYC | Admin | FarmEx",
  description: "Manage Farmers, Transporters, KYC Verification, and Vehicles.",
};

export default function AdminUsersRoute() {
  return <AdminUsersPage />;
}
