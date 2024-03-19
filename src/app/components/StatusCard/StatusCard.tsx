import { Text, Card, useMantineTheme } from '@mantine/core';
import classes from './StatusCard.module.css';
import { useEffect, useState } from 'react';
import { DbInfo, getDbInfo } from '@/app/data/api';

export function StatusCard({ isVisible }: { isVisible: boolean }) {
  const theme = useMantineTheme();
  const [isVisibleDelayed, setIsVisibleDelayed] = useState(isVisible);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  useEffect(() => {
    const fetchDbInfo = async () => {
      setDbInfo(await getDbInfo());
    };
    fetchDbInfo();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      const timeoutId = setTimeout(() => setIsVisibleDelayed(false), 500); // 0.5 seconds delay
      return () => clearTimeout(timeoutId); // Cleanup function to clear timeout on unmount
    }
    // Reset visibility if it becomes true again
    setIsVisibleDelayed(true);
  }, [isVisible]);

  if (!dbInfo) {
    return null; // or you can render a loading state
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