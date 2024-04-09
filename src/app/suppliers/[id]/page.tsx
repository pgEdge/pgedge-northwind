import SupplierForm from "@/app/components/SupplierForm/SupplierForm";
import SupplierFormLoader from "@/app/components/SupplierForm/SupplierFormLoader";
import { use } from "react";

export default function SupplierFormWrapper({
  params,
}: {
  params: { id: string };
}) {
  const { accessToken } = use(SupplierFormLoader());
  console.log("accessToken", params.id);
  if (!accessToken) {
    return <p>Loading...</p>;
  }

  return (
    <SupplierForm token={String(accessToken)} supplier_id={Number(params.id)} />
  );
}
