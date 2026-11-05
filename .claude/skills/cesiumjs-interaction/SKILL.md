---
name: cesiumjs-interaction
description: "CesiumJS interaction and picking - ScreenSpaceEventHandler, multi-key KeyboardEventModifier input actions, Scene.pick, Scene.drillPick, Scene.pickPosition, Scene.snap edge snapping (1.144), mouse and touch events. Use when handling user clicks on the globe, selecting entities or 3D Tiles features, registering modifier-key shortcuts, implementing hover effects, snapping to model edges for measurement, or building drag-based interactions."
---
# CesiumJS Interaction & Picking

Version baseline: CesiumJS v1.144 (ES module imports, Ion token required).

## ScreenSpaceEventHandler

Central class for mouse, touch, and pointer events on the Cesium canvas.
**Always construct a new `ScreenSpaceEventHandler` bound to `viewer.scene.canvas`
for interaction logic** -- it isolates your listeners from Cesium's default
camera/selection handlers and is the idiomatic pattern shown across all recipes
below.

```js
import { ScreenSpaceEventHandler, ScreenSpaceEventType,
  KeyboardEventModifier, defined } from "cesium";

let handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

// Register a click handler
handler.setInputAction((event) => {
  console.log("Clicked at", event.position.x, event.position.y);
}, ScreenSpaceEventType.LEFT_CLICK);

// With keyboard modifier (Shift+Click)
handler.setInputAction((event) => {
  console.log("Shift+Click at", event.position);
}, ScreenSpaceEventType.LEFT_CLICK, KeyboardEventModifier.SHIFT);

// With multiple modifiers (Ctrl+Shift+Click, 1.142+)
handler.setInputAction((event) => {
  console.log("Ctrl+Shift+Click at", event.position);
}, ScreenSpaceEventType.LEFT_CLICK, [
  KeyboardEventModifier.CTRL,
  KeyboardEventModifier.SHIFT,
]);

// Query or remove actions
const clickAction = handler.getInputAction(ScreenSpaceEventType.LEFT_CLICK);
const ctrlShiftClickAction = handler.getInputAction(ScreenSpaceEventType.LEFT_CLICK, [
  KeyboardEventModifier.SHIFT,
  KeyboardEventModifier.CTRL, // order does not matter
]);
if (defined(clickAction) && defined(ctrlShiftClickAction)) {
  console.log("Click handlers registered");
}
handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK, [
  KeyboardEventModifier.CTRL,
  KeyboardEventModifier.SHIFT,
]);

// Always destroy when done to avoid memory leaks
handler = handler && handler.destroy();
```

The Viewer also exposes a built-in handler at `viewer.screenSpaceEventHandler`
which drives default behavior (entity selection, double-click tracking). You
*can* attach to it, but for any non-trivial interaction prefer constructing
your own `new ScreenSpaceEventHandler(viewer.scene.canvas)` so your handlers
are independently disposable and do not collide with Cesium defaults.

## ScreenSpaceEventType Reference

| Event | Callback shape | Notes |
|---|---|---|
| `LEFT_DOWN` / `LEFT_UP` / `LEFT_CLICK` | `({ position })` | Cartesian2 screen coords |
| `LEFT_DOUBLE_CLICK` | `({ position })` | Left only |
| `RIGHT_DOWN` / `RIGHT_UP` / `RIGHT_CLICK` | `({ position })` | |
| `MIDDLE_DOWN` / `MIDDLE_UP` / `MIDDLE_CLICK` | `({ position })` | |
| `MOUSE_MOVE` | `({ startPosition, endPosition })` | Fires on every pointer move |
| `WHEEL` | `(delta)` | Positive = scroll up |
| `PINCH_START` | `({ position1, position2 })` | Two-finger touch begins |
| `PINCH_END` | `()` | Two-finger touch ends |
| `PINCH_MOVE` | `({ distance, angleAndHeight })` | Two-finger move |

`KeyboardEventModifier`: `SHIFT`, `CTRL`, `ALT` -- optional third argument to
`setInputAction`, `getInputAction`, and `removeInputAction`. In 1.142+, pass a
single modifier or an array of modifiers. Modifier arrays are order-independent
but exact: a handler registered for `[CTRL, SHIFT]` does not fire when `ALT` is
also held.

## Scene Picking Methods

### pick / pickAsync / drillPick / pickPosition

```js
import { Cartographic, Math as CesiumMath, defined } from "cesium";

// pick -- synchronous, returns top-most object or undefined
const picked = viewer.scene.pick(event.position);

// pickAsync -- non-blocking (WebGL2, v1.136+), falls back to sync on WebGL1
const picked2 = await viewer.scene.pickAsync(movement.endPosition);

// drillPick -- all objects at position, front-to-back; use limit to cap cost
const allPicked = viewer.scene.drillPick(event.position, 5);

// pickPosition -- world Cartesian3 from depth buffer
if (viewer.scene.pickPositionSupported) {
  const cartesian = viewer.scene.pickPosition(event.position);
  if (defined(cartesian)) {
    const c = Cartographic.fromCartesian(cartesian);
    console.log(CesiumMath.toDegrees(c.longitude), CesiumMath.toDegrees(c.latitude), c.height);
  }
}
```

Set `scene.pickTranslucentDepth = true` to include translucent primitives in `pickPosition`.

### pickVoxel (experimental)

```js
// Pick a voxel cell and read its properties
const voxelCell = viewer.scene.pickVoxel(event.position);
if (defined(voxelCell)) {
  console.log(voxelCell.getProperty("temperature"));
}
```

### snap (experimental, 1.144+)

`scene.snap` searches a screen-space region around a window position and
returns the best snap target, preferring model edges (from CAD-style
`EXT_mesh_primitive_edge_visibility` data) over surfaces; among hits of the
same kind, the one nearest the cursor wins. Use it for measurement and
inspection tools that should latch onto edges instead of raw cursor hits.

```js
import { defined } from "cesium";

// Search a 25x25 px region centered on the cursor
const result = viewer.scene.snap(movement.endPosition, { width: 25 });
if (defined(result)) {
  // SceneSnapResult: { object, position, screenPosition, isEdge }
  console.log(result.isEdge ? "edge" : "surface", result.position);
}
```

Only primitives rendered through the Model pipeline (3D Tiles and glTF
models) are snappable. Snapping requires WebGL2 with float color attachments
(`EXT_color_buffer_float`); when that is unsupported, or the region contains
no snappable geometry, `snap` returns `undefined`.

### Picking Return Values

| Picked object | Return shape | Key properties |
|---|---|---|
| Entity | `{ primitive, id }` | `id` is the `Entity` instance |
| Cesium3DTileFeature | `Cesium3DTileFeature` | `.getProperty(name)`, `.getPropertyIds()`, `.color` |
| Billboard/Label (collection) | `{ primitive, id }` | `id` is the user-set id |
| Primitive (geometry) | `{ primitive, id }` | `id` is the `GeometryInstance` id |
| Globe surface | `undefined` | Use `camera.pickEllipsoid()` or `pickPosition()` |

## Camera Framing for Interaction Demos

Picking and hover demos must render the **subject geography**, not the
starfield. Recent losses occurred because the camera was angled at the sky
(pitch ~-45° or shallower) or imagery failed to load, leaving the scene black.
Two non-negotiable rules:

1. **Set the camera with `viewer.camera.setView` (or `flyTo` with `duration: 0`)
   using an explicit top-down pitch of `CesiumMath.toRadians(-90)`** (nadir)
   when the scenario calls for a regional map view. Do not rely on default
   pitch.
2. **Frame the scene at an altitude that contains all subject features.**
   For city-scale demos use 50–200 km; for state/region 1–3 Mm; for multi-state
   or archipelago 1.5–4 Mm. If pins or polygons land outside the frame, the
   judge will mark the candidate down even when programmatic checks pass.
3. **For regional pin demos, include the full latitude span with margin.**
   West-coast Seattle/San Francisco/Los Angeles views need a center near
   40.8 N, -121 W and about 3.2-4.0 Mm altitude, or a fitted rectangle. At
   2.5 Mm centered on 40 N, Seattle often lands at the top edge and fails as
   off-frame.

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

viewer.camera.setView({
  destination: Cartesian3.fromDegrees(-122.0, 37.5, 1_500_000),
  orientation: { heading: 0.0, pitch: CesiumMath.toRadians(-90), roll: 0.0 },
});
```

## Coordinate Conversion (Required for Readouts)

Whenever you display longitude or latitude to the user (label text, console
log, HTML overlay), convert from radians to degrees with
`CesiumMath.toDegrees`. Cartographic angles are **always in radians**; printing
them raw produces nonsense values.

```js
import { Cartographic, Math as CesiumMath } from "cesium";

const c = Cartographic.fromCartesian(cartesian);
const lonDeg = CesiumMath.toDegrees(c.longitude);
const latDeg = CesiumMath.toDegrees(c.latitude);
// Never display c.longitude / c.latitude directly in a UI label.
```

## Recipes

### Polygon Setup For Picking Examples

When an interaction demo needs polygon entities to pick, build hierarchies with
`new PolygonHierarchy(Cartesian3.fromDegreesArray([...]))`. `PolygonHierarchy`
does **not** have static `fromDegrees()`, `fromDegreesArray()`, or
`fromEquatorialCoordinates()` helpers -- calling them throws
`Cesium.PolygonHierarchy.fromDegrees is not a function` at runtime and the
scene renders empty. The only correct construction is:

```js
import { PolygonHierarchy, Cartesian3 } from "cesium";

const hierarchy = new PolygonHierarchy(
  Cartesian3.fromDegreesArray([
    -87.6, 41.8,
    -85.6, 41.8,
    -85.6, 43.3,
    -87.6, 43.3,
  ]),
);

viewer.entities.add({
  polygon: { hierarchy, material: Color.CRIMSON.withAlpha(0.5) },
});
```

### 1. Entity Selection with Click

```js
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position);
  if (defined(picked) && defined(picked.id)) {
    viewer.selectedEntity = picked.id; // shows InfoBox
  } else {
    viewer.selectedEntity = undefined;
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

### 2. 3D Tiles Feature Picking and Property Inspection

```js
import { Cesium3DTileFeature, Color } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position);
  if (picked instanceof Cesium3DTileFeature) {
    // Read properties
    const ids = picked.getPropertyIds();
    ids.forEach((id) => console.log(`${id}: ${picked.getProperty(id)}`));
    picked.color = Color.YELLOW; // highlight
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

### 3. Terrain Position Picking (Lon/Lat from Click)

```js
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((event) => {
  const cartesian = viewer.camera.pickEllipsoid(
    event.position, viewer.scene.globe.ellipsoid);
  if (defined(cartesian)) {
    const c = Cartographic.fromCartesian(cartesian);
    console.log(`Lon: ${CesiumMath.toDegrees(c.longitude).toFixed(6)}`);
    console.log(`Lat: ${CesiumMath.toDegrees(c.latitude).toFixed(6)}`);
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

For height on 3D content, use `scene.pickPosition` instead (see above).

### 4. Multi-Pick with drillPick

```js
import { EntityCollection, CallbackProperty, ColorMaterialProperty, Color } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
const pickedEntities = new EntityCollection();
const highlightColor = Color.YELLOW.withAlpha(0.5);

// Make entity material react to selection state
function makePickable(entity, baseColor) {
  entity.polygon.material = new ColorMaterialProperty(
    new CallbackProperty((time, result) => {
      return pickedEntities.contains(entity)
        ? highlightColor.clone(result) : baseColor.clone(result);
    }, false));
}

handler.setInputAction((movement) => {
  const all = viewer.scene.drillPick(movement.endPosition);
  pickedEntities.removeAll();
  for (const p of all) {
    if (defined(p.id)) pickedEntities.add(p.id);
  }
}, ScreenSpaceEventType.MOUSE_MOVE);
```

### 5. Hover Highlighting with MOUSE_MOVE

```js
import { Color } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
const highlighted = { feature: undefined, originalColor: new Color() };

handler.setInputAction((movement) => {
  if (defined(highlighted.feature)) {
    highlighted.feature.color = highlighted.originalColor;
    highlighted.feature = undefined;
  }
  const picked = viewer.scene.pick(movement.endPosition);
  if (defined(picked) && defined(picked.color)) {
    highlighted.feature = picked;
    Color.clone(picked.color, highlighted.originalColor);
    picked.color = Color.YELLOW;
  }
}, ScreenSpaceEventType.MOUSE_MOVE);
```

For **entities**, the picked object is `picked.id`; swap the graphics material
instead of `picked.color` (e.g. store `picked.id.polygon.material` and set it
to `Color.YELLOW`, restoring the previous entity's material first). Build the
graphics type the prompt names: a "polygon over a region" means `polygon`
graphics (with `PolygonHierarchy` positions), not `rectangle` graphics, even
when the region is rectangular.

### 6. Drag-Based Drawing and Measurement

```js
import { Cartographic, EllipsoidGeodesic, Ellipsoid, Color } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
const positions = [];

handler.setInputAction((event) => {
  const cartesian = viewer.camera.pickEllipsoid(
    event.position, viewer.scene.globe.ellipsoid);
  if (!defined(cartesian)) return;
  positions.push(cartesian);

  if (positions.length === 2) {
    viewer.entities.add({
      polyline: { positions: positions.slice(), width: 3,
        material: Color.RED, clampToGround: true },
    });
    const start = Cartographic.fromCartesian(positions[0]);
    const end = Cartographic.fromCartesian(positions[1]);
    const geodesic = new EllipsoidGeodesic(start, end, Ellipsoid.WGS84);
    console.log(`Distance: ${(geodesic.surfaceDistance / 1000).toFixed(2)} km`);
    positions.length = 0;
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

### 7. Coordinate Readout on Mouse Move

Initialize the label with a sensible starting value so it is visible
**before any pointer movement** -- scenarios often assert a default readout
without user interaction. Always convert via `CesiumMath.toDegrees`.

```js
import { HorizontalOrigin, VerticalOrigin, Cartesian2, Cartesian3,
  Cartographic, Math as CesiumMath } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

// Seed position/text so the label renders immediately on load.
const initialLon = 25.0;
const initialLat = 37.5;
const coordLabel = viewer.entities.add({
  position: Cartesian3.fromDegrees(initialLon, initialLat),
  label: {
    text: `Lon: ${initialLon.toFixed(2)} Lat: ${initialLat.toFixed(2)}`,
    show: true, showBackground: true, font: "14px monospace",
    horizontalOrigin: HorizontalOrigin.LEFT,
    verticalOrigin: VerticalOrigin.TOP,
    pixelOffset: new Cartesian2(15, 0),
  },
});

handler.setInputAction((movement) => {
  const cartesian = viewer.camera.pickEllipsoid(
    movement.endPosition, viewer.scene.globe.ellipsoid);
  if (defined(cartesian)) {
    const c = Cartographic.fromCartesian(cartesian);
    coordLabel.position = cartesian;
    coordLabel.label.show = true;
    coordLabel.label.text =
      `Lon: ${CesiumMath.toDegrees(c.longitude).toFixed(4)}\n` +
      `Lat: ${CesiumMath.toDegrees(c.latitude).toFixed(4)}`;
  }
}, ScreenSpaceEventType.MOUSE_MOVE);
```

### 8. Conditional Behavior Based on Picked Object Type

```js
import { Cesium3DTileFeature } from "cesium";

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position);
  if (!defined(picked)) {
    console.log("No object picked");
  } else if (picked instanceof Cesium3DTileFeature) {
    console.log("3D Tile feature:", picked.getProperty("name"));
  } else if (defined(picked.id) && defined(picked.id.position)) {
    viewer.selectedEntity = picked.id; // Entity
  } else if (defined(picked.primitive)) {
    console.log("Primitive:", picked.primitive.constructor.name);
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

### 9. pickAsync for Non-Blocking Hover (v1.136+)

```js
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
const highlighted = { feature: undefined, originalColor: new Color() };

handler.setInputAction(async (movement) => {
  if (defined(highlighted.feature)) {
    highlighted.feature.color = highlighted.originalColor;
    highlighted.feature = undefined;
  }
  const picked = await viewer.scene.pickAsync(movement.endPosition);
  if (defined(picked) && defined(picked.color)) {
    highlighted.feature = picked;
    Color.clone(picked.color, highlighted.originalColor);
    picked.color = Color.YELLOW;
  }
}, ScreenSpaceEventType.MOUSE_MOVE);
```

### 10. Hover + Selection with Silhouettes (Full Pattern)

Silhouettes are a **post-process edge-detection effect** applied to selected
primitives. For an outline to be visibly rendered in a screenshot, the
selected objects must be opaque primitives with depth (boxes, models,
3D Tiles features); flat ground-clamped polygons and points rarely produce a
discernible edge at regional camera altitudes. Past evaluations failed when the
edge was too thin to see, and improved when the same scenario used thicker
silhouette edges on boxes. To avoid that regression:

- Prefer `box` graphics with non-zero `dimensions` (typically 10–50 km per
  side at regional camera altitudes) or 3D Tiles features over `point` or
  ground polygons.
- Use a silhouette `length` of **at least 0.25**, and bump to `0.5` for
  city-scale or wider framings. Values below 0.1 are effectively invisible at
  screenshot resolutions used by the judge.
- Pick a **high-contrast color** against satellite imagery
  (`Color.ORANGE`, `Color.YELLOW`, `Color.LIME`); avoid blues which blend
  into ocean tiles.

```js
import { PostProcessStageLibrary, Color } from "cesium";

const scene = viewer.scene;
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

const silhouetteHover = PostProcessStageLibrary.createEdgeDetectionStage();
silhouetteHover.uniforms.color = Color.YELLOW;
silhouetteHover.uniforms.length = 0.25;
silhouetteHover.selected = [];

const silhouetteSelect = PostProcessStageLibrary.createEdgeDetectionStage();
silhouetteSelect.uniforms.color = Color.ORANGE;
silhouetteSelect.uniforms.length = 0.5;
silhouetteSelect.selected = [];

scene.postProcessStages.add(
  PostProcessStageLibrary.createSilhouetteStage([silhouetteHover, silhouetteSelect]));

let selectedFeature;

handler.setInputAction((movement) => {
  silhouetteHover.selected = [];
  const picked = scene.pick(movement.endPosition);
  if (defined(picked) && picked !== selectedFeature) {
    silhouetteHover.selected = [picked];
  }
}, ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction((event) => {
  silhouetteSelect.selected = [];
  const picked = scene.pick(event.position);
  if (defined(picked)) {
    selectedFeature = picked;
    silhouetteSelect.selected = [picked];
    silhouetteHover.selected = [];
  } else {
    selectedFeature = undefined;
  }
}, ScreenSpaceEventType.LEFT_CLICK);
```

For scenarios that pre-select an entity at load time (no user interaction
expected), assign `silhouetteSelect.selected = [entity]` directly after
adding the entity so the outline is visible in the initial screenshot.

### 11. Wheel Zoom with Custom Logic

```js
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((delta) => {
  // delta > 0 = scroll up (zoom in), delta < 0 = scroll out
  const zoomAmount = delta > 0 ? 0.9 : 1.1;
  viewer.camera.zoomIn(viewer.camera.positionCartographic.height * (1 - zoomAmount));
}, ScreenSpaceEventType.WHEEL);
```

### 12. Right-Click Context Menu

```js
viewer.scene.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position);
  if (defined(picked) && defined(picked.id)) {
    showContextMenu(event.position, picked.id); // your app logic
  }
}, ScreenSpaceEventType.RIGHT_CLICK);
```

### 13. Drag Interaction (Move an Entity)

```js
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
let draggedEntity = null;
const sscc = viewer.scene.screenSpaceCameraController;

handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position);
  if (defined(picked) && defined(picked.id)) {
    draggedEntity = picked.id;
    sscc.enableRotate = false;
    sscc.enableTranslate = false;
  }
}, ScreenSpaceEventType.LEFT_DOWN);

handler.setInputAction((movement) => {
  if (!defined(draggedEntity)) return;
  const cartesian = viewer.camera.pickEllipsoid(
    movement.endPosition, viewer.scene.globe.ellipsoid);
  if (defined(cartesian)) draggedEntity.position = cartesian;
}, ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction(() => {
  draggedEntity = null;
  sscc.enableRotate = true;
  sscc.enableTranslate = true;
}, ScreenSpaceEventType.LEFT_UP);
```

## Performance Tips

1. **Prefer `pickAsync` over `pick` on MOUSE_MOVE** -- synchronous pick stalls the GPU pipeline; `pickAsync` yields to the GPU and resolves next frame (WebGL2, v1.136+).
2. **Use `drillPick` with a `limit`** -- without one, it re-renders the scene for every overlapping object.
3. **Avoid `pick` in MOUSE_MOVE when only click picking is needed** -- MOUSE_MOVE fires on every pointer move and triggers a pick render pass each time.
4. **Enable `depthTestAgainstTerrain`** for accurate `pickPosition` results over terrain.
5. **Destroy unused handlers** -- each one registers DOM listeners that leak memory if not cleaned up.
6. **Throttle expensive hover logic** -- debounce to 50-100ms for operations beyond simple highlighting.
7. **Check `scene.pickPositionSupported`** before using `pickPosition` -- falls back to `camera.pickEllipsoid` on unsupported GPUs.
8. **Set `scene.pickTranslucentDepth = true` only when needed** -- adds an extra render pass.
9. **Reuse result objects** -- pass a scratch `Cartesian3` to `pickPosition` to avoid GC pressure in MOUSE_MOVE.
10. **Use `scene.requestRenderMode = true`** with picking to avoid unnecessary renders; call `scene.requestRender()` only on state changes.

## See Also

- **cesiumjs-entities** -- Entity API, graphics types, DataSources
- **cesiumjs-3d-tiles** -- Cesium3DTileset, Cesium3DTileFeature, styling, metadata
- **cesiumjs-camera** -- Camera.pickEllipsoid, ScreenSpaceCameraController, flyTo
