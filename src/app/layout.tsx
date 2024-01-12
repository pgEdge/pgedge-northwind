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
  Text
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavbarSimple } from "./components/NavbarSimple/NavbarSimple";

export default function Document({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body>
          <MantineProvider>
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
                    <Text size="sm">Powered By</Text>
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
          </MantineProvider>
        </body>
      </html>
    </>
  );
}
