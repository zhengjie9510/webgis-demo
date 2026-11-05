---
name: cesiumjs-imagery
description: "CesiumJS imagery layers - ImageryProvider, ImageryLayer, ImageryLayerCollection, WMS, WMTS, Bing, OpenStreetMap, ArcGIS, Mapbox, tile discard policies. Use when adding or swapping base map layers, configuring imagery providers, layering multiple map sources, or creating split-screen imagery comparisons."
---
# CesiumJS Imagery Layers

> CesiumJS v1.144 -- Imagery providers supply raster tile data rendered on the Globe
> or draped over a Cesium3DTileset. The three core abstractions are **ImageryProvider**
> (fetches tiles), **ImageryLayer** (display settings), and
> **ImageryLayerCollection** (ordered stack on the globe).

```
ImageryProvider        (abstract -- fetches tile images)
  -> ImageryLayer      (wraps one provider; alpha, brightness, split, etc.)
    -> ImageryLayerCollection  (ordered stack; index 0 = base layer)
      -> Globe / Cesium3DTileset
```

Layers render bottom-to-top. Index 0 is the **base layer**, stretched to fill
the globe even if its rectangle does not cover the entire world.

## Quick Start and ImageryLayer Factories

When creating a viewer for imagery work, disable unneeded widgets so the imagery
is the visual focus. Use `camera.setView` (not `flyTo`) when you need the camera
in position immediately — `flyTo` animates and may not finish before your code
continues.

```js
import { Viewer, ImageryLayer, OpenStreetMapImageryProvider, UrlTemplateImageryProvider, Math as CesiumMath } from "cesium";

// Clean viewer -- disable widgets that distract from imagery
const viewer = new Viewer("cesiumContainer", {
  baseLayer: new ImageryLayer(new OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
    maximumLevel: 18,
  })),
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: false,
});

// Position camera immediately (no animation)
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(-73.0, 41.0, 1500000),
  orientation: {
    heading: 0.0,
    pitch: CesiumMath.toRadians(-90), // look straight down
    roll: 0.0,
  },
});

// Public URL-backed overlay
const nightLayer = new ImageryLayer(new UrlTemplateImageryProvider({
  url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
  maximumLevel: 8,
  credit: "NASA GIBS",
}));
nightLayer.alpha = 0.5;
nightLayer.brightness = 2.0;
viewer.imageryLayers.add(nightLayer);
```

Use `IonImageryProvider` and `ImageryLayer.fromWorldImagery` only when the
runtime has the required Cesium ion entitlement. For public/no-token examples,
prefer OpenStreetMap, ArcGIS, NASA GIBS, WMS, WMTS, or URL-template providers.

### Camera Height Reference for Imagery Scenes

Use `camera.setView` with these approximate heights:

| Scale | Height (m) | Example |
|---|---|---|
| Street / block | 500–2,000 | Downtown intersection |
| City | 5,000–25,000 | Washington DC, Paris |
| Metro area | 50,000–200,000 | Greater London |
| Region / state | 300,000–1,500,000 | Florida, Japan |
| Continent | 3,000,000–8,000,000 | Europe, North America |

For top-down (map-style) views set `pitch: CesiumMath.toRadians(-90)`.
For oblique 3D views set `pitch: CesiumMath.toRadians(-35)` to `CesiumMath.toRadians(-60)`.

Default to top-down framing when a scenario names a specific country, city, or
region. It keeps the named feature centered without perspective skew. Oblique
high-altitude views can easily show a neighboring landmass because the target
falls outside the view frustum.

### Framing Reference for Named Places

Frame named places by their actual longitude and latitude, not a nearby guess.
Use `camera.setView` with `Cartesian3.fromDegrees(lon, lat, height)` and a
top-down pitch unless the prompt explicitly asks for an oblique view.

| Place | lon, lat | Suggested height |
|---|---|---:|
| London | -0.12, 51.50 | 60,000 |
| Paris | 2.35, 48.86 | 30,000 |
| New York City | -74.00, 40.71 | 60,000 |
| New York-Boston corridor | -72.5, 41.5 | 800,000 |
| Washington DC, National Mall | -77.03, 38.89 | 25,000 |
| Florida peninsula | -81.5, 28.0 | 1,500,000 |
| Grand Canyon | -112.5, 36.3 | 200,000 |
| Hawaiian Islands | -157.0, 20.5 | 1,800,000 |
| Iceland | -19.0, 64.9 | 1,200,000 |
| Italy peninsula | 12.5, 42.0 | 2,500,000 |
| Southern Europe split view | 13.0, 42.0 | 4,500,000 |
| Greenland | -42.0, 72.0 | 5,000,000 |
| Japan, Honshu | 138.0, 36.5 | 2,500,000 |

## ImageryLayerCollection API

Access via `viewer.imageryLayers` (same as `viewer.scene.imageryLayers`).

```js
const layers = viewer.imageryLayers;

layers.add(myLayer);              // add on top
layers.add(myLayer, 0);           // add at index
layers.addImageryProvider(provider); // create layer + add

layers.raise(myLayer);            // move up one
layers.lower(myLayer);            // move down one
layers.raiseToTop(myLayer);       // move to top
layers.lowerToBottom(myLayer);    // move to bottom

layers.remove(myLayer);           // remove and destroy
layers.remove(myLayer, false);    // remove without destroying
layers.removeAll();

const count = layers.length;
const base  = layers.get(0);
const idx   = layers.indexOf(myLayer);
const has   = layers.contains(myLayer);
```

Events: `layerAdded(layer, index)`, `layerRemoved(layer, index)`,
`layerMoved(layer, newIndex, oldIndex)`, `layerShownOrHidden(layer, index, show)`.

## ImageryLayer Display Properties

Properties accept a number or a per-tile callback `(frameState, layer, x, y, level) => value`.

| Property | Default | Notes |
|---|---|---|
| `alpha` | 1.0 | 0 = transparent, 1 = opaque |
| `brightness` | 1.0 | < 1 darker, > 1 brighter |
| `contrast` | 1.0 | < 1 lower, > 1 higher |
| `hue` | 0.0 | Shift in radians |
| `saturation` | 1.0 | < 1 desaturated, > 1 oversaturated |
| `gamma` | 1.0 | Gamma correction |
| `show` | true | Visibility toggle |
| `splitDirection` | `SplitDirection.NONE` | LEFT, RIGHT, or NONE |
| `nightAlpha` / `dayAlpha` | 1.0 | Requires `Globe.enableLighting` |

Additional options: `rectangle`, `minimumTerrainLevel` / `maximumTerrainLevel`,
`cutoutRectangle`, `colorToAlpha` / `colorToAlphaThreshold`,
`minificationFilter` / `magnificationFilter` (LINEAR default, or NEAREST).

```js
// Adjust appearance at runtime
layer.alpha = 0.7;
layer.brightness = 1.3;
layer.contrast = 1.5;
layer.saturation = 0.5;
layer.gamma = 1.2;
```

## Swapping the Base Layer

Remove the default base layer and replace it at index 0. The replacement becomes
the new base layer, stretched to fill the globe.

```js
import { ImageryLayer, OpenStreetMapImageryProvider } from "cesium";

// Remove default Bing aerial
viewer.imageryLayers.remove(viewer.imageryLayers.get(0));

// Add OSM as new base layer at index 0
const osmLayer = new ImageryLayer(
  new OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
    maximumLevel: 19,
    credit: "OpenStreetMap contributors",
  }),
);
viewer.imageryLayers.add(osmLayer, 0);
```

### Choosing a Visible Light Basemap

When a scenario asks for a light or everyday basemap, do not use night-lights,
dark-canvas, or satellite-night tiles as the base layer. Those render as mostly
black pixels and visibly fail the requirement. Reliable public light basemaps:

- OpenStreetMap (`https://tile.openstreetmap.org/`)
- Carto Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`)
- ArcGIS World Street Map / World Topographic
- USGS Shaded Relief (WMTS)

Reserve `VIIRS_CityLights_2012`, `BlackMarble`, and `CANVAS_DARK` for overlays
on top of a light base, or for scenes that explicitly call for a night view.

## Imagery Providers

### IonImageryProvider

Requires Cesium ion asset access. Do not use in public/no-token examples unless
the caller explicitly asks for an ion imagery asset.

```js
// Always use fromAssetId (async factory); never call constructor directly
const layer = ImageryLayer.fromProviderAsync(
  IonImageryProvider.fromAssetId(3812),
);
viewer.imageryLayers.add(layer);
```

### OpenStreetMapImageryProvider

Extends UrlTemplateImageryProvider for Slippy tile servers.

```js
const osm = new OpenStreetMapImageryProvider({
  url: "https://tile.openstreetmap.org/",
  maximumLevel: 19,
  credit: "OpenStreetMap contributors",
  // retinaTiles: true,  // request @2x tiles
});
viewer.imageryLayers.addImageryProvider(osm);
```

### UrlTemplateImageryProvider

The most flexible provider. Placeholders: `{x}`, `{y}`, `{z}`, `{s}`,
`{reverseX/Y/Z}`, `{west/south/east/northDegrees}`,
`{west/south/east/northProjected}`, `{width}`, `{height}`.

```js
import { UrlTemplateImageryProvider, GeographicTilingScheme, buildModuleUrl } from "cesium";

// TMS-style with Geographic tiling
const tms = new UrlTemplateImageryProvider({
  url: buildModuleUrl("Assets/Textures/NaturalEarthII") + "/{z}/{x}/{reverseY}.jpg",
  tilingScheme: new GeographicTilingScheme(),
  maximumLevel: 5,
});
viewer.imageryLayers.addImageryProvider(tms);

// Carto Positron with subdomains
const positron = new UrlTemplateImageryProvider({
  url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  subdomains: "abcd",
  credit: "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
});

// Custom tags for time-varying data
const custom = new UrlTemplateImageryProvider({
  url: "https://yourserver/{Time}/{z}/{y}/{x}.png",
  customTags: {
    Time: (imageryProvider, x, y, level) => "20240101",
  },
});
```

### WebMapServiceImageryProvider (WMS)

```js
import { WebMapServiceImageryProvider, ImageryLayer, Rectangle } from "cesium";

const wms = new WebMapServiceImageryProvider({
  url: "https://basemap.nationalmap.gov:443/arcgis/services/USGSHydroCached/MapServer/WMSServer",
  layers: "0",
  rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
  // parameters: { transparent: true, format: "image/png" },
  // crs: "EPSG:4326",  // WMS >= 1.3.0
  // srs: "EPSG:4326",  // WMS 1.1.x
});
viewer.imageryLayers.add(new ImageryLayer(wms));
```

### WebMapTileServiceImageryProvider (WMTS)

Required options: `url`, `layer`, `style`, `tileMatrixSetID`.

```js
import { WebMapTileServiceImageryProvider, Credit } from "cesium";

const wmts = new WebMapTileServiceImageryProvider({
  url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS",
  layer: "USGSShadedReliefOnly",
  style: "default",
  format: "image/jpeg",
  tileMatrixSetID: "default028mm",
  maximumLevel: 19,
  credit: new Credit("U. S. Geological Survey"),
});
viewer.imageryLayers.addImageryProvider(wmts);
```

**GetFeatureInfo (1.140+, #13196):** `WebMapTileServiceImageryProvider` now supports
`pickFeatures` for both KVP and RESTful WMTS services. Enable it with the new
constructor options `enablePickFeatures`, `getFeatureInfoFormats`,
`getFeatureInfoUrl`, and `getFeatureInfoParameters`; then call
`provider.pickFeatures(x, y, level, longitude, latitude)` (the same signature WMS
uses) to query attributes at a location.

### ArcGisMapServerImageryProvider

```js
import { ArcGisMapServerImageryProvider, ArcGisMapService, ArcGisBaseMapType, ImageryLayer } from "cesium";

ArcGisMapService.defaultAccessToken = "<YOUR_ARCGIS_TOKEN>";

// From basemap type enum: SATELLITE, OCEANS, HILLSHADE
const arcgis = ImageryLayer.fromProviderAsync(
  ArcGisMapServerImageryProvider.fromBasemapType(ArcGisBaseMapType.SATELLITE),
);
viewer.imageryLayers.add(arcgis);

// From a specific MapServer URL
const streets = ImageryLayer.fromProviderAsync(
  ArcGisMapServerImageryProvider.fromUrl(
    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
  ),
);
```

### BingMapsImageryProvider

```js
import { BingMapsImageryProvider, BingMapsStyle, ImageryLayer } from "cesium";

const bing = ImageryLayer.fromProviderAsync(
  BingMapsImageryProvider.fromUrl("https://dev.virtualearth.net", {
    key: "<YOUR_BING_KEY>",
    mapStyle: BingMapsStyle.AERIAL_WITH_LABELS_ON_DEMAND,
  }),
);
viewer.imageryLayers.add(bing);
```

Styles: `AERIAL`, `AERIAL_WITH_LABELS_ON_DEMAND`, `ROAD_ON_DEMAND`,
`CANVAS_DARK`, `CANVAS_LIGHT`, `CANVAS_GRAY`.

### MapboxStyleImageryProvider

```js
import { MapboxStyleImageryProvider, ImageryLayer } from "cesium";

const mapbox = new MapboxStyleImageryProvider({
  styleId: "streets-v11",
  accessToken: "<YOUR_MAPBOX_TOKEN>",
  // tilesize: 512, scaleFactor: true  // retina
});
viewer.imageryLayers.add(new ImageryLayer(mapbox));
```

### SingleTileImageryProvider

```js
import { SingleTileImageryProvider, ImageryLayer, Rectangle } from "cesium";

const logo = ImageryLayer.fromProviderAsync(
  SingleTileImageryProvider.fromUrl("/images/overlay.png", {
    rectangle: Rectangle.fromDegrees(-75.0, 28.0, -67.0, 29.75),
  }),
);
viewer.imageryLayers.add(logo);
```

> **1.140+ (#13297):** `OffscreenCanvas` is now an accepted `ImageryTypes` value,
> so you can feed a worker-rendered or dynamically-drawn `OffscreenCanvas`
> wherever an image source is expected -- useful for procedurally generated or
> live-updating overlays without round-tripping through a data URL.

## Split-Screen Comparison

```js
import { ImageryLayer, SplitDirection, UrlTemplateImageryProvider } from "cesium";

// Add an overlay that only appears on the left side of the split
const nightLayer = new ImageryLayer(new UrlTemplateImageryProvider({
  url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
  maximumLevel: 8,
}));
nightLayer.splitDirection = SplitDirection.LEFT;
viewer.imageryLayers.add(nightLayer);

viewer.scene.splitPosition = 0.5; // 0-1 fraction of viewport width
```

`SplitDirection`: `LEFT` (-1), `NONE` (0), `RIGHT` (1).

When splitting two basemaps and the prompt names a country or region, center
the camera on that region before setting the split. A split view that lands on
a neighboring landmass fails the framing intent regardless of which side the
overlay covers.

## Cutout Rectangle

```js
import { Rectangle } from "cesium";

// Cover the full named region. Florida peninsula needs roughly -87..-80 lon,
// 24..31 lat; a narrow strip or off-center box will miss the visual target.
const cutout = Rectangle.fromDegrees(-87.6, 24.5, -80.0, 31.0);

// Cut a hole in the base layer to reveal imagery beneath
const base = viewer.imageryLayers.get(0);
base.cutoutRectangle = cutout;
```

Size cutouts to match the full extent of the feature being revealed. For
peninsulas, states, or islands, use a rectangle that spans the named feature in
both longitude and latitude, then center the camera on the same region so the
revealed hole sits in the middle of the frame.

## Color-to-Alpha

`colorToAlpha` removes pixels matching a target color; `colorToAlphaThreshold`
controls how aggressively similar colors are removed. The default threshold is
too tight for night-lights overlays where the "black" background varies
tile-to-tile. Use a noticeably higher threshold so the light base actually
shows through.

```js
import { Color } from "cesium";

// On a VIIRS-style night-lights overlay added above an OSM base
const overlay = viewer.imageryLayers.get(1);
overlay.colorToAlpha = new Color(0.0, 0.016, 0.059); // dark ocean blue
overlay.colorToAlphaThreshold = 0.2;                  // generous tolerance
```

If the result still looks predominantly dark, raise the threshold further
(roughly `0.3`-`0.5`) or lower the overlay alpha. For a translucent or brightened
overlay, set both `layer.alpha < 1.0` and `layer.brightness > 1.0` explicitly.

## Draping Imagery on 3D Tiles

```js
import { Cesium3DTileset, ImageryLayer, IonImageryProvider } from "cesium";

const tileset = await Cesium3DTileset.fromUrl("/path/to/tileset.json");
viewer.scene.primitives.add(tileset);

const labelLayer = ImageryLayer.fromProviderAsync(
  IonImageryProvider.fromAssetId(2411391),
);
tileset.imageryLayers.add(labelLayer); // drape on tileset, not globe
labelLayer.show = false; // toggle off
```

When demonstrating imagery draped on a public sample tileset, zoom out enough
to frame the whole tileset so the imagery is visible across the model surface,
not just one close-up section.

Since 1.144, feature-info picking also works for layers draped on tilesets:
the Viewer InfoBox and `ImageryLayerCollection.pickImageryLayerFeatures` fall
back to `tileset.imageryLayers` when the globe pick finds nothing, so a
WMS/WMTS layer configured with `enablePickFeatures` returns metadata on 3D
Tiles surfaces too (see the WMTS GetFeatureInfo options under Imagery
Providers).

## Debugging Providers

```js
import { TileCoordinatesImageryProvider, GridImageryProvider, ImageryLayer, Color } from "cesium";

// Show x/y/level labels on every tile
viewer.imageryLayers.add(new ImageryLayer(
  new TileCoordinatesImageryProvider({ color: Color.YELLOW }),
));
// Wireframe grid overlay
viewer.imageryLayers.add(new ImageryLayer(new GridImageryProvider()));
```

## Tile Discard Policies

| Policy | Behavior |
|---|---|
| `DiscardEmptyTileImagePolicy` | Discards zero-byte images (Bing Maps default) |
| `DiscardMissingTileImagePolicy` | Compares pixels against a known "missing" tile |
| `NeverTileDiscardPolicy` | Never discards (use when server always returns valid tiles) |

```js
import { NeverTileDiscardPolicy, UrlTemplateImageryProvider } from "cesium";

const provider = new UrlTemplateImageryProvider({
  url: "https://my-server/{z}/{x}/{y}.png",
  tileDiscardPolicy: new NeverTileDiscardPolicy(),
});
```

## Error Handling

```js
const layer = ImageryLayer.fromProviderAsync(IonImageryProvider.fromAssetId(3812));
viewer.imageryLayers.add(layer);

// Provider creation failure
layer.errorEvent.addEventListener((error) => {
  console.error("Layer creation failed:", error);
});

// Provider resolved -- listen for per-tile errors
if (layer.readyEvent) {
  layer.readyEvent.addEventListener((provider) => {
    provider.errorEvent.addEventListener((tileError) => {
      console.warn("Tile error:", tileError.message);
    });
  });
}
```

Only wait on `readyEvent` when you need explicit readiness/error wiring. For
ordinary static map scenes, add the layer and frame the camera immediately so
missing or version-specific readiness events do not break the render path.

## Time-Dynamic WMTS

Pass `clock` and `times` (a `TimeIntervalCollection`) for time-varying layers.
Keep the `timeline` and `animation` viewer widgets enabled when the scenario
calls for a time-dynamic layer; the rendered clock controls are the clearest
visual evidence that the time interval wiring is active.

```js
import { WebMapTileServiceImageryProvider, TimeIntervalCollection, JulianDate, Credit } from "cesium";

const times = TimeIntervalCollection.fromIso8601({
  iso8601: "2015-07-30/2017-06-16/P1D",
  dataCallback: (interval) => ({ Time: JulianDate.toIso8601(interval.start) }),
});
const weather = new WebMapTileServiceImageryProvider({
  url: "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/AMSR2_Snow_Water_Equivalent/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
  layer: "AMSR2_Snow_Water_Equivalent",  style: "default",
  tileMatrixSetID: "2km",  maximumLevel: 5,  format: "image/png",
  clock: viewer.clock,  times: times,
  credit: new Credit("NASA Global Imagery Browse Services for EOSDIS"),
});
viewer.imageryLayers.addImageryProvider(weather);
```

## Performance Tips

1. **Limit simultaneous layers** -- 2-3 is typical; each layer multiplies tile requests and GPU texture memory.
2. **Set `hasAlphaChannel: false`** on opaque providers to reduce memory and upload time.
3. **Use `minimumTerrainLevel` / `maximumTerrainLevel`** to skip tile fetches at irrelevant zoom levels.
4. **Prefer `ImageryLayer.fromProviderAsync`** over manual await -- avoids blank globe during provider load.
5. **Set tight `rectangle` bounds** on regional providers to prevent out-of-extent tile requests.
6. **Reuse provider instances** -- remove with `destroy: false` and re-add instead of recreating.
7. **Use `NeverTileDiscardPolicy`** when tiles are always valid; pixel comparison adds overhead.
8. **Choose NEAREST filtering** only for classified raster data; LINEAR (default) is faster.

## Common Framing Pitfalls

- **Wrong landmass.** Asking for Iceland and rendering Greenland is a hard
  framing failure. Use the reference coordinates literally.
- **Region in a corner.** A cutout, split, or bounded rectangle must be centered
  under the camera, not pushed to one edge.
- **Dark base layer for a light-basemap prompt.** Use OSM, ArcGIS World Street
  Map, Carto Positron, or USGS Shaded Relief as the base.
- **Default zoom too wide.** A city scene at continent-scale height reads as
  wrong framing even if the city is technically visible.

## See Also

- **cesiumjs-viewer-setup** -- Viewer constructor, Ion token, `createWorldImageryAsync`
- **cesiumjs-terrain-environment** -- Globe, terrain providers, atmosphere, lighting
