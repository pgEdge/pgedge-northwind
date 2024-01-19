import { CSSProperties, useEffect, useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { TMapMarker } from "../Map/Map";
import { Box, Text, Tooltip, useMantineTheme } from "@mantine/core";
import Image from "next/image";
// @ts-ignore
import * as turf from "@turf/turf";
import * as z from "zod";
import { IconFlame, IconUserCircle } from "@tabler/icons-react";

const regionSchema = z.object({
  cloud: z.enum(["aws", "google", "azure"]),
  code: z.string(),
  parent: z.string(),
  name: z.string(),
  active: z.boolean(),
  location: z.object({
    // code: z.string(),
    name: z.string(),
    // country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});
export type Region = z.infer<typeof regionSchema>;

export default function MapMarker({
  location,
  render,
  popup,
  onClick,
  priority,
}: TMapMarker) {
  return (
    <Marker
      latitude={location.latitude}
      longitude={location.longitude}
      onClick={onClick}
      style={{
        zIndex: priority,
      }}
    >
      <Tooltip
        openDelay={0}
        closeDelay={0}
        styles={{
          tooltip: {
            padding: 0,
          },
        }}
        label={
          popup ? (
            <Popup
              latitude={location.latitude}
              longitude={location.longitude}
              closeButton={false}
              offset={10}
              style={{
                padding: 0,
              }}
            >
              {popup}
            </Popup>
          ) : null
        }
      >
        <div>{render ? render() : null}</div>
      </Tooltip>
    </Marker>
  );
}

export function UserPin({
  label,
  color: colorInput,
  style,
}: {
  label?: string;
  color?: string;
  style?: CSSProperties;
}) {
  const theme = useMantineTheme();
  const color = colorInput || theme.colors[theme.primaryColor][6];
  return (
    <Box>
      <IconUserCircle style={style} color={color} width={20} height={20} />
      {label && (
        <Text size={"sm"} fw={500} pos="absolute" color={theme.colors.dark[3]}>
          {label}
        </Text>
      )}
    </Box>
  );
}

export function CFPin({
  label,
  color: colorInput,
}: {
  label?: string;
  color?: string;
}) {
  const theme = useMantineTheme();
  const color = colorInput || theme.colors[theme.primaryColor][6];
  return (
    <Box>
      <IconFlame color={color} width={20} height={20} />
      {label && (
        <Text size={"sm"} fw={500} pos="absolute" color={theme.colors.dark[3]}>
          {label}
        </Text>
      )}
    </Box>
  );
}

export function RegionPin({
  label,
  color: colorInput,
  isSelected,
}: {
  label?: string;
  color?: string;
  isSelected?: boolean;
}) {
  const theme = useMantineTheme();
  const color = colorInput || theme.colors[theme.primaryColor][6];
  return isSelected ? (
    <Box>
      <Image src="/database-orange.png" width={14} height={15} alt="map pin" />
      {label && (
        <Text size={"sm"} fw={500} pos="absolute" color={theme.colors.dark[3]}>
          {label}
        </Text>
      )}
    </Box>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 20 20"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 0L20 5.7735V14.2265L10 20L0 14.2265V5.7735L10 0Z"
        fill={color}
        opacity={0.8}
      />
    </svg>
  );
}
export function RegionPinPopup({
  point,
  maskCloudProvider,
}: {
  point: Pick<Region, "code" | "name" | "location">;
  maskCloudProvider?: boolean;
}) {
  return (
    <Box bg="transparent" color="dark">
      <Text size="xs" fw={600} style={{ lineBreak: "anywhere" }} color="dark">
        {maskCloudProvider || !point.name ? "pgedge-" + point.code : point.name}
      </Text>

      <Text size="xs" color="dark">
        {point.location.name}
      </Text>
    </Box>
  );
}

// connection marker that moves from one point to another
export function ConnectionMarker({
  marker,
  destination,
  bidirectional,
}: {
  marker: TMapMarker;
  destination: TMapMarker;
  bidirectional?: boolean;
}) {
  const theme = useMantineTheme();
  const [coordinates, setCoordinates] = useState([
    marker.location.longitude,
    marker.location.latitude,
  ]);

  // animate marker directly in a straight line (not arc) from start to end and back in a loop, if reverse is true, animate from end to start
  useEffect(() => {
    let line: turf.Feature<turf.LineString>;
    if (bidirectional) {
      line = turf.lineString([
        [marker.location.longitude, marker.location.latitude],
        [destination.location.longitude, destination.location.latitude],
        [marker.location.longitude, marker.location.latitude],
      ]);
    } else {
      line = turf.lineString([
        [marker.location.longitude, marker.location.latitude],
        [destination.location.longitude, destination.location.latitude],
      ]);
    }

    const distance = turf.length(line, { units: "miles" });

    const steps = 80;
    const step = distance / steps;

    let counter = 0;
    const interval = setInterval(() => {
      if (counter < distance) {
        const point = turf.along(line, counter, { units: "miles" });
        setCoordinates(point.geometry.coordinates);
        counter += step;
      } else {
        counter = 0;
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <MapMarker
      render={() => (
        <svg
          width={5}
          height={7}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="2.5" cy="2.5" r="2.5" fill={theme.colors.dark[3]} />
        </svg>
      )}
      {...marker}
      location={{ latitude: coordinates[1], longitude: coordinates[0] }}
    />
  );
}
