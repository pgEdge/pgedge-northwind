"use client";

import {
  Title,
  List,
  ThemeIcon,
  rem,
  SimpleGrid,
  Space,
  Loader,
  Box,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import {
  IconClock,
  IconDatabase,
  IconFlame,
  IconLocation,
} from "@tabler/icons-react";
import { Logs } from "../data/api";
import { UserInfoContext, DbInfoContext } from "../context";
import React, { useState, useEffect, useContext } from "react";
import Map from "../components/Map/Map";
import {
  RegionPin,
  RegionPinPopup,
  UserPin,
} from "../components/MapMarker/MapMarker";

export default function Dashboard() {
  const userInfo = useContext(UserInfoContext);
  const dbInfo = useContext(DbInfoContext);

  const logsPerPage = 20;
  const [logPage, setLogPage] = useState(1);
  const [logs, setLogs] = useState<any[]>([]);

  let markers = [];
  let primaryConnections = [];
  let secondaryConnections = [];
  if (dbInfo != null && userInfo != null) {
    for (const [node, nodeInfo] of Object.entries(dbInfo.nodes)) {
      const marker = {
        location: {
          latitude: nodeInfo.lat,
          longitude: nodeInfo.long,
        },
        render: () => <RegionPin isSelected label={node} />,
      };
      markers.push(marker);

      if (dbInfo.nearest == node) {
        primaryConnections.push(marker);
      }

      secondaryConnections.push(marker);
    }

    if (userInfo != null) {
      const marker = {
        location: {
          latitude: userInfo.lat,
          longitude: userInfo.long,
        },
        render: () => <UserPin />,
      };
      markers.push(marker);
      primaryConnections.push(marker);
    }

    const otherUserMarker = {
      location: {
        latitude: 40.4168,
        longitude: 3.7038,
      },
      render: () => <UserPin color={"grey"} />,
    };

    markers.push(otherUserMarker);
  }

  const connections = [primaryConnections, secondaryConnections];

  useEffect(() => {
    const from = (logPage - 1) * logsPerPage;
    const to = from + logsPerPage;
    setLogs(Logs.slice(from, to));
  }, [logPage]);

  return (
    <>
      <Title order={3} mb="lg">
        Dashboard
      </Title>
      <Box mb="lg">
        <Map
          height={400}
          markers={markers}
          connections={connections}
          enableClustering={false}
          // viewResetDeps={[router.query.databaseId]}
        />
      </Box>
      <SimpleGrid cols={3}>
        <div>
          <Title order={4} mb="lg">
            User
          </Title>
          {userInfo == null && <Loader color="rgb(21, 170, 191)"></Loader>}
          {userInfo != null && (
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon color="rgb(21, 170, 191)" size={24} radius="xl">
                    <IconLocation style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                {userInfo.city}, {userInfo.region}, {userInfo.country}
              </List.Item>
            </List>
          )}
        </div>
        <div>
          <Title order={4} mb="lg">
            Cloudflare® 
          </Title>
          {userInfo == null && <Loader></Loader>}
          {userInfo != null && (
            <List spacing="xs" size="sm" center>
              <List.Item
                icon={
                  <ThemeIcon color="orange" size={24} radius="xl">
                    <IconFlame style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                Cloudflare {userInfo.colo}
              </List.Item>
              <List.Item
                  icon={
                    <ThemeIcon color="orange" size={24} radius="xl">
                      <IconLocation
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    </ThemeIcon>
                  }
                >
                  {userInfo.colo_name}
                </List.Item>
              <List.Item
                icon={
                  <ThemeIcon color="orange" size={24} radius="xl">
                    <IconClock style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                {userInfo.colo_latency}<em>ms</em>
              </List.Item>
            </List>
          )}
        </div>
        <div>
          <Title order={4} mb="lg">
            pgEdge
          </Title>
          {dbInfo == null && <Loader color="rgb(21, 170, 191)"></Loader>}
          {dbInfo != null && (
            <>
              <List spacing="xs" size="sm" center>
                <List.Item
                  icon={
                    <ThemeIcon color="rgb(21, 170, 191)" size={24} radius="xl">
                      <IconDatabase
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    </ThemeIcon>
                  }
                >
                  pgEdge {dbInfo.nearest.toUpperCase()}
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="rgb(21, 170, 191)" size={24} radius="xl">
                      <IconLocation
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    </ThemeIcon>
                  }
                >
                  {dbInfo.nodes[dbInfo.nearest].city},{" "}
                  {dbInfo.nodes[dbInfo.nearest].state && <>{dbInfo.nodes[dbInfo.nearest].state.toUpperCase()},{" "}</>}                  
                  {dbInfo.nodes[dbInfo.nearest].country.toUpperCase()}
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="rgb(21, 170, 191)" size={24} radius="xl">
                      <IconClock style={{ width: rem(16), height: rem(16) }} />
                    </ThemeIcon>
                  }
                >
                  {dbInfo.nodes[dbInfo.nearest].latency}<em>ms</em>
                </List.Item>
              </List>
            </>
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
