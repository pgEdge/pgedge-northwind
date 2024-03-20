import { Text, Card, useMantineTheme, Group } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import classes from './StatusCard.module.css';
import { useEffect, useState } from 'react';
import { DbInfo, getDbInfo } from '@/app/data/api';
import Image from 'next/image';

export function StatusCard({ isVisible }: { isVisible: boolean }) {
  const theme = useMantineTheme();
  const [isVisibleDelayed, setIsVisibleDelayed] = useState(isVisible);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [latencyData, setLatencyData] = useState({});
  const [latencyTextColors, setLatencyTextColors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDbInfo = async () => {
      setDbInfo(await getDbInfo());
    };

    fetchDbInfo();
    const interval = setInterval(fetchDbInfo, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dbInfo) {
      const latencyDataVar: any = { ...latencyData };
      const latencyTextColorsVar: Record<string, string> = { ...latencyTextColors };

      Object.entries(dbInfo.nodes).forEach(([nodeId, nodeData]) => {
        if (!latencyDataVar[nodeId]) {
          latencyDataVar[nodeId] = [];
          latencyTextColorsVar[nodeId] = 'gray.5'; // Initialize with neutral color
        }

        latencyDataVar[nodeId].push(nodeData.latency);

        const latencyValues = latencyDataVar[nodeId];
        const firstValue = latencyValues[0];
        const lastValue = latencyValues[latencyValues.length - 1];

        if (lastValue > firstValue) {
          latencyTextColorsVar[nodeId] = 'red.6';
        } else if (lastValue < firstValue) {
          latencyTextColorsVar[nodeId] = 'teal.6';
        } else {
          latencyTextColorsVar[nodeId] = 'gray.5';
        }
      });

      setLatencyData(latencyDataVar);
      setLatencyTextColors(latencyTextColorsVar);
    }
  }, [dbInfo]);



  useEffect(() => {
    if (!isVisible) {
      const timeoutId = setTimeout(() => setIsVisibleDelayed(false), 500);
      return () => clearTimeout(timeoutId);
    }
    setIsVisibleDelayed(true);
  }, [isVisible]);

  if (!dbInfo) {
    return null;
  }

  return (
    <>
      {isVisibleDelayed && (
        <Card
          style={{
            position: 'absolute',
            top: 50,
            left: 10,
            zIndex: 9999,
            height: '230px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            // flexWrap: 'wrap',
            gap: '10px',
          }}

          withBorder
          p="xl"
          radius="md"

          miw={300}
          className={`${classes.card} ${isVisible ? classes.slideInLeft : classes.slideOutLeftClass
            }`}
        >
          {Object.entries(dbInfo.nodes).map(([nodeId, nodeData]) => (
            <Card.Section withBorder inheritPadding py="xs"
              key={nodeId}
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 0,
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  backgroundColor: nodeData.status ? 'green' : 'red',
                }}
              />
              <div className={classes.inner}>
                <div style={{ width: '100%' }}>
                  <Text fz="md" className={classes.label}>
                    {nodeId}
                  </Text>
                  <Group justify="space-between">
                    <Text mt={5} size='13px' color='gray' w={130}>
                      {nodeData.city}, {nodeData.country}
                    </Text>
                    <Card.Section display={'flex'}>
                      <Sparkline
                        w={50}
                        h={30}
                        mr={10}
                        data={latencyData[nodeId] || []}
                        trendColors={{ positive: 'red.6', negative: 'teal.6', neutral: 'gray.5' }}
                        fillOpacity={0.2}
                        curveType='natural'
                        strokeWidth={2}
                      />
                      <Text mt={5} size='13px' mr={5} color={latencyTextColors[nodeId]}>
                        {nodeData.latency}ms
                      </Text>
                      <Image src="/database-orange.png" style={{marginTop: 5}} width={14} height={15} alt="map pin" />
                    </Card.Section>
                  </Group>
                </div>
              </div>
            </Card.Section>
          ))}
        </Card>
      )}
    </>
  );
}