"use client";

import { DataTable } from "mantine-datatable";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface TableProps {
  loading: boolean;
  currentPage: number;
  rowCount: number;
  rowsPerPage: number;
  records: any[];
  columns: string[];
  onPageChange: any;
}

export function Table(props: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const columnData = props.columns.map((col) => ({ accessor: col }));

  return (
    <DataTable
      withTableBorder
      borderRadius="sm"
      withColumnBorders
      striped
      highlightOnHover
      minHeight={200}
      fetching={props.loading}
      records={props.records}
      page={props.currentPage}
      recordsPerPage={props.rowsPerPage}
      totalRecords={props.rowCount}
      onPageChange={(p) => {
        router.push(pathname + `?page=${p}`);
        props.onPageChange(p);
      }}
      columns={columnData}
    />
  );
}
