"use client";

import { Title } from "@mantine/core";
import { Table } from "../Table/Table";
import { getTableData } from "../../data/api";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

interface TablePageProps {
  title: string;
  table: string;
  columns: string[];
}

export default function TablePage(props: TablePageProps) {
  const searchParams = useSearchParams();
  const rowsPerPage: number = 20;
  const columns = props.columns;

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page") ?? "1"),
  );
  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tableData: any = await getTableData(props.table, currentPage);
      setRecords(tableData.data);
      setCount(tableData.count);
      setLoading(false);
    };

    fetchData();
  }, [currentPage]);

  return (
    <>
      <Title order={3} fw={600} mb="lg">
        {props.title}
      </Title>
      <Table
        loading={loading}
        currentPage={currentPage}
        rowCount={count}
        rowsPerPage={rowsPerPage}
        records={records}
        columns={columns}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
