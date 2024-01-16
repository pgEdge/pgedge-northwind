"use client";

import TablePage from "../components/TablePage/TablePage";

export default function Orders() {
  const title = "Orders";
  const table = "orders";
  const columns = [
    "order_id",
    "total_price",
    "total_products",
    "total_quantity",
    "shipped_date",
    "ship_name",
    "ship_city",
    "ship_country",
  ];
  return <TablePage title={title} table={table} columns={columns}></TablePage>;
}
