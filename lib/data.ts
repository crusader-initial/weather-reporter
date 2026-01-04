import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

export type MapLevel = "country" | "province" | "city" | "district";

export interface RegionProperties extends GeoJsonProperties {
  id: string;
  name: string;
  level: MapLevel;
  parentId?: string;
  area?: string;
  population?: string;
  pois?: Poi[];
  children?: string[];
}

export interface Poi {
  id: string;
  name: string;
  type: "station" | "landmark" | "scenic";
  coordinates: [number, number];
}

const poiLibrary: Record<string, Poi[]> = {
  "province-north": [
    {
      id: "poi-north-station",
      name: "北境高铁站",
      type: "station",
      coordinates: [25, 78],
    },
    {
      id: "poi-north-landmark",
      name: "海角灯塔",
      type: "landmark",
      coordinates: [40, 60],
    },
  ],
  "province-south": [
    {
      id: "poi-south-station",
      name: "南境枢纽",
      type: "station",
      coordinates: [65, 25],
    },
    {
      id: "poi-south-scenic",
      name: "云岚峡谷",
      type: "scenic",
      coordinates: [80, 40],
    },
  ],
  "city-north-1": [
    {
      id: "poi-n1-landmark",
      name: "天际塔",
      type: "landmark",
      coordinates: [18, 82],
    },
  ],
  "city-north-2": [
    {
      id: "poi-n2-scenic",
      name: "星湖",
      type: "scenic",
      coordinates: [40, 72],
    },
  ],
  "city-south-1": [
    {
      id: "poi-s1-station",
      name: "南湾站",
      type: "station",
      coordinates: [60, 20],
    },
  ],
  "city-south-2": [
    {
      id: "poi-s2-landmark",
      name: "白石寺",
      type: "landmark",
      coordinates: [82, 32],
    },
  ],
};

const geoJson = <T extends GeoJsonProperties>(
  features: Array<{
    id: string;
    properties: T;
    coordinates: number[][][];
  }>
): FeatureCollection<Geometry, T> => {
  return {
    type: "FeatureCollection",
    features: features.map((feature) => ({
      type: "Feature",
      id: feature.id,
      properties: feature.properties,
      geometry: {
        type: "Polygon",
        coordinates: feature.coordinates,
      },
    })),
  };
};

export const mapHierarchy: Record<MapLevel, FeatureCollection<Geometry, RegionProperties>> =
  {
    country: geoJson<RegionProperties>([
      {
        id: "country-aurora",
        properties: {
          id: "country-aurora",
          name: "极光国",
          level: "country",
          area: "68 万 km²",
          population: "3200 万",
          children: ["province-north", "province-south"],
          pois: [
            {
              id: "poi-country-landmark",
              name: "极光观测台",
              type: "landmark",
              coordinates: [52, 55],
            },
          ],
        },
        coordinates: [[[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]]],
      },
    ]),
    province: geoJson<RegionProperties>([
      {
        id: "province-north",
        properties: {
          id: "province-north",
          name: "北境省",
          level: "province",
          parentId: "country-aurora",
          area: "32 万 km²",
          population: "1400 万",
          children: ["city-north-1", "city-north-2"],
          pois: poiLibrary["province-north"],
        },
        coordinates: [[[0, 55], [60, 55], [60, 100], [0, 100], [0, 55]]],
      },
      {
        id: "province-south",
        properties: {
          id: "province-south",
          name: "南境省",
          level: "province",
          parentId: "country-aurora",
          area: "36 万 km²",
          population: "1800 万",
          children: ["city-south-1", "city-south-2"],
          pois: poiLibrary["province-south"],
        },
        coordinates: [[[0, 0], [100, 0], [100, 55], [0, 55], [0, 0]]],
      },
    ]),
    city: geoJson<RegionProperties>([
      {
        id: "city-north-1",
        properties: {
          id: "city-north-1",
          name: "曙光市",
          level: "city",
          parentId: "province-north",
          area: "12 万 km²",
          population: "620 万",
          children: ["district-n1-a", "district-n1-b"],
          pois: poiLibrary["city-north-1"],
        },
        coordinates: [[[0, 70], [30, 70], [30, 100], [0, 100], [0, 70]]],
      },
      {
        id: "city-north-2",
        properties: {
          id: "city-north-2",
          name: "星河市",
          level: "city",
          parentId: "province-north",
          area: "20 万 km²",
          population: "780 万",
          children: ["district-n2-a", "district-n2-b"],
          pois: poiLibrary["city-north-2"],
        },
        coordinates: [[[30, 55], [60, 55], [60, 100], [30, 100], [30, 55]]],
      },
      {
        id: "city-south-1",
        properties: {
          id: "city-south-1",
          name: "南湾市",
          level: "city",
          parentId: "province-south",
          area: "18 万 km²",
          population: "520 万",
          children: ["district-s1-a", "district-s1-b"],
          pois: poiLibrary["city-south-1"],
        },
        coordinates: [[[0, 0], [55, 0], [55, 30], [0, 30], [0, 0]]],
      },
      {
        id: "city-south-2",
        properties: {
          id: "city-south-2",
          name: "珊瑚市",
          level: "city",
          parentId: "province-south",
          area: "22 万 km²",
          population: "640 万",
          children: ["district-s2-a", "district-s2-b"],
          pois: poiLibrary["city-south-2"],
        },
        coordinates: [[[55, 0], [100, 0], [100, 55], [55, 55], [55, 0]]],
      },
    ]),
    district: geoJson<RegionProperties>([
      {
        id: "district-n1-a",
        properties: {
          id: "district-n1-a",
          name: "北湾区",
          level: "district",
          parentId: "city-north-1",
          area: "4 万 km²",
          population: "210 万",
          pois: [
            {
              id: "poi-n1-a",
              name: "海风公园",
              type: "scenic",
              coordinates: [12, 92],
            },
          ],
        },
        coordinates: [[[0, 85], [30, 85], [30, 100], [0, 100], [0, 85]]],
      },
      {
        id: "district-n1-b",
        properties: {
          id: "district-n1-b",
          name: "晨光区",
          level: "district",
          parentId: "city-north-1",
          area: "8 万 km²",
          population: "410 万",
          pois: [
            {
              id: "poi-n1-b",
              name: "光影美术馆",
              type: "landmark",
              coordinates: [20, 78],
            },
          ],
        },
        coordinates: [[[0, 70], [30, 70], [30, 85], [0, 85], [0, 70]]],
      },
      {
        id: "district-n2-a",
        properties: {
          id: "district-n2-a",
          name: "星桥区",
          level: "district",
          parentId: "city-north-2",
          area: "9 万 km²",
          population: "320 万",
          pois: [
            {
              id: "poi-n2-a",
              name: "星桥站",
              type: "station",
              coordinates: [40, 88],
            },
          ],
        },
        coordinates: [[[30, 75], [60, 75], [60, 100], [30, 100], [30, 75]]],
      },
      {
        id: "district-n2-b",
        properties: {
          id: "district-n2-b",
          name: "湖心区",
          level: "district",
          parentId: "city-north-2",
          area: "11 万 km²",
          population: "460 万",
          pois: [
            {
              id: "poi-n2-b",
              name: "湖心码头",
              type: "scenic",
              coordinates: [48, 66],
            },
          ],
        },
        coordinates: [[[30, 55], [60, 55], [60, 75], [30, 75], [30, 55]]],
      },
      {
        id: "district-s1-a",
        properties: {
          id: "district-s1-a",
          name: "临湾区",
          level: "district",
          parentId: "city-south-1",
          area: "6 万 km²",
          population: "230 万",
          pois: [
            {
              id: "poi-s1-a",
              name: "滨海塔",
              type: "landmark",
              coordinates: [20, 15],
            },
          ],
        },
        coordinates: [[[0, 15], [27, 15], [27, 30], [0, 30], [0, 15]]],
      },
      {
        id: "district-s1-b",
        properties: {
          id: "district-s1-b",
          name: "沙洲区",
          level: "district",
          parentId: "city-south-1",
          area: "12 万 km²",
          population: "290 万",
          pois: [
            {
              id: "poi-s1-b",
              name: "沙洲高铁站",
              type: "station",
              coordinates: [35, 8],
            },
          ],
        },
        coordinates: [[[27, 0], [55, 0], [55, 30], [27, 30], [27, 0]]],
      },
      {
        id: "district-s2-a",
        properties: {
          id: "district-s2-a",
          name: "珊瑚湾区",
          level: "district",
          parentId: "city-south-2",
          area: "10 万 km²",
          population: "300 万",
          pois: [
            {
              id: "poi-s2-a",
              name: "珊瑚岛",
              type: "scenic",
              coordinates: [70, 18],
            },
          ],
        },
        coordinates: [[[55, 20], [100, 20], [100, 55], [55, 55], [55, 20]]],
      },
      {
        id: "district-s2-b",
        properties: {
          id: "district-s2-b",
          name: "潮汐区",
          level: "district",
          parentId: "city-south-2",
          area: "12 万 km²",
          population: "340 万",
          pois: [
            {
              id: "poi-s2-b",
              name: "潮汐馆",
              type: "landmark",
              coordinates: [78, 8],
            },
          ],
        },
        coordinates: [[[55, 0], [100, 0], [100, 20], [55, 20], [55, 0]]],
      },
    ]),
  };

export const levelOrder: MapLevel[] = ["country", "province", "city", "district"];

export const levelLabels: Record<MapLevel, string> = {
  country: "国家",
  province: "省 / 州",
  city: "市",
  district: "区 / 县",
};

export const poiLabels: Record<Poi["type"], string> = {
  station: "🚄 车站",
  landmark: "🏛 地标",
  scenic: "🏞 景点",
};
