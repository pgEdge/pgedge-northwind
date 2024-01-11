
'use client'

import TablePage from '../components/TablePage/TablePage';

export default function Employees() {
  const title = "Employees"
  const table = "employees"
  const columns = ["employee_id", "first_name", "last_name", "title", "city", "home_phone", "country"]
  return (
    <TablePage title={title} table={table} columns={columns}></TablePage>
  )
}