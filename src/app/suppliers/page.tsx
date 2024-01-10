import { Title } from '@mantine/core';
import { Table } from '../components/Table/Table';
import { getTableData } from '../data/db';

export const runtime = 'edge';

export default async function Suppliers(searchParams: any) 
{
  // const currentPage: number = Number(searchParams?.page ?? 1)
  // const rowsPerPage: number = 20
  // const { data, count } = await getTableData("suppliers", currentPage, rowsPerPage)
  // const columns = ["supplier_id", "company_name", "contact_name", "contact_title", "city", "country"]
  return (
      <>
        <Title order={3}>Suppliers</Title>
        {/* <Table currentPage={currentPage} rowCount={count} rowsPerPage={rowsPerPage} records={data} columns={columns} /> */}
    </>
  )
}
