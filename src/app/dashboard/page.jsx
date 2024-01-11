import { Title, Text } from '@mantine/core';

export const runtime = 'edge';
import { getUser, getDbInfo } from '../data/api';

export default async function Dashboard() {

  // const userInfo = JSON.stringify(await getUser())
  // const dbInfo = JSON.stringify(await getDbInfo())
  return (
      <>
        <Title order={3}>Dashboard</Title>
        <Title order={4}>Env</Title>
        <Text>{process.env}</Text>
      </>
  )
}
