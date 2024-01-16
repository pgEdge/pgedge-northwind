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
  Checkbox,
  Flex,
  Tooltip,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import {
  IconClock,
  IconDatabase,
  IconFlame,
  IconLocation,
} from "@tabler/icons-react";
import { Logs, Session, getRecentSessions } from "../data/api";
import { UserInfoContext, DbInfoContext } from "../context";
import React, { useState, useEffect, useContext } from "react";
import { default as DbMap } from "../components/Map/Map";
import { CFPin, RegionPin, UserPin } from "../components/MapMarker/MapMarker";

export default function Dashboard() {
  const userInfo = useContext(UserInfoContext);
  const dbInfo = useContext(DbInfoContext);

  const mapEnabled = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? true : false;
  const [otherSessions, setOtherSessions] = useState<Session[] | null>(null);
  const [showOtherSessions, setShowOtherSessions] = useState(true);
  useEffect(() => {
    const fetchRecentSessions = async () => {
      const res = await getRecentSessions();
      setOtherSessions(res.data);
    };

    fetchRecentSessions();
  }, []);

  const logsPerPage = 20;
  const [logPage, setLogPage] = useState(1);
  const [logs, setLogs] = useState<any[]>([]);

  let markers = [];
  const connections = [];

  let sessionConnections = [];
  const dbMarkers = new Map<string, any>();
  if (mapEnabled) {
    if (dbInfo != null && userInfo != null) {
      //Push the current user into the Map, connected with the nearest node
      const userMarker = {
        location: {
          latitude: userInfo.lat,
          longitude: userInfo.long,
        },
        render: () => <UserPin />,
      };
      markers.push(userMarker);

      const coloMarker = {
        location: {
          latitude: userInfo.colo_lat,
          longitude: userInfo.colo_long,
        },
        render: () => <CFPin color={"orange"} />,
      };
      markers.push(coloMarker);

      //Connect the user with the CF colocation
      sessionConnections.push([userMarker, coloMarker]);

      //Push all the nodes into the map
      for (const [node, nodeInfo] of Object.entries(dbInfo.nodes)) {
        const nodeMarker = {
          location: {
            latitude: nodeInfo.lat,
            longitude: nodeInfo.long,
          },
          render: () => <RegionPin isSelected label={node} />,
        };
        markers.push(nodeMarker);
        dbMarkers.set(node, nodeMarker);

        //Connect the colocation with the nearest DB node
        if (dbInfo.nearest == node) {
          sessionConnections.push([coloMarker, nodeMarker]);
        }
      }

      //Connect all the DB nodes
      // @ts-ignore
      sessionConnections.push([...dbMarkers.values()]);

      // Push other sessions into the map, connecting them with their nearest node
      if (otherSessions && showOtherSessions) {
        for (const session of otherSessions) {
          if (
            userInfo.lat != session.user_data.lat &&
            userInfo.long != session.user_data.long
          ) {
            const sessionUserMarker = {
              location: {
                latitude: session.user_data.lat,
                longitude: session.user_data.long,
              },
              render: () => <UserPin color={"grey"} />,
            };
            markers.push(sessionUserMarker);

            const sessionColoMarker = {
              location: {
                latitude: session.user_data.colo_lat,
                longitude: session.user_data.colo_long,
              },
              render: () => <CFPin color={"grey"} />,
            };
            markers.push(sessionColoMarker);

            sessionConnections.push([sessionUserMarker, sessionColoMarker]);

            const dbMarker = dbMarkers.get(
              session.user_data.pgedge_nearest_node
            );
            if (dbMarker) {
              sessionConnections.push([sessionColoMarker, dbMarker]);
            }
          }
        }
      }
    }

    for (const connectionSet of sessionConnections) {
      connections.push(connectionSet);
    }
  }

  useEffect(() => {
    const from = (logPage - 1) * logsPerPage;
    const to = from + logsPerPage;
    setLogs(Logs.slice(from, to));
  }, [logPage]);

  return (
    <>
      <Flex mb="lg">
        <Title order={3}>Dashboard</Title>
        <Checkbox
          checked={showOtherSessions}
          onChange={(event) =>
            setShowOtherSessions(event.currentTarget.checked)
          }
          label="Show Other Sessions?"
          ml="auto"
          pt="7"
          size="xs"
        />
      </Flex>
      <Box mb="lg">
        {mapEnabled && (
          <DbMap
            height={400}
            markers={markers}
            connections={connections}
            enableClustering={false}
            // viewResetDeps={[router.query.databaseId]}
          />
        )}
      </Box>
      <SimpleGrid cols={3}>
        <div>
          <Title order={4} mb="lg">
            User
          </Title>
          {userInfo == null && <Loader color="rgb(21, 170, 191)"></Loader>}
          {userInfo != null && (
            <List spacing="xs" size="xs" center>
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
            <List spacing="xs" size="xs" center>
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
                    <IconLocation style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                {userInfo.colo_name}
              </List.Item>
              <Tooltip label="This is the latency from the user to the Cloudflare Colocation">
                <List.Item
                  icon={
                    <ThemeIcon color="orange" size={24} radius="xl">
                      <IconClock style={{ width: rem(16), height: rem(16) }} />
                    </ThemeIcon>
                  }
                >
                  {userInfo.colo_latency}
                  <em>ms</em>
                </List.Item>
              </Tooltip>
            </List>
          )}
        </div>
        <div>
          <Title order={4} mb="lg">
            pgEdge
          </Title>
          {dbInfo == null && <Loader></Loader>}
          {dbInfo != null && (
            <>
              <List spacing="xs" size="xs" center>
                <List.Item
                  icon={
                    <ThemeIcon color="yellow" size={24} radius="xl">
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
                    <ThemeIcon color="yellow" size={24} radius="xl">
                      <IconLocation
                        style={{ width: rem(16), height: rem(16) }}
                      />
                    </ThemeIcon>
                  }
                >
                  {dbInfo.nodes[dbInfo.nearest].city},{" "}
                  {dbInfo.nodes[dbInfo.nearest].state && (
                    <>{dbInfo.nodes[dbInfo.nearest].state.toUpperCase()}, </>
                  )}
                  {dbInfo.nodes[dbInfo.nearest].country.toUpperCase()}
                </List.Item>
                <Tooltip label="This is the latency from the Cloudflare Colocation to the nearest pgEdge Node">
                  <List.Item
                    icon={
                      <ThemeIcon color="yellow" size={24} radius="xl">
                        <IconClock
                          style={{ width: rem(16), height: rem(16) }}
                        />
                      </ThemeIcon>
                    }
                  >
                    {dbInfo.nodes[dbInfo.nearest].latency}
                    <em>ms</em>
                  </List.Item>
                </Tooltip>
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
