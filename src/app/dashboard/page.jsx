"use client";

import { Title, List, ThemeIcon, rem, SimpleGrid, Space, Image } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { IconClock, IconDatabase, IconFlame, IconLocation } from "@tabler/icons-react";
import { getUser, getDbInfo, Logs } from "../data/api";
import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [dbInfo, setDbInfo] = useState(null);
  const logsPerPage = 20;
  const [logPage, setLogPage] = useState(1);
  const [logs, setLogs] = useState(null);

  const companies = [];
  useEffect(() => {
    const fetchData = async () => {
      setUserInfo(await getUser());
      setDbInfo(await getDbInfo());
    };

    fetchData();
    const from = (logPage - 1) * logsPerPage;
    const to = from + logsPerPage;
    setLogs(Logs.slice(from, to));
  }, [logPage]);

  return (
    <>
      <Title order={3} mb="lg">
        Dashboard
      </Title>
      <SimpleGrid cols={2}>
        <div>
          <Title order={4} mb="lg">
            User Info
          </Title>
          {userInfo != null && (
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon color="orange" size={24} radius="xl">
                    <IconFlame style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                Cloudflare Colocation: {userInfo.colo}
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconLocation style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                Your Location: {userInfo.city}, {userInfo.region}{" "}
                {userInfo.country}
              </List.Item>
            </List>
          )}
        </div>
        <div>
          <Title order={4} mb="lg">
            Database
          </Title>
          {dbInfo != null && (
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconDatabase style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                pgEdge Nearest Node: {dbInfo.nodes[dbInfo.nearest].city},{" "}
                {dbInfo.nodes[dbInfo.nearest].country.toUpperCase()}
              </List.Item>
              <List.Item
                icon={
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <IconClock style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                Latency: {dbInfo.nodes[dbInfo.nearest].latency}ms
              </List.Item>
            </List>
          )}
        </div>
      </SimpleGrid>
      <Space h="md"></Space>
      <Title order={4} mb="lg">
        DB Logs
      </Title>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        minHeight={200}
        page={logPage}
        recordsPerPage={logsPerPage}
        onPageChange={(p) => setLogPage(p)}
        totalRecords={Logs.length}
        columns={[
          { accessor: "query" },
          { accessor: "results" },
          {
            accessor: "executionTime",
            render: ({ executionTime }) => `${executionTime}ms`,
          },
        ]}
        records={logs}
      />
    </>
  );
}
