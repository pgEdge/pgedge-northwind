
'use client'

import TablePage from '../components/TablePage/TablePage';

export default function Customers() {
  const title = "Customers"
  const table = "customers"
  const columns = ["customer_id", "company_name", "contact_name", "contact_title", "city", "country"]
  return (
    <TablePage title={title} table={table} columns={columns}></TablePage>
  )
}