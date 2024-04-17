import SupplierForm from "@/app/components/SupplierForm/SupplierForm";
import SupplierFormLoader from "@/app/components/SupplierForm/SupplierFormLoader";
import { use } from "react";

export const runtime = "edge";

export default function SupplierFormWrapper() {
  const token = use(SupplierFormLoader());

  if (!token?.accessToken) {
    return <p>Loading...</p>;
  }

  return <SupplierForm token={token?.accessToken as string} />;
}
