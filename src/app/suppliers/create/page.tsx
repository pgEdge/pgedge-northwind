import SupplierForm from "@/app/components/SupplierForm/SupplierForm";
import SupplierFormLoader from "@/app/components/SupplierForm/SupplierFormLoader";
import { use } from "react";

export default function SupplierFormWrapper() {
  const { accessToken } = use(SupplierFormLoader());

  if (!accessToken) {
    return <p>Loading...</p>;
  }

  return <SupplierForm token={String(accessToken)} />;
}
