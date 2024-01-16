import { Title, Text, Anchor, Grid, GridCol, Image, Box } from "@mantine/core";

export default function Home() {
  return (
    <>
      <Grid>
        <GridCol span={{ base: 12, md: 6 }}>
          <Title mb="lg" order={3}>
            Welcome to Northwind Traders
          </Title>
          <Text mb="lg">
            This is a demo of the Northwind dataset, running on Cloudflare
            Workers® and pgEdge Cloud, a fully-distributed PostgreSQL database,
            deployable across multiple cloud regions or data centers.
          </Text>
          <Text mb="lg">
            You can learn more about pgEdge Cloud{" "}
            <Anchor
              href="https://www.pgedge.com/products/pgedge-cloud"
              target="_blank"
            >
              here
            </Anchor>
            .
          </Text>
          <Text mb="lg">Use the navigation to browse Supplies, Products, Orders, Customers, and Employees, and view the resulting query performance statistics on the <Anchor href="/dashboard">Dashboard</Anchor>.</Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 6 }}>
          <Box
            p={20}
            style={{
              "background-color": "02062b",
            }}
          >
            <Image
              src="/pgedge-logo.png"
              style={{
                "max-width": "500px",
              }}
              alt="pgEdge logo"
            />
          </Box>
        </GridCol>
      </Grid>
      <Text size="xs">
        Cloudflare, the Cloudflare logo, and Cloudflare Workers are trademarks
        and/or registered trademarks of Cloudflare, Inc. in the United States
        and other jurisdictions.
      </Text>
    </>
  );
}
