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
  Text,
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
              header={{ height: 40 }}
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
                  <Title pt={2} pl={15} order={3}><strong>Northwind</strong> Traders</Title>
                </Flex>
              </AppShell.Header>

              <AppShell.Navbar p="md">
                <NavbarSimple></NavbarSimple>
              </AppShell.Navbar>

              <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
          </MantineProvider>
        </body>
      </html>
    </>
  );
}
