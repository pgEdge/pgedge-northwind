"use client";

import TablePage from "../components/TablePage/TablePage";

export default function Suppliers() {
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
  return <TablePage title={title} table={table} columns={columns}></TablePage>;
}
