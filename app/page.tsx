\"use client\";

import { useMemo, useState } from \"react\";
import { geoPath, geoMercator } from \"d3-geo\";
import type { FeatureCollection, Geometry } from \"geojson\";
import { ChevronLeft, Layers, LocateFixed } from \"lucide-react\";

import { Badge } from \"@/components/ui/badge\";
import { Button } from \"@/components/ui/button\";
import { Card, CardContent, CardHeader, CardTitle } from \"@/components/ui/card\";
import {
  levelLabels,
  levelOrder,
  mapHierarchy,
  poiLabels,
  type MapLevel,
  type Poi,
  type RegionProperties,
} from \"@/lib/data\";

type GeoData = FeatureCollection<Geometry, RegionProperties>;

const svgSize = { width: 760, height: 560 };

const poiIcon: Record<Poi[\"type\"], string> = {
  station: \"🚄\",
  landmark: \"🏛\",
  scenic: \"🏞\",
};

export default function Home() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selection, setSelection] = useState<Record<MapLevel, RegionProperties | null>>({
    country: mapHierarchy.country.features[0].properties,
    province: null,
    city: null,
    district: null,
  });

  const currentLevel = levelOrder[currentLevelIndex];
  const currentData: GeoData = mapHierarchy[currentLevel];
  const parentLevel = currentLevelIndex > 0 ? levelOrder[currentLevelIndex - 1] : null;
  const parentSelection = parentLevel ? selection[parentLevel] : null;
  const activeIds = useMemo(() => {
    if (!parentSelection?.children) {
      return new Set(currentData.features.map((feature) => feature.properties?.id));
    }
    return new Set(parentSelection.children);
  }, [currentData.features, parentSelection]);

  const selectedRegion = selection[currentLevel];

  const projection = useMemo(() => {
    return geoMercator().fitSize(
      [svgSize.width, svgSize.height],
      currentData as FeatureCollection<Geometry, RegionProperties>
    );
  }, [currentData]);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  const handleRegionClick = (region: RegionProperties) => {
    const nextLevelIndex = currentLevelIndex + 1;
    setSelection((prev) => {
      const next = { ...prev };
      next[currentLevel] = region;
      if (nextLevelIndex < levelOrder.length) {
        const nextLevel = levelOrder[nextLevelIndex];
        next[nextLevel] = null;
      }
      if (nextLevelIndex + 1 < levelOrder.length) {
        levelOrder.slice(nextLevelIndex + 1).forEach((level) => {
          next[level] = null;
        });
      }
      return next;
    });
    if (nextLevelIndex < levelOrder.length) {
      setCurrentLevelIndex(nextLevelIndex);
    }
  };

  const handleBack = () => {
    if (currentLevelIndex === 0) return;
    const previousLevel = levelOrder[currentLevelIndex - 1];
    setSelection((prev) => ({
      ...prev,
      [currentLevel]: null,
    }));
    setCurrentLevelIndex((prev) => Math.max(prev - 1, 0));
    if (previousLevel && selection[previousLevel]) {
      return;
    }
  };

  const breadcrumbs = levelOrder
    .slice(0, currentLevelIndex + 1)
    .map((level) => selection[level]?.name ?? levelLabels[level]);

  const regionList = currentData.features
    .filter((feature) => activeIds.has(feature.properties?.id))
    .map((feature) => feature.properties)
    .filter(Boolean) as RegionProperties[];

  return (
    <main className=\"min-h-screen px-6 py-8\">
      <div className=\"mx-auto flex max-w-6xl flex-col gap-6\">
        <header className=\"flex flex-col gap-3\">
          <Badge className=\"w-fit\" variant=\"outline\">
            极简静态地图 · 空间结构认知
          </Badge>
          <div className=\"flex flex-col gap-2\">
            <h1 className=\"text-3xl font-semibold text-slate-900\">
              用最少信息建立对行政区的空间认知
            </h1>
            <p className=\"max-w-3xl text-sm text-muted-foreground\">
              点击区域进入下一级，层级为 {levelLabels.country} → {levelLabels.province} →
              {levelLabels.city} → {levelLabels.district}。当前层级外区域自动淡化，帮助你聚焦
              结构与轮廓。
            </p>
          </div>
          <div className=\"flex flex-wrap items-center gap-2 text-xs text-muted-foreground\">
            <span className=\"flex items-center gap-1\">
              <Layers className=\"h-4 w-4\" />
              当前层级：{levelLabels[currentLevel]}
            </span>
            <span>·</span>
            <span className=\"text-slate-700\">路径：{breadcrumbs.join(\" / \")}</span>
          </div>
        </header>

        <section className=\"grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]\">
          <Card className=\"overflow-hidden\">
            <CardHeader className=\"flex-row items-center justify-between\">
              <div>
                <CardTitle>行政区结构地图</CardTitle>
                <p className=\"mt-1 text-xs text-muted-foreground\">
                  仅显示行政区轮廓与精选 POI，避免信息堆叠。
                </p>
              </div>
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={handleBack}
                disabled={currentLevelIndex === 0}
              >
                <ChevronLeft className=\"h-4 w-4\" />
                返回上一级
              </Button>
            </CardHeader>
            <CardContent className=\"p-0\">
              <div className=\"bg-slate-950/5 p-6\">
                <svg
                  viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                  className=\"h-full w-full rounded-xl border bg-white shadow-sm\"
                >
                  <rect
                    x={0}
                    y={0}
                    width={svgSize.width}
                    height={svgSize.height}
                    fill=\"#f8fafc\"
                  />
                  {currentData.features.map((feature) => {
                    const region = feature.properties;
                    if (!region) return null;
                    const isActive = activeIds.has(region.id);
                    const isSelected = selectedRegion?.id === region.id;
                    const fill = isSelected ? \"#1f2937\" : isActive ? \"#e2e8f0\" : \"#f1f5f9\";
                    const stroke = isSelected ? \"#0f172a\" : isActive ? \"#94a3b8\" : \"#cbd5f5\";
                    const opacity = isActive ? 1 : 0.4;
                    return (
                      <path
                        key={region.id}
                        d={pathGenerator(feature) ?? \"\"}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={2}
                        opacity={opacity}
                        className={isActive ? \"cursor-pointer transition\" : \"\"}
                        onClick={() => isActive && handleRegionClick(region)}
                      />
                    );
                  })}
                  {(selectedRegion?.pois ?? []).map((poi) => {
                    const [x, y] = projection(poi.coordinates) ?? [0, 0];
                    return (
                      <g key={poi.id} transform={`translate(${x}, ${y})`}>
                        <circle r={10} fill=\"#0f172a\" opacity={0.85} />
                        <text
                          textAnchor=\"middle\"
                          dominantBaseline=\"central\"
                          className=\"text-sm\"
                        >
                          {poiIcon[poi.type]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          <div className=\"flex flex-col gap-6\">
            <Card>
              <CardHeader>
                <CardTitle>信息面板</CardTitle>
                <p className=\"text-xs text-muted-foreground\">选中区域后展示结构化信息。</p>
              </CardHeader>
              <CardContent className=\"space-y-4 text-sm\">
                {selectedRegion ? (
                  <>
                    <div className=\"space-y-1\">
                      <p className=\"text-xs text-muted-foreground\">名称</p>
                      <p className=\"text-base font-semibold\">{selectedRegion.name}</p>
                    </div>
                    <div className=\"space-y-1\">
                      <p className=\"text-xs text-muted-foreground\">行政级别</p>
                      <p>{levelLabels[selectedRegion.level]}</p>
                    </div>
                    <div className=\"grid grid-cols-2 gap-3\">
                      <div className=\"rounded-lg bg-muted/60 p-3\">
                        <p className=\"text-xs text-muted-foreground\">面积</p>
                        <p className=\"font-medium\">{selectedRegion.area ?? \"—\"}</p>
                      </div>
                      <div className=\"rounded-lg bg-muted/60 p-3\">
                        <p className=\"text-xs text-muted-foreground\">人口</p>
                        <p className=\"font-medium\">{selectedRegion.population ?? \"—\"}</p>
                      </div>
                    </div>
                    <div className=\"space-y-2\">
                      <p className=\"text-xs text-muted-foreground\">下辖区域</p>
                      {selectedRegion.children ? (
                        <div className=\"flex flex-wrap gap-2\">
                          {selectedRegion.children.map((child) => (
                            <Badge key={child} variant=\"secondary\">
                              {child.replace(/(province|city|district|country)-/, \"\")}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className=\"text-muted-foreground\">无</p>
                      )}
                    </div>
                    <div className=\"space-y-2\">
                      <p className=\"text-xs text-muted-foreground\">代表 POI</p>
                      {(selectedRegion.pois ?? []).length > 0 ? (
                        <ul className=\"space-y-1\">
                          {selectedRegion.pois?.map((poi) => (
                            <li key={poi.id} className=\"flex items-center gap-2\">
                              <span>{poiIcon[poi.type]}</span>
                              <span className=\"flex-1\">{poi.name}</span>
                              <span className=\"text-xs text-muted-foreground\">
                                {poiLabels[poi.type]}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className=\"text-muted-foreground\">暂无精选 POI</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className=\"flex flex-col gap-2 text-muted-foreground\">
                    <LocateFixed className=\"h-5 w-5\" />
                    <p>点击地图中的行政区，查看区域结构、下辖列表与精选 POI。</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>当前层级区域</CardTitle>
                <p className=\"text-xs text-muted-foreground\">
                  点击区域进入下一层级，仅支持离散层级缩放。
                </p>
              </CardHeader>
              <CardContent className=\"space-y-3 text-sm\">
                {regionList.map((region) => {
                  const isSelected = selectedRegion?.id === region.id;
                  return (
                    <button
                      key={region.id}
                      type=\"button\"
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition hover:bg-muted/70 ${
                        isSelected ? \"border-slate-900 bg-slate-900 text-white\" : \"bg-white\"
                      }`}
                      onClick={() => handleRegionClick(region)}
                    >
                      <span className=\"font-medium\">{region.name}</span>
                      <span className=\"text-xs opacity-70\">{region.area}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
