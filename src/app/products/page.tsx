'use client'

import TablePage from '../components/TablePage/TablePage';

export default function Products() {
  const title = "Products"
  const table = "products"
  const columns = ["product_id", "product_name", "quantity_per_unit", "unit_price", "units_in_stock", "units_on_order"]
  return (
    <TablePage title={title} table={table} columns={columns}></TablePage>
  )
}
