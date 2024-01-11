import { Title } from '@mantine/core';
import { Table } from '../components/Table/Table';
import { getTableData } from '../data/api';

export default async function Products() {
  // const currentPage: number = props.searchParams.page ? Number(props.searchParams.page) : 1;
  const currentPage = 1;
  const rowsPerPage: number = 20;
  const tableData: any = await getTableData("products", currentPage);
  const columns = ["product_id", "product_name", "quantity_per_unit", "unit_price", "units_in_stock", "units_on_order"]
  return (
    <>
      <Title order={3}>Products</Title>
      <Table currentPage={currentPage} rowCount={tableData.count} rowsPerPage={rowsPerPage} records={tableData.data} columns={columns} />
    </>
  )
}

