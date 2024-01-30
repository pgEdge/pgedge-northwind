import { Title, Text, Anchor, Paper, Center, Box } from "@mantine/core";
import classes from "./Home.module.css";

export default function Home() {
  return (
    <>
      <Center>
        <Paper maw={800} p="xl" className={classes.jumbotron}>
          <Title mb="lg" order={3} className={classes.title}>
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
          <Text>
            Use the navigation to browse Supplies, Products, Orders, Customers,
            and Employees, and view the resulting query performance statistics
            on the <Anchor href="/dashboard">Dashboard</Anchor>.
          </Text>
        </Paper>
      </Center>
      <Box px="md" py="md">
        <Text size="xs">
          Cloudflare, the Cloudflare logo, and Cloudflare Workers are trademarks
          and/or registered trademarks of Cloudflare, Inc. in the United States
          and other jurisdictions.
        </Text>
      </Box>
    </>
  );
}
