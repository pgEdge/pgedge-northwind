import TablePage from "../components/TablePage/TablePage";
import SupplierFormLoader from "@/app/components/SupplierForm/SupplierFormLoader";
import { use } from "react";

export const runtime = "edge";

export default function Suppliers() {
  const token = use(SupplierFormLoader());
  const title = "Suppliers";
  const table = "suppliers";
  const columns = [
    "supplier_id",
    "company_name",
    "contact_name",
    "contact_title",
    "city",
    "country",
  ];
  return (
    <>
      <TablePage
        title={title}
        table={table}
        columns={columns}
        token={token?.accessToken as string}
      ></TablePage>
    </>
  );
}
