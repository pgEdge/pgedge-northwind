import { Text, Card, useMantineTheme } from '@mantine/core';
import { Sparkline } from '@mantine/charts';
import classes from './StatusCard.module.css';
import { useEffect, useState } from 'react';
import { DbInfo, getDbInfo } from '@/app/data/api';

export function StatusCard({ isVisible }: { isVisible: boolean }) {
  const theme = useMantineTheme();
  const [isVisibleDelayed, setIsVisibleDelayed] = useState(isVisible);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [latencyData, setLatencyData] = useState({})

  useEffect(() => {
    const fetchDbInfo = async () => {
      setDbInfo(await getDbInfo());
    };
    fetchDbInfo();
    const interval = setInterval(fetchDbInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dbInfo) {
      const latencyDataVar: any = { ...latencyData }; 
      Object.entries(dbInfo.nodes).forEach(([nodeId, nodeData]) => {
        if (!latencyDataVar[nodeId]) {
          latencyDataVar[nodeId] = []; 
        }
        latencyDataVar[nodeId].push(nodeData.latency); 
      });

      setLatencyData(latencyDataVar);
    }
  }, [dbInfo, latencyData]);

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
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            zIndex: 9999,
            height: "400px",
            overflow: "auto",
          }}
        >
          {Object.entries(dbInfo.nodes).map(([nodeId, nodeData]) => (
            <Card
              key={nodeId}
              withBorder
              p="xl"
              radius="md"
              mb={'10'}
              style={{ boxShadow: "3px 3px 5px 0.1px rgba(0, 0, 0, 0.1" }}
              className={`${classes.card} ${isVisible ? classes.slideInLeft : classes.slideOutLeftClass}`}
            >
              <div className={classes.inner}>
                <div>
                  <Text fz="xl" className={classes.label}>
                    {nodeId}
                  </Text>
                  <Text mt={10}>
                    <span className={classes.label}>Location:</span> {nodeData.city}, {nodeData.state + ',' || ''} {nodeData.country}
                  </Text>
                  <Text mt={5}>
                    <span className={classes.label}>Latency:</span> {nodeData.latency}ms
                    <Sparkline
                      w={50}
                      h={30}
                      data={latencyData[nodeId] || []}
                      trendColors={{ positive: 'teal.6', negative: 'red.6', neutral: 'gray.5' }}
                      fillOpacity={0.2}
                    />
                  </Text>
                  <Text mt={5}>
                    <span className={classes.label}>Status:</span> Online
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}