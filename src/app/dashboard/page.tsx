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
  useMantineTheme,
  Card,
  Button,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import {
  IconClock,
  IconDatabase,
  IconFlame,
  IconLocation,
  IconUser,
  IconActivity
} from "@tabler/icons-react";
import { Logs, Session, getRecentSessions } from "../data/api";
import { UserInfoContext, DbInfoContext } from "../context";
import React, { useState, useEffect, useContext } from "react";
import { default as DbMap } from "../components/Map/Map";
import { CFPin, RegionPin, UserPin } from "../components/MapMarker/MapMarker";
import { StatusCard } from "../components/StatusCard/StatusCard";

export default function Dashboard() {
  const userInfo = useContext(UserInfoContext);
  const dbInfo = useContext(DbInfoContext);

  const theme = useMantineTheme();


  const mapEnabled = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? true : false;
  const [otherSessions, setOtherSessions] = useState<Session[] | null>(null);
  const [showOtherSessions, setShowOtherSessions] = useState(true);
  const [showCards, setShowCards] = useState(false);
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

  const markers = [];
  const connections = [];
  const connectionSets = [];
  const nodeMarkers = new Map<string, any>();
  const coloMarkers = new Map<string, any>();
  if (mapEnabled) {
    if (dbInfo != null && userInfo != null) {
      //Push the current user into the Map, connected with the nearest node
      const userMarker = {
        location: {
          latitude: userInfo.lat,
          longitude: userInfo.long,
        },
        priority: 4,
        render: () => <UserPin />,
      };
      markers.push(userMarker);

      let coloMarker = coloMarkers.get(userInfo.colo);
      if (coloMarker == undefined) {
        coloMarker = {
          location: {
            latitude: userInfo.colo_lat,
            longitude: userInfo.colo_long,
          },
          priority: 3,
          render: () => <CFPin color={"orange"} />,
        };

        coloMarkers.set(userInfo.colo, coloMarker);
        markers.push(coloMarker);
      }

      //Connect the user with the CF colocation
      connectionSets.push([userMarker, coloMarker]);

      //Push all the nodes into the map
      for (const [node, nodeInfo] of Object.entries(dbInfo.nodes)) {
        const nodeMarker = {
          location: {
            latitude: nodeInfo.lat,
            longitude: nodeInfo.long,
          },
          priority: 5,
          render: () => <RegionPin isSelected label={node} />,
        };
        markers.push(nodeMarker);
        nodeMarkers.set(node, nodeMarker);

        //Connect the colocation with the nearest DB node
        if (dbInfo.nearest == node) {
          connectionSets.push([coloMarker, nodeMarker]);
        }
      }

      console.log(markers);
      //Connect all the DB nodes
      // @ts-ignore
      connectionSets.push([...nodeMarkers.values()]);

      if (otherSessions && showOtherSessions) {
        const dedupedSessions = otherSessions.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.user_data.long === value.user_data.long &&
                t.user_data.lat === value.user_data.lat,
            ),
        );

        // Push other sessions into the map, connecting them with their nearest node
        for (const session of dedupedSessions) {
          if (
            userInfo.lat != session.user_data.lat &&
            userInfo.long != session.user_data.long
          ) {
            const sessionUserMarker = {
              location: {
                latitude: session.user_data.lat,
                longitude: session.user_data.long,
                priority: 1,
              },
              render: () => <UserPin />,
            };
            markers.push(sessionUserMarker);

            let sessionColoMarker = coloMarkers.get(session.user_data.colo);
            if (sessionColoMarker == undefined) {
              sessionColoMarker = {
                location: {
                  latitude: session.user_data.colo_lat,
                  longitude: session.user_data.colo_long,
                  priority: 2,
                },
                render: () => <CFPin color={"orange"} />,
              };
              coloMarkers.set(session.user_data.colo, sessionColoMarker);
              markers.push(sessionColoMarker);
            }

            connectionSets.push([sessionUserMarker, sessionColoMarker]);

            const dbMarker = nodeMarkers.get(
              session.user_data.pgedge_nearest_node,
            );
            if (dbMarker) {
              connectionSets.push([sessionColoMarker, dbMarker]);
            }
          }
        }
      }
    }

    for (const connectionSet of connectionSets) {
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
      <Box mb="lg" style={{ position: "relative" }}>
        {mapEnabled && (
          <>
            <DbMap
              height={500}
              markers={markers}
              connections={connections}
              enableClustering={false}
            />

            <StatusCard isVisible={showCards}></StatusCard>
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 9999,
              }}
            >
              {dbInfo !== null && (
                <Button
                  size="xs"
                  variant="default"
                  style={{
                    boxShadow: "3px 3px 5px 0.1px rgba(0, 0, 0, 0.1)",
                    opacity: dbInfo ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                  }}
                  onClick={() => setShowCards(!showCards)}
                >
                  <IconActivity
                    size={22}
                    strokeWidth={2}
                    color={'black'}
                  />
                </Button>
              )} 
            </div>
          </>
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
                    <IconUser style={{ width: rem(16), height: rem(16) }} />
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
