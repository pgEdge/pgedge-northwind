"use client";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";

import {
  Flex,
  ColorSchemeScript,
  MantineProvider,
  Burger,
  AppShell,
  Box,
  Image,
  Text,
  rem,
  Container
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState, useEffect } from "react";
import { NavbarSimple } from "./components/NavbarSimple/NavbarSimple";
import { UserInfo, DbInfo, getUserInfo, getDbInfo } from "./data/api";
import { DbInfoContext, UserInfoContext } from "./context";

export default function Document({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  useEffect(() => {
    const fetchDbInfo = async () => {    
      setDbInfo(await getDbInfo());      
    };
    const fetchUserInfo = async () => {    
      setUserInfo(await getUserInfo());      
    };

    fetchDbInfo();
    fetchUserInfo();
  }, []);

  return (
    <>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body>
          <MantineProvider
            theme={{
              primaryColor: "cyan",
              fontSizes: {
                xs: rem(14),
                sm: rem(16),
                md: rem(18),
                lg: rem(20),
                xl: rem(22),
              },
            }}
          >
            <UserInfoContext.Provider value={userInfo}>
              <DbInfoContext.Provider value={dbInfo}>
                <AppShell
                  header={{ height: 50 }}
                  navbar={{
                    width: 300,
                    breakpoint: "sm",
                    collapsed: { mobile: !opened },
                  }}
                  padding="md"
                >
                  <AppShell.Header>
                    <Flex align="center" h={50}>
                      <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="md"
                      />
                      <Text pl={25} size={"lg"} span={true}>
                        <strong>Northwind</strong> Traders
                      </Text>
                      <Flex align="center" ml="auto">
                        <Text size="xs" fw={500} visibleFrom="md">
                          Powered By
                        </Text>
                        <Container>
                          <Image
                            src={`/pgEdge_Cloud_logo_light_mode.png`}
                            h={30}
                            alt="pgEdge logo"
                            ml="auto"
                          />
                          <Text size="xs" ta="center" visibleFrom="md" pr={5}>Cloudflare®</Text>
                        </Container>
                      </Flex>
                    </Flex>
                  </AppShell.Header>

                  <AppShell.Navbar p="md">
                    <NavbarSimple></NavbarSimple>
                  </AppShell.Navbar>

                  <AppShell.Main>
                    {" "}
                    <Box py="lg" px="md">
                      {children}
                    </Box>
                  </AppShell.Main>
                </AppShell>
              </DbInfoContext.Provider>
            </UserInfoContext.Provider>
          </MantineProvider>
        </body>
      </html>
    </>
  );
}
