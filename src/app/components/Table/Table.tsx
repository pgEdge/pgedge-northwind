"use client";

import { Box, Button } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { deleteSupplier } from "@/app/data/api";

interface TableProps {
  loading: boolean;
  currentPage: number;
  rowCount: number;
  rowsPerPage: number;
  records: any[];
  columns: string[];
  onPageChange: any;
  token?: string;
}

export function Table(props: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const columnData = props.columns.map((col) => ({ accessor: col }));
  if (pathname === "/suppliers" && !isLoading && user) {
    columnData.push({
      accessor: "actions",
      //@ts-ignore
      render: (supplier) => (
        <div style={{ display: "flex", gap: 5, width: "min-content" }}>
          <Button
            type="submit"
            onClick={() => router.push(`/suppliers/${supplier.supplier_id}`)}
          >
            Edit
          </Button>
          <Button
            color="red"
            onClick={() => {
              deleteSupplier(supplier.supplier_id, props.token as string);
              window.location.reload();
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  }
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
