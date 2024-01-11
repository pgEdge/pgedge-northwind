import { DataTable } from 'mantine-datatable';
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

interface TableProps {
    currentPage: number;
    rowCount: number
    rowsPerPage: number
    records: any[]
    columns: string[]
 }

export function Table(props: TableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const columnData = props.columns.map((col) => ({ "accessor": col }));

  return (
    <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        // provide data
        records={props.records}
        page={props.currentPage}
        recordsPerPage={props.rowsPerPage}
        totalRecords={props.rowCount}
        onPageChange={(p) => router.push(pathname + `?page=${p}`)}
        // define columns
        columns={columnData}
      />
  )
}
