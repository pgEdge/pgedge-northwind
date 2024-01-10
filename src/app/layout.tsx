'use client'

import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';

import { ColorSchemeScript, MantineProvider, Burger, AppShell, Text} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavbarSimple } from './components/NavbarSimple/NavbarSimple';


export default function Document({
  children,
}: {
  children: React.ReactNode
}) {

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
            header={{ height: 60 }}
            navbar={{
              width: 300,
              breakpoint: 'sm',
              collapsed: { mobile: !opened },
            }}
            padding="md"
          >
            <AppShell.Header>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
              />
              <Text size="lg" fw={700}>
                Northwind Traders
              </Text>
            </AppShell.Header>

            <AppShell.Navbar p="md"><NavbarSimple></NavbarSimple></AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
            </AppShell>
        </MantineProvider>
      </body>
    </html>
    </>
  )
}
