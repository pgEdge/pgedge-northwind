import { Title } from '@mantine/core';
import { Table } from '../components/Table/Table';
import { getTableData } from '../data/db';

export const dynamic = 'force-dynamic'

export default async function Products(searchParams: any) 
{
  const currentPage: number = Number(searchParams?.page ?? 1)
  const rowsPerPage: number = 20
  const { data, count } = await getTableData("products", currentPage, 20)
  const columns = ["product_id", "product_name", "quantity_per_unit", "unit_price", "units_in_stock", "units_on_order"]
  return (
      <>
        <Title order={3}>Products</Title>
        <Table currentPage={currentPage} rowCount={count} rowsPerPage={rowsPerPage} records={data} columns={columns} />
    </>
  )
}

