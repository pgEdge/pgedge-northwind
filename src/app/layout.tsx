"use client";

import "@mantine/core/styles.css";
import "mantine-datatable/styles.layer.css";

import {
  Flex,
  ColorSchemeScript,
  MantineProvider,
  Title,
  Burger,
  AppShell,
  Box,
  Image,
  Text,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useState, useEffect } from "react";
import { NavbarSimple } from "./components/NavbarSimple/NavbarSimple";
import { UserInfo, DbInfo, getUser, getDbInfo } from "./data/api";
import { DbInfoContext, UserInfoContext } from "./context";

export default function Document({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  useEffect(() => {
    const fetchData = async () => {    
      setUserInfo(await getUser());
      setDbInfo(await getDbInfo());      
    };

    fetchData();
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
                    <Flex>
                      <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="md"
                      />
                      <Title pt={7} pl={25} order={3}>
                        <strong>Northwind</strong> Traders
                      </Title>
                      <Flex align="center" ml="auto">
                        <Text size="sm" fw={500}>
                          Powered By
                        </Text>
                        <Image
                          src={`/pgEdge_Cloud_logo_light_mode.png`}
                          h={50}
                          w="auto"
                          alt="pgEdge logo"
                          ml="auto"
                        />
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
