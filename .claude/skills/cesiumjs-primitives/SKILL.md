---
name: cesiumjs-primitives
description: "CesiumJS primitives and geometry - Primitive, GeometryInstance, Appearance, BufferPrimitive collections, GeoJsonPrimitive, Billboard/Label/PointPrimitive collections, built-in geometry shapes, ground primitives, classification. Use when rendering performance-critical static or vector geometry, loading GeoJSON without entities, creating custom shapes, batching draw calls, or using low-level collections."
---
# CesiumJS Primitives & Geometry

> **Applies to:** CesiumJS v1.144+ (ES module imports, `??` instead of `defaultValue`)

## Architecture

The Primitive API is the low-level rendering layer beneath the Entity API, trading convenience for performance.

**Core formula:** `Primitive = GeometryInstance[] + Appearance`

- **GeometryInstance** -- positions a Geometry in world space with per-instance attributes (color, show).
- **Geometry** -- vertex data describing a shape (polygon, box, ellipsoid, etc.).
- **Appearance** -- GLSL shaders + render state + optional Material that shade the geometry.

Primitives are **immutable after first render** -- geometry cannot change, but per-instance attributes update via `primitive.getGeometryInstanceAttributes(id)`.

## Primitive

```js
import {
  Viewer, Primitive, GeometryInstance, EllipseGeometry,
  EllipsoidSurfaceAppearance, Material, Cartesian3, Math as CesiumMath,
} from "cesium";

const viewer = new Viewer("cesiumContainer");
const scene = viewer.scene;

const primitive = scene.primitives.add(new Primitive({
  geometryInstances: new GeometryInstance({
    geometry: new EllipseGeometry({
      center: Cartesian3.fromDegrees(-100.0, 40.0),
      semiMinorAxis: 250000.0,
      semiMajorAxis: 400000.0,
      rotation: CesiumMath.PI_OVER_FOUR,
      vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT, // must match appearance
    }),
    id: "myEllipse", // returned by Scene.pick()
  }),
  appearance: new EllipsoidSurfaceAppearance({ material: Material.fromType("Stripe") }),
}));
```

### Key Options

| Option | Default | Purpose |
|---|---|---|
| `geometryInstances` | -- | Single instance or array |
| `appearance` | -- | Shading (Appearance subclass) |
| `show` | `true` | Toggle visibility |
| `modelMatrix` | `Matrix4.IDENTITY` | Transform all instances |
| `asynchronous` | `true` | Build geometry on web worker |
| `releaseGeometryInstances` | `true` | Free geometry after GPU upload |
| `allowPicking` | `true` | `false` saves GPU memory |
| `shadows` | `ShadowMode.DISABLED` | Cast/receive shadows |

## Batching Multiple Instances

All instances in one Primitive share a single draw call.

```js
import {
  Primitive, GeometryInstance, RectangleGeometry, EllipseGeometry,
  PerInstanceColorAppearance, ColorGeometryInstanceAttribute,
  Cartesian3, Rectangle, Color,
} from "cesium";

scene.primitives.add(new Primitive({
  geometryInstances: [
    new GeometryInstance({
      geometry: new RectangleGeometry({
        rectangle: Rectangle.fromDegrees(-140, 30, -100, 40),
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      id: "rect",
      attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.RED.withAlpha(0.5)) },
    }),
    new GeometryInstance({
      geometry: new EllipseGeometry({
        center: Cartesian3.fromDegrees(-80, 35),
        semiMinorAxis: 200000.0,
        semiMajorAxis: 300000.0,
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      id: "ellipse",
      attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.BLUE.withAlpha(0.5)) },
    }),
  ],
  appearance: new PerInstanceColorAppearance(),
}));
```

### Batching Volume Geometry (CylinderGeometry Grid)

Volume geometry (Cylinder, Box, Ellipsoid) must be positioned via `modelMatrix` on each GeometryInstance. Use `Matrix4.multiply` to combine a world-space anchor with a local offset, then batch all instances into one Primitive.

```js
import {
  Primitive, GeometryInstance, CylinderGeometry,
  PerInstanceColorAppearance, ColorGeometryInstanceAttribute,
  Cartesian3, Matrix4, Transforms, Color, Math as CesiumMath,
} from "cesium";

const center = Cartesian3.fromDegrees(-73.9857, 40.7580);
const anchorFrame = Transforms.eastNorthUpToFixedFrame(center, undefined, new Matrix4());
const instances = [];
const GRID = 10;
const SPACING = 50; // metres

for (let row = 0; row < GRID; row++) {
  for (let col = 0; col < GRID; col++) {
    const xOffset = (col - GRID / 2) * SPACING;
    const yOffset = (row - GRID / 2) * SPACING;
    // Combine anchor ENU frame with a local XYZ offset
    const modelMatrix = Matrix4.multiply(
      anchorFrame,
      Matrix4.fromTranslation(new Cartesian3(xOffset, yOffset, 100), new Matrix4()),
      new Matrix4(),
    );
    instances.push(new GeometryInstance({
      geometry: new CylinderGeometry({
        length: 200,
        topRadius: 8,
        bottomRadius: 8,
        vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
      }),
      modelMatrix,
      attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.fromRandom({ alpha: 1.0 })) },
    }));
  }
}

scene.primitives.add(new Primitive({
  geometryInstances: instances,
  appearance: new PerInstanceColorAppearance({ flat: true }),
}));

// Frame the grid so the full batch is visible -- a shallow pitch hides cylinders
// behind the foreground; a near-nadir pitch flattens them. Aim for ~-45° (-PI/4)
// at a range that covers the grid footprint (GRID * SPACING) with margin.
const range = GRID * SPACING * 3; // ~1500 m for a 10x10x50m grid
viewer.camera.lookAt(
  center,
  new Cartesian3(0, -range * 0.7, range * 0.7), // offset south + up for -45° pitch
);
```

**Key patterns:**
- `Matrix4.multiply(anchorFrame, Matrix4.fromTranslation(offset, result), result)` -- compose the ENU frame at a geographic anchor with a local East/North/Up translation.
- `Color.fromRandom({ alpha: 1.0 })` produces fully-opaque random colours suitable for rainbow-coloured batches.
- **Framing matters:** for a grid of vertical volumes, prefer a `~-45°` (`-CesiumMath.PI_OVER_FOUR`, ~`-0.785` rad) pitch at a range of roughly `3 * gridFootprint`. Pitches shallower than ~`-0.6` rad can push the grid off-screen or hide it behind buildings; nadir views flatten cylinders into dots and lose the batched "field" appearance. A `-0.61` rad pitch is still shallow enough to leave the grid completely out of frame.
- **Verify visibility:** after `primitive.ready`, prefer `viewer.camera.flyToBoundingSphere(primitive._boundingSpheres[0], { duration: 0 })` (or `viewer.flyTo(primitive)`) over hand-tuned offsets if the scenario only requires "the batch is visible".

## Updating Per-Instance Attributes

```js
import { ColorGeometryInstanceAttribute, ShowGeometryInstanceAttribute } from "cesium";

// Wait for async geometry compilation
const removeListener = scene.postRender.addEventListener(() => {
  if (!primitive.ready) return;
  const attrs = primitive.getGeometryInstanceAttributes("rect");
  attrs.color = ColorGeometryInstanceAttribute.toValue(Color.YELLOW);
  attrs.show = ShowGeometryInstanceAttribute.toValue(true);
  removeListener();
});
```

## PrimitiveCollection

Nestable container -- `scene.primitives` is itself a PrimitiveCollection.

```js
import { PrimitiveCollection, BillboardCollection, LabelCollection } from "cesium";

const group = new PrimitiveCollection();
group.add(new BillboardCollection());
group.add(new LabelCollection());
scene.primitives.add(group);
group.show = false; // toggle all children
```

## Choosing a Vector Data Path

| Need | Use |
|---|---|
| Entity lifecycle, clustering, per-entity styling, time-dynamic values | `GeoJsonDataSource` in `cesiumjs-entities` |
| One large GeoJSON object with low overhead and primitive-level performance | `GeoJsonPrimitive` in this skill |
| Tiled vector data, 3D Tiles LOD, metadata styling, feature picking | `MVTDataProvider` in `cesiumjs-3d-tiles` |
| Fully manual high-throughput point/polyline/polygon buffers | `BufferPointCollection`, `BufferPolylineCollection`, `BufferPolygonCollection` |

## Buffer Primitive Collections (Experimental, 1.140+)

Use `BufferPointCollection`, `BufferPolylineCollection`, and `BufferPolygonCollection`
for very large vector datasets where Entity/DataSource overhead is too high. These
APIs were introduced in 1.140 (#13212) and refined through 1.142; they are
experimental and use flyweight primitive objects: reuse one `BufferPoint`,
`BufferPolyline`, or `BufferPolygon` when adding or iterating thousands of items.

```js
import {
  BlendOption,
  BoundingSphere,
  BufferPoint,
  BufferPointCollection,
  BufferPointMaterial,
  Cartesian3,
  Color,
} from "cesium";

const positions = [
  Cartesian3.fromDegrees(-75.16, 39.95),
  Cartesian3.fromDegrees(-73.98, 40.75),
];

const points = scene.primitives.add(new BufferPointCollection({
  primitiveCountMax: positions.length,
  allowPicking: true,
  blendOption: BlendOption.TRANSLUCENT,
  boundingVolume: BoundingSphere.fromPoints(positions), // world space in 1.142+
}));

const point = new BufferPoint();
const material = new BufferPointMaterial({
  color: Color.CYAN.withAlpha(0.65),
  outlineColor: Color.WHITE.withAlpha(0.9),
  outlineWidth: 2,
  size: 10,
});

positions.forEach((position, featureId) => {
  points.add({
    position,
    featureId,
    material,
  }, point);
});

const picked = scene.pick(windowPosition);
if (picked?.collection === points) {
  console.log(picked.index, picked.primitive.featureId);
}
```

> **Breaking change (1.141, #13448):** `BufferPrimitiveCollection.modelMatrix`,
> `boundingVolume`, and `boundingVolumeWC` are now **readonly** -- you may mutate
> the object in place, but reassigning the property (`collection.modelMatrix = ...`)
> throws. Update the existing matrix/volume instead of swapping in a new one.

1.142 notes:
- `boundingVolume` is now world-space, not local/model-space. If you provide it manually, include the collection `modelMatrix` transform yourself.
- Providing `boundingVolume` skips automatic recomputation; this helps large animated collections but makes you responsible for keeping the volume valid.
- `blendOption` is supported on all three buffer collections and enables alpha from `BufferPrimitiveMaterial#color`; `BufferPointCollection` also honors `outlineColor.alpha`.
- Use `BlendOption.OPAQUE` only when every material is fully opaque; use `TRANSLUCENT` or mixed blending when alpha varies.

In 1.143, `BufferPointCollection` no longer leaks `outlineColor` into the fill
when `outlineWidth` is `0`. Set the width to `0` to disable outlines; remove
transparent-outline workarounds that would otherwise complicate batching.

## GeoJsonPrimitive (Experimental, 1.142+)

`GeoJsonPrimitive` loads GeoJSON directly into buffer primitive collections,
bypassing `GeoJsonDataSource` and the Entity layer. Prefer it for large static
or bulk-updated vector datasets. Keep using `GeoJsonDataSource` when you need
Entity conveniences, time-dynamic properties, clustering, or DataSource lifecycle
integration.

```js
import { GeoJsonPrimitive } from "cesium";

const counties = await GeoJsonPrimitive.fromUrl("/data/counties.geojson", {
  allowPicking: true,
});
scene.primitives.add(counties);

console.log(counties.featureCount);
console.log(counties.points);    // BufferPointCollection | undefined
console.log(counties.polylines); // BufferPolylineCollection | undefined
console.log(counties.polygons);  // BufferPolygonCollection | undefined

// Picking returns the GeoJsonPrimitive pick object, including source properties.
const picked = scene.pick(windowPosition);
if (picked?.parentPrimitive === counties) {
  const featureId = picked.primitive.featureId;
  console.log(counties.getId(featureId));
  console.log(counties.getProperties(featureId));
}
```

`GeoJsonPrimitive.fromGeoJson(parsedObject)` is available when the GeoJSON is
already in memory. Source feature IDs are exposed through `ids`/`getId()`, and
source properties through `properties`/`getProperties()`.

## Built-in Geometry Types (31)

All geometries take shape parameters and a `vertexFormat` matching the Appearance. Most have a paired `*OutlineGeometry`. Outlines require a separate Primitive.

### Filled + Outline Pattern

```js
import {
  Primitive, GeometryInstance, PolygonGeometry, PolygonOutlineGeometry,
  PolygonHierarchy, PerInstanceColorAppearance, ColorGeometryInstanceAttribute,
  Cartesian3, Color,
} from "cesium";

const positions = Cartesian3.fromDegreesArray([-115, 37, -115, 32, -107, 33, -102, 35]);

// Fill primitive
scene.primitives.add(new Primitive({
  geometryInstances: new GeometryInstance({
    geometry: new PolygonGeometry({
      polygonHierarchy: new PolygonHierarchy(positions),
      vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
    }),
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.CYAN.withAlpha(0.5)) },
  }),
  appearance: new PerInstanceColorAppearance(),
}));

// Outline primitive (separate draw call)
scene.primitives.add(new Primitive({
  geometryInstances: new GeometryInstance({
    geometry: new PolygonOutlineGeometry({ polygonHierarchy: new PolygonHierarchy(positions) }),
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE) },
  }),
  appearance: new PerInstanceColorAppearance({ flat: true }),
}));
```

### Geometry Catalog

Every `XxxGeometry` has a matching `XxxOutlineGeometry` unless noted.

**Surface** (work with GroundPrimitive): `CircleGeometry`, `CorridorGeometry`, `EllipseGeometry`, `PolygonGeometry`, `RectangleGeometry`.

**Volume** (need `modelMatrix`): `BoxGeometry` (`fromDimensions()`), `CylinderGeometry` (cone when topRadius != bottomRadius), `EllipsoidGeometry`, `SphereGeometry`, `FrustumGeometry`, `PlaneGeometry`.

**Path**: `CorridorGeometry` (buffered path), `PolylineVolumeGeometry` (2D shape extruded along path), `WallGeometry` (vertical curtain).

**Polygon**: `PolygonGeometry` (holes via `PolygonHierarchy`), `CoplanarPolygonGeometry` (non-Earth-surface).

**Line** (no outline): `PolylineGeometry` (pixel-width), `SimplePolylineGeometry` (1px), `GroundPolylineGeometry` (GroundPolylinePrimitive only).

### Positioning Off-Surface Geometry

Box, Ellipsoid, Cylinder, and Frustum need a `modelMatrix` on the GeometryInstance.

```js
import { GeometryInstance, BoxGeometry, PerInstanceColorAppearance,
  ColorGeometryInstanceAttribute, Cartesian3, Matrix4, Transforms, Color } from "cesium";

const modelMatrix = Matrix4.multiplyByTranslation(
  Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-105, 40)),
  new Cartesian3(0, 0, 250000), new Matrix4(),
);
new GeometryInstance({
  geometry: BoxGeometry.fromDimensions({
    dimensions: new Cartesian3(400000, 300000, 500000),
    vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
  }),
  modelMatrix,
  id: "floatingBox",
  attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.CORAL) },
});
```

## Appearances (7 Types)

| Appearance | Use Case | Material? |
|---|---|---|
| `PerInstanceColorAppearance` | Per-instance color | No |
| `MaterialAppearance` | Arbitrary geometry + Material | Yes |
| `EllipsoidSurfaceAppearance` | Surface geometry + Material (fewer attrs) | Yes |
| `PolylineColorAppearance` | Per-instance color polylines | No |
| `PolylineMaterialAppearance` | Polylines with Material | Yes |
| `DebugAppearance` | Visualize vertex attributes | No |
| `Appearance` | Base class / custom shaders | Optional |

The geometry `vertexFormat` **must** match the appearance. Use the appearance's static `VERTEX_FORMAT`. For `PerInstanceColorAppearance` without lighting, use `FLAT_VERTEX_FORMAT`.

### MaterialAppearance Example

```js
import { Primitive, GeometryInstance, WallGeometry, MaterialAppearance, Material, Cartesian3 } from "cesium";

scene.primitives.add(new Primitive({
  geometryInstances: new GeometryInstance({
    geometry: new WallGeometry({
      positions: Cartesian3.fromDegreesArrayHeights([-115, 44, 200000, -110, 44, 200000, -105, 44, 200000]),
      vertexFormat: MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat,
    }),
  }),
  appearance: new MaterialAppearance({
    material: Material.fromType("Checkerboard"),
    faceForward: true, // shade both sides
  }),
}));
```

## GroundPrimitive

Drapes geometry onto terrain/3D Tiles. Supported: `CircleGeometry`, `CorridorGeometry`, `EllipseGeometry`, `PolygonGeometry`, `RectangleGeometry`. Add to `scene.primitives` (not `scene.groundPrimitives` -- both work but `scene.primitives` is the conventional target when using a public basemap without Ion terrain).

```js
import { GroundPrimitive, GeometryInstance, PolygonGeometry, PolygonHierarchy,
  PerInstanceColorAppearance, ColorGeometryInstanceAttribute, ClassificationType,
  Cartesian3, Color } from "cesium";

scene.primitives.add(new GroundPrimitive({
  geometryInstances: new GeometryInstance({
    geometry: new PolygonGeometry({
      polygonHierarchy: new PolygonHierarchy(
        Cartesian3.fromDegreesArray([-112, 36, -112, 36.1, -111.9, 36.1]),
      ),
    }),
    id: "groundPolygon",
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.RED.withAlpha(0.5)) },
  }),
  appearance: new PerInstanceColorAppearance({ flat: true, translucent: true }),
  classificationType: ClassificationType.TERRAIN, // TERRAIN, CESIUM_3D_TILE, or BOTH
}));
```

## GroundPolylinePrimitive

Drapes a polyline on terrain. Add to `scene.primitives` (not `scene.groundPrimitives`).

```js
import { GroundPolylinePrimitive, GeometryInstance, GroundPolylineGeometry,
  PolylineColorAppearance, ColorGeometryInstanceAttribute, Cartesian3, Color } from "cesium";

scene.primitives.add(new GroundPolylinePrimitive({
  geometryInstances: new GeometryInstance({
    geometry: new GroundPolylineGeometry({
      positions: Cartesian3.fromDegreesArray([-112.13, 36.05, -112.09, 36.10, -112.13, 36.17]),
      width: 4.0,
      loop: true,
    }),
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.LIME.withAlpha(0.7)) },
  }),
  appearance: new PolylineColorAppearance(),
}));
```

## ClassificationPrimitive

Highlights volumes classifying terrain or 3D Tiles. Valid: `BoxGeometry`, `CylinderGeometry`, `EllipsoidGeometry`, `PolylineVolumeGeometry`, `SphereGeometry`, plus extruded surface geometries.

```js
import { ClassificationPrimitive, GeometryInstance, BoxGeometry, PerInstanceColorAppearance,
  ColorGeometryInstanceAttribute, ClassificationType, Cartesian3, Transforms, Color } from "cesium";

scene.primitives.add(new ClassificationPrimitive({
  geometryInstances: new GeometryInstance({
    geometry: BoxGeometry.fromDimensions({
      dimensions: new Cartesian3(100, 100, 50),
      vertexFormat: PerInstanceColorAppearance.VERTEX_FORMAT,
    }),
    modelMatrix: Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-75.59, 40.04, 25)),
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.YELLOW.withAlpha(0.5)) },
  }),
  classificationType: ClassificationType.BOTH,
}));
```

## BillboardCollection

GPU-efficient viewport-aligned images -- far more performant than entities at scale.

> **Breaking change (1.140, #13253):** `BillboardCollection` and `LabelCollection`
> now require WebGL 2, or WebGL 1 with `ANGLE_instanced_arrays` and
> `MAX_VERTEX_TEXTURE_IMAGE_UNITS > 0`. On unsupported devices they no longer
> render -- gate on `scene.context.webgl2` (or feature-detect the extension) if you
> still target legacy WebGL 1 hardware.

### Basic Usage

> **Compatibility fix (1.143):** billboard image loading no longer crashes when
> an application replaces the global `Promise` implementation. Use the public
> `image` property with a URL, loaded image, or canvas; use `setImage` for a
> `Resource` or callback. Do not branch on native `Promise` identity or retain
> compatibility shims for this bug.

```js
import { BillboardCollection, Cartesian3, Color, NearFarScalar,
  HeightReference, HorizontalOrigin, VerticalOrigin } from "cesium";

const billboards = scene.primitives.add(new BillboardCollection({ scene }));
const b = billboards.add({
  position: Cartesian3.fromDegrees(-75.59, 40.04),
  image: "marker.png",
  horizontalOrigin: HorizontalOrigin.CENTER,
  verticalOrigin: VerticalOrigin.BOTTOM,
  heightReference: HeightReference.CLAMP_TO_GROUND,
  scaleByDistance: new NearFarScalar(1000, 1.5, 1e7, 0.3),
});
b.position = Cartesian3.fromDegrees(-75.60, 40.05); // update dynamically
billboards.remove(b);
```

### PinBuilder -- Procedural Pin Images

`PinBuilder` generates canvas-based pin icons at runtime without external image files. Use `fromColor` for solid-colour pins or `fromText` for labelled pins. Pass the returned canvas as the billboard `image`.

When a scenario specifies an ordered list of cities/items and a colour-by-index scheme, **iterate the source array in the given order** and use the loop index directly as the HSL hue index. Re-ordering the source list (e.g. sorting by latitude) swaps which colour lands on which city and fails visual checks.

```js
import { BillboardCollection, PinBuilder, Cartesian3, Color, VerticalOrigin } from "cesium";

const pinBuilder = new PinBuilder();
const cities = [
  { name: "Boston",       lng: -71.0589, lat: 42.3601 },
  { name: "New York",     lng: -74.0060, lat: 40.7128 },
  { name: "Philadelphia", lng: -75.1652, lat: 39.9526 },
  { name: "Washington DC",lng: -77.0369, lat: 38.9072 },
  { name: "Miami",        lng: -80.1918, lat: 25.7617 },
];

const billboards = scene.primitives.add(new BillboardCollection({ scene }));

cities.forEach((city, index) => {
  billboards.add({
    position: Cartesian3.fromDegrees(city.lng, city.lat),
    // Color.fromHsl(hue 0-1, saturation, lightness) produces evenly-spaced hues
    image: pinBuilder.fromColor(Color.fromHsl(index / cities.length, 0.8, 0.5), 48),
    verticalOrigin: VerticalOrigin.BOTTOM,
  });
});

// Text label pin: pinBuilder.fromText("A", Color.ROYALBLUE, 48)
// fromColor / fromText return a canvas -- pass directly as image
```

**`Color.fromHsl(hue, saturation, lightness)`** -- generates colours across the spectrum by varying `hue` (0–1 wraps full circle). Useful for rainbow-colouring N items: `Color.fromHsl(i / n, 0.8, 0.5)`. **`Color.fromRandom({ alpha })`** -- random hue/saturation/lightness with fixed alpha.

## LabelCollection

```js
import { LabelCollection, Cartesian3, Cartesian2, Color, LabelStyle, VerticalOrigin } from "cesium";

const labels = scene.primitives.add(new LabelCollection({ scene }));
labels.add({
  position: Cartesian3.fromDegrees(-75.59, 40.04, 300),
  text: "Philadelphia",
  font: "16px sans-serif",
  fillColor: Color.WHITE,
  outlineColor: Color.BLACK,
  outlineWidth: 2,
  style: LabelStyle.FILL_AND_OUTLINE,
  verticalOrigin: VerticalOrigin.BOTTOM,
  pixelOffset: new Cartesian2(0, -10),
});
```

## PointPrimitiveCollection

```js
import { PointPrimitiveCollection, Cartesian3, Color, NearFarScalar } from "cesium";

const points = scene.primitives.add(new PointPrimitiveCollection());
points.add({
  position: Cartesian3.fromDegrees(-75.59, 40.04),
  pixelSize: 10,
  color: Color.YELLOW,
  outlineColor: Color.BLACK,
  outlineWidth: 2,
  scaleByDistance: new NearFarScalar(1000, 1.0, 1e7, 0.1),
});
```

## CloudCollection and PolylineCollection

```js
import { CloudCollection, PolylineCollection, Cartesian3, Cartesian2, Color, Material } from "cesium";

// Procedural cumulus clouds
const clouds = scene.primitives.add(new CloudCollection());
clouds.add({
  position: Cartesian3.fromDegrees(-75.59, 40.04, 1500),
  scale: new Cartesian2(40, 12),
  maximumSize: new Cartesian3(40, 12, 15),
  slice: 0.36,
});

// Low-level polyline collection
const polylines = scene.primitives.add(new PolylineCollection());
polylines.add({
  positions: Cartesian3.fromDegreesArray([-75, 40, -70, 42, -65, 38]),
  width: 3.0,
  material: Material.fromType("Color", { color: Color.AQUA }),
});
```

## Polyline via Primitive

```js
import { Primitive, GeometryInstance, PolylineGeometry, PolylineColorAppearance,
  ColorGeometryInstanceAttribute, Cartesian3, Color, ArcType } from "cesium";

scene.primitives.add(new Primitive({
  geometryInstances: new GeometryInstance({
    geometry: new PolylineGeometry({
      positions: Cartesian3.fromDegreesArray([0, 0, 5, 0]),
      width: 10.0,
      vertexFormat: PolylineColorAppearance.VERTEX_FORMAT,
      arcType: ArcType.GEODESIC, // GEODESIC, RHUMB, or NONE
    }),
    attributes: { color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE) },
  }),
  appearance: new PolylineColorAppearance({ translucent: false }),
}));
```

## Enums

| Enum | Values | Used By |
|---|---|---|
| `ArcType` | `GEODESIC`, `RHUMB`, `NONE` | PolylineGeometry, PolygonGeometry |
| `CornerType` | `ROUNDED`, `MITERED`, `BEVELED` | CorridorGeometry, PolylineVolumeGeometry |
| `ClassificationType` | `TERRAIN`, `CESIUM_3D_TILE`, `BOTH` | GroundPrimitive, ClassificationPrimitive |
| `PrimitiveType` | `POINTS`, `LINES`, `TRIANGLES`, etc. | Low-level Geometry |
| `CloudType` | `CUMULUS` | CloudCollection |

## Camera Framing for Primitive Scenes

Programmatic checks (primitive count, camera position) can pass while the visual output completely misses the rendered geometry. A few rules of thumb that recur in visual evaluations:

- **Volume-geometry grids (cylinders/boxes):** use ~`-PI/4` (~`-0.785` rad, -45°) pitch from a range of `~3 * gridFootprint`. Pitches shallower than ~`-0.6` rad can park the grid behind the camera or out of frame; pitches near `-PI/2` flatten vertical extent and make the batch look like dots.
- **Surface polygons draped on terrain (GroundPrimitive):** with steeper pitches (~`-50°`) and far ranges, the polygon shrinks to a thin strip at the bottom edge. Reduce range or use a flatter pitch so the polygon occupies the centre of the frame.
- **Continental polylines (Route 66, transcontinental routes):** a near-nadir top-down view from ~5–6 Mm above the centroid keeps the full path visible.
- **Pin chains along a coast/route:** centre the camera on the midpoint of the chain at a range that covers the chain's bounding box with margin on all sides.

When in doubt, `viewer.flyTo(primitive)` or `viewer.camera.flyToBoundingSphere(primitive._boundingSpheres[0])` after `primitive.ready` will frame the batch automatically.

## Performance Tips

1. **Batch aggressively.** Combine thousands of GeometryInstances into one Primitive for a single draw call.
2. **Use `PerInstanceColorAppearance`** when each instance only needs a distinct color.
3. **Set `flat: true`** on PerInstanceColorAppearance when lighting is unneeded; uses `FLAT_VERTEX_FORMAT`.
4. **Set `allowPicking: false`** on Primitives that will never be picked to save GPU memory.
5. **Keep `asynchronous: true`** (default). Check `primitive.ready` before accessing instance attributes.
6. **Prefer fewer large collections** for Billboard, Label, and PointPrimitive. Group by update frequency.
7. **Use `BlendOption.OPAQUE`** on BillboardCollection/PointPrimitiveCollection when all items are opaque (up to 2x gain).
8. **Use buffer primitive collections** for large vector data when flyweight updates are acceptable.
9. **Precompute buffer collection bounding volumes** for large animated collections, but remember they are world-space in 1.142+.
10. **Use GroundPrimitive** for terrain draping instead of entity `heightReference`.
11. **Separate fill and outline** into two Primitives -- they cannot share a draw call.
12. **Match `vertexFormat` exactly** to the appearance to skip unused vertex attribute computation.
13. **Use `EllipsoidSurfaceAppearance`** over `MaterialAppearance` for surface geometry -- fewer vertex attributes.

## See Also

- **cesiumjs-entities** -- High-level Entity API wrapping primitives with time-dynamic properties.
- **cesiumjs-3d-tiles** -- Use `MVTDataProvider` for tiled vector data as runtime 3D Tiles.
- **cesiumjs-materials-shaders** -- Material (Fabric) system consumed by Appearances, post-processing.
- **cesiumjs-spatial-math** -- Cartesian3, Matrix4, Transforms, coordinate conversions for positioning geometry.
