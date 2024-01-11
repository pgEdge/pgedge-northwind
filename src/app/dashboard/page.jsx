import { Title, Text } from '@mantine/core';
import { getUser, getDbInfo } from '../data/api';

export const runtime = 'edge';

export default async function Dashboard() {

  const userInfo = JSON.stringify(await getUser())
  const dbInfo = JSON.stringify(await getDbInfo())
  return (
      <>
        <Title order={3}>Dashboard</Title>
        <Title order={4}>User Info</Title>
        <Text>{userInfo}</Text>
        <Title order={4}>DB Info</Title>
        <Text>{dbInfo}</Text>
      </>
  )
}
