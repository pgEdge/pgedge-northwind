import { Title } from '@mantine/core';
import { Table } from '../components/Table/Table';
import { getTableData } from '../data/api';

export const runtime = 'edge';

export default async function Suppliers(props: any) {
  const currentPage: number = props.searchParams.page ? Number(props.searchParams.page) : 1;
  const rowsPerPage: number = 20;
  const tableData: any = await getTableData("suppliers", currentPage);
  const columns = ["supplier_id", "company_name", "contact_name", "contact_title", "city", "country"]
  return (
    <>
      <Title order={3}>Suppliers</Title>
      <Table currentPage={currentPage} rowCount={tableData.count} rowsPerPage={rowsPerPage} records={tableData.data} columns={columns} />
    </>
  )
}
