import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Center,
  Paper,
  SegmentedControl,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import ReactMapGL, {
  NavigationControl,
  Layer,
  Source,
  MapRef,
  Marker,
  useMap,
} from "react-map-gl";
// @ts-ignore
import * as turf from "@turf/turf";
import Supercluster, {
  AnyProps,
  ClusterFeature,
  PointFeature,
} from "supercluster";
import { IconGlobe, IconMap } from "@tabler/icons-react";
import "mapbox-gl/dist/mapbox-gl.css";
import MapMarker from "../MapMarker/MapMarker";
import { group } from "console";

export type TMapMarker = {
  location: {
    latitude: number;
    longitude: number;
  };
  render?: () => ReactNode;
  popup?: ReactNode;
  priority?: number;
  onClick?: (_e: any) => void;
};

type MapProps<T extends TMapMarker> = {
  height: number;
  markers?: T[];
  connections: T[][];
  maskCloudProvider?: boolean;
  viewResetDeps?: any[];
  color?: string;
  enableClustering?: boolean;
};

// Given a set of selected markers, return an array of all possible connections
// between them. E.g. for markers A, B, C, return [AB, AC, BC].
function computeConnections(markers: TMapMarker[]): [TMapMarker, TMapMarker][] {
  const result: [TMapMarker, TMapMarker][] = [];
  for (let i = 0; i < markers.length - 1; i++) {
    for (let j = i + 1; j < markers.length; j++) {
      result.push([markers[i], markers[j]]);
    }
  }
  return result;
}

export function makeMarkerKey(marker: TMapMarker): string {
  return `${marker.location.latitude}-${marker.location.longitude}`;
}

export default function Map<T extends TMapMarker>({
  height = 500,
  markers,
  connections,
  viewResetDeps = [],
  color: colorInput,
  enableClustering = true,
}: MapProps<T>) {
  const theme = useMantineTheme();
  const color = colorInput || theme.colors[theme.primaryColor][6];
  const mapRef = useRef<MapRef>(null);

  const [averageLongitude, averageLatitude] = useMemo(
    () =>
      !markers?.length
        ? [0, 0]
        : turf.center(
            turf.featureCollection(
              (markers || []).map((marker) =>
                turf.point([
                  marker.location.longitude,
                  marker.location.latitude,
                ]),
              ),
            ),
          ).geometry.coordinates,
    [markers],
  );

  const currentProjection = mapRef.current?.getMap().getProjection();

  const initialZoom = useMemo(() => {
    const items = markers || [];
    const defaultZoom = currentProjection?.name === "globe" ? 1 : 0;

    if (items.length === 0) return defaultZoom;

    const distances = items.map((marker) =>
      turf.distance(
        turf.point([averageLongitude, averageLatitude]),
        turf.point([marker.location.longitude, marker.location.latitude]),
      ),
    );
    const maxDistance = Math.max(...distances);

    if (maxDistance < 5000) return 2;
    if (maxDistance < 10000) return 1;
    return defaultZoom;
  }, [
    averageLatitude,
    averageLongitude,
    markers,
    connections,
    currentProjection,
  ]);

  const initialViewState = useMemo(
    () => ({
      latitude: averageLatitude,
      longitude: averageLongitude,
      zoom: initialZoom,
    }),
    [averageLatitude, averageLongitude, initialZoom],
  );

  const { points, clusters, setZoom } = useMapClusters({
    markers,
    initialZoom: initialViewState.zoom,
  });

  const resetView = useCallback(() => {
    mapRef.current?.easeTo({
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      duration: 300,
    });
  }, [initialViewState]);

  const straightConnectionLines = useMemo(() => {
    let allConnections: [TMapMarker, TMapMarker][] = [];

    connections.forEach((connection) => {
      allConnections = allConnections.concat(
        computeConnections(connection || []).map(([start, end]) =>
          turf.lineString([
            [start.location.longitude, start.location.latitude],
            [end.location.longitude, end.location.latitude],
          ]),
        ),
      );
    });

    return allConnections;
  }, [connections]);

  const [mapPojection, setProjection] = useState<string>("mercator");
  const mapStyle = useMemo(() => {
    return mapPojection === "mercator"
      ? `mapbox://styles/mapbox/light-v9`
      : "mapbox://styles/mapbox/streets-v12";
  }, [mapPojection]);

  // pan to initial center and zoom when viewResetDeps or map projection changes
  useEffect(() => {
    resetView();
  }, [resetView, mapPojection, viewResetDeps]);

  return (
    <Box h={height} pos="relative">
      <ReactMapGL
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
        mapStyle={mapStyle}
        renderWorldCopies={false}
        initialViewState={initialViewState}
        attributionControl={false}
        fadeDuration={0}
        ref={mapRef}
      >
        <NavigationControl showZoom showCompass={false} />

        {enableClustering ? (
          clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const {
              cluster: isCluster,
              marker,
              point_count,
            } = cluster.properties;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-${cluster.id}`}
                  longitude={longitude}
                  latitude={latitude}
                >
                  <Paper
                    style={{
                      width: `${10 + (point_count / points.length) * 20}px`,
                      height: `${10 + (point_count / points.length) * 20}px`,
                      borderRadius: "50%",
                      borderColor: color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.colors[theme.primaryColor][9],
                    }}
                    bg={"rgba(255,255,255,0.3)"}
                    p="md"
                    withBorder
                  >
                    <Text fw={700} size="sm" color={color}>
                      {point_count}
                    </Text>
                  </Paper>
                </Marker>
              );
            }

            return (
              <MapMarker key={`marker-${makeMarkerKey(marker)}`} {...marker} />
            );
          })
        ) : (
          <>
            {markers?.map((marker) => (
              <MapMarker key={`marker-${makeMarkerKey(marker)}`} {...marker} />
            ))}
          </>
        )}

        {connections && connections.length > 1 && (
          <>
            <Source
              id="connection-source"
              type="geojson"
              data={{
                type: "FeatureCollection",
                // @ts-ignore
                features: straightConnectionLines,
              }}
            >
              <Layer
                {...{
                  id: "connection-line",
                  type: "line",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": theme.colors.dark[3],
                    "line-width": 1,
                    "line-dasharray": [2, 3],
                  },
                }}
              />
            </Source>
          </>
        )}
      </ReactMapGL>

      <Tooltip label="change projection" position="bottom" withArrow>
        <Box
          pos="absolute"
          bottom={8}
          right={8}
          style={{
            borderRadius: 5,
            border: `2px solid rgba(0,0,0,0.1)`,
          }}
        >
          <SegmentedControl
            p={2}
            size="xs"
            orientation="vertical"
            value={mapPojection}
            onChange={(projection) => setProjection(projection)}
            data={[
              {
                value: "globe",
                label: (
                  <Center p={4}>
                    <IconGlobe
                      size={19}
                      strokeWidth={2.3}
                      color={theme.colors.dark[5]}
                    />
                  </Center>
                ),
              },
              {
                value: "mercator",
                label: (
                  <Center p={5}>
                    <IconMap
                      size={18}
                      strokeWidth={2.3}
                      color={theme.colors.dark[5]}
                    />
                  </Center>
                ),
              },
            ]}
            bg="rgba(255,255,255,0.1)"
            styles={{
              label: {
                padding: 0,
              },
              indicator: {
                margin: 2,
                backgroundColor: theme.white,
              },
              // controlActive: {
              //   backgroundColor:
              //     theme.white,
              // },
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

function useMapClusters({
  markers,
  initialZoom = 0,
  maxZoom = 14,
  radius = 5,
}: {
  markers?: TMapMarker[];
  initialZoom?: number;
  maxZoom?: number;
  radius?: number;
}): {
  points: any[];
  clusters: (PointFeature<AnyProps> | ClusterFeature<AnyProps>)[];
  bounds: [number, number, number, number];
  zoom: number;
  setZoom: (_zoom: number) => void;
  getClusterExpansionZoom: (_clusterId: number) => number;
} {
  const supercluster = useMemo(
    () =>
      new Supercluster({
        maxZoom,
        radius,
      }),
    [maxZoom, radius],
  );

  const [zoom, setZoom] = useState<number>(initialZoom);
  const mapRef = useMap();
  const bounds = useMemo(() => {
    return (mapRef.current?.getMap().getBounds().toArray().flat() || [
      -180, -90, 180, 90,
    ]) as [number, number, number, number];
  }, [mapRef]);

  const points = useMemo((): (
    | PointFeature<AnyProps>
    | ClusterFeature<AnyProps>
  )[] => {
    return (
      markers?.map((marker) => ({
        type: "Feature",
        properties: {
          cluster: false,
          marker,
        },
        geometry: {
          type: "Point",
          coordinates: [marker.location.longitude, marker.location.latitude],
        },
      })) || []
    );
  }, [markers]);

  const clusters = useMemo(() => {
    return points.length
      ? supercluster?.load(points)?.getClusters(bounds, zoom)
      : [];
  }, [points, supercluster, bounds, zoom]);

  return {
    points,
    clusters,
    bounds,
    zoom,
    setZoom,
    getClusterExpansionZoom: supercluster.getClusterExpansionZoom,
  };
}
