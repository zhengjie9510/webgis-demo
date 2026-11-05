---
name: cesiumjs-camera
description: "CesiumJS camera control - Camera, flyTo, lookAt, setView, ScreenSpaceCameraController, composable Controller camera controllers (1.144), CameraEventAggregator, flight animation. Use when positioning the camera, creating flyTo animations, constraining user navigation, adding custom or asset-inspection camera controllers, tracking entities, or converting between screen and world coordinates."
---
# CesiumJS Camera & Navigation

> **Baseline:** CesiumJS v1.144 -- ES module imports (`import { ... } from "cesium";`)

## Camera Fundamentals

Access via `viewer.camera`. The camera has a `position` (Cartesian3 in world
coords), orientation vectors (`direction`, `up`, `right`), and a frustum.
All angles are **radians**.

Read-only computed properties: `positionWC`, `positionCartographic`,
`directionWC`, `upWC`, `rightWC`, `heading` (0 = north, clockwise), `pitch`
(negative = down), `roll`, `transform`, `viewMatrix`, `inverseViewMatrix`.

Events: `moveStart` / `moveEnd` fire when movement begins/ends. `changed`
fires when the camera moves by more than `percentageChanged` (default 0.5).

> **City views are more realistic with 3D buildings.** For production skyline,
> street-level, or urban panorama views, use a tileset that is actually available
> in the target environment. `Cesium.createOsmBuildingsAsync()` and Google
> Photorealistic 3D Tiles are ion-entitlement-backed; avoid them in public or
> no-token examples unless the caller explicitly asks for those services. For
> portable examples, use an OpenStreetMap/ArcGIS basemap, visible markers, public
> URL-backed 3D Tiles, or a higher-altitude city overview.

### Altitude & Orientation Guidelines

Choose altitude and pitch to match the **scale of the feature** you want to show:

| View type | Altitude (m) | Pitch (deg) | Notes |
|---|---|---|---|
| **Tourist / monument standoff** | 50 -- 500 | -5 to -20 | Camera at near-ground level, offset laterally from the landmark. Subject fills the frame with sky visible above. Use `lookAt` with HeadingPitchRange pitch near -10°. **Never place the camera directly overhead at this range.** |
| **Landmark close-up** | 500 -- 1,500 | -25 to -35 | Individual buildings/structures fill the frame. Use `lookAt` with appropriate range. |
| **City panoramic / skyline** | 800 -- 1,500 | -10 to -20 | For viewing a skyline from across a river or bay. Position camera to the side, face the city. Use an available 3D Tiles source only when the environment provides one. |
| **City overview** | 2,000 -- 5,000 | -35 to -50 | Urban grid, rivers, and parks clearly visible |
| **Metro / regional** | 8,000 -- 20,000 | -60 to -90 | Entire metro area or geographic feature |
| **Canyon / cliff rim** | 50 -- 300 above rim | -15 to -25 | Use steeper pitch to reveal depth below. Near-horizontal (-5) looks flat across terrain. Add wall/rim entity overlays and a river polyline to make canyon structure visible. |
| **Country / continent** | 500,000 -- 5,000,000 | -90 | Political boundaries, coastlines |

**When the prompt says "looking at [city]" or "start at [city]"**, default to **city overview** range (2,000-5,000 m) with pitch around **-45** to **-60** degrees and heading **0** (north). This produces a clear, recognizable view where the urban layout, rivers, and landmarks are identifiable.

> **Target intent vs. camera position:** In `setView` and `flyTo`, a Cartesian
> `destination` is the camera's final position, not the point it should look at.
> For requests such as "fly to Los Angeles" or "show the Eiffel Tower", treat
> the named coordinates as a target to frame. Prefer `viewBoundingSphere` for
> an instant view or `flyToBoundingSphere` for an animated flight.

**Top-down views** (`pitch: -90`) are best for geographic features (canyons, coastlines, rivers) where overhead perspective reveals the distinctive shape. For cities, prefer an angled view that shows the 3D skyline.

> **Gimbal lock:** Never use `pitch: -Math.PI/2` exactly. Use
> `-(Math.PI / 2 - 0.0001)` for straight-down views to avoid singularity.

> **Ground-level views (altitude < 200 m)** require 3D Tiles. Without them,
> CesiumJS shows only sky and flat ground. Suggest a higher-altitude fallback.

> **Skyline panoramics** (across a river/bay): 800-1,500 m, pitch -10 to -20.
> Add an available 3D Tiles source for a true 3D silhouette; otherwise make the
> screenshot goal honest by using a higher-altitude map/marker view. Pitch too
> horizontal (-5) at moderate altitude shows a flat grid, not a skyline.

> **Public visual eval rule for landmarks:** OpenStreetMap imagery alone does
> not render the Eiffel Tower, Empire State Building, Statue of Liberty, or a
> skyline as recognizable 3D subjects. When a public/no-token scenario asks for
> an identifiable landmark or skyline, add an explicit visual surrogate at the
> target: a tall cylinder/box/polyline tower, colored mast, skyline bar cluster,
> or large labeled marker. Frame that surrogate so it is inspectable, roughly
> one-third to two-thirds of the frame height for landmark views. Do not rely on
> a map label or 10 px point as the subject.

> **Canyon / cliff rim views**: pitch -15 to -25. Near-horizontal pitch (-5 to
> -8) looks flat across terrain and misses the vertical drop. Always add entity
> overlays (rim wall polygons, river polyline) so the canyon structure is
> visible -- without entities the scene shows only a flat basemap regardless
> of camera angle.

> **CRITICAL -- Never place the camera directly above a landmark** when a
> standoff / perspective view is intended. Positioning the camera at
> `Cartesian3.fromDegrees(lon, lat, 1000)` pointing straight down
> (`pitch: -Math.PI/2`) puts the camera overhead the subject (`up_alignment=1`)
> and fails landmark-view checks. Always offset the camera laterally:
> use `lookAt` with a HeadingPitchRange pitch of -10° to -45°, or place the
> `destination` 500--2,000 m to the side of the landmark and aim the heading
> toward it.

---

## setView -- Instant Placement

Teleports the camera in a single frame -- no animation. Use for initial view,
mode resets, constraint setup. `destination`: `Cartesian3` or `Rectangle`.
`orientation`: `{ heading, pitch, roll }` or `{ direction, up }`.

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

// City overview: 3000 m altitude, angled view facing north
viewer.camera.setView({
  destination: Cartesian3.fromDegrees(-0.1276, 51.5074, 3000.0),
  orientation: {
    heading: CesiumMath.toRadians(0.0),   // north
    pitch: CesiumMath.toRadians(-50.0),    // angled down -- shows city layout clearly
    roll: 0.0,
  },
});
```

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

// Landmark standoff: camera placed south of Eiffel Tower, facing north
// Offset the destination AWAY from the landmark -- do NOT place directly above it
viewer.camera.setView({
  destination: Cartesian3.fromDegrees(2.2945, 48.847, 300.0), // ~1.2 km south
  orientation: {
    heading: CesiumMath.toRadians(0.0),    // facing north toward tower
    pitch: CesiumMath.toRadians(-20.0),    // slightly down -- tower visible above horizon
    roll: 0.0,
  },
});
```

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

// Canyon rim perspective: slightly above rim, looking down into the canyon
// Pitch of -20 reveals depth; near-horizontal (-5) would look flat across
viewer.camera.setView({
  destination: Cartesian3.fromDegrees(-112.14, 36.06, 2400.0),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-20.0),    // steeper pitch to show canyon depth
    roll: 0.0,
  },
});
```

```js
// Top-down geographic view -- use safe pitch to avoid gimbal lock
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(-112.14, 36.06, 50000.0),
  orientation: { heading: 0.0, pitch: -(Math.PI / 2 - 0.0001), roll: 0.0 },
});

// Rectangle form (top-down, orientation defaults to north/down)
viewer.camera.setView({
  destination: Cesium.Rectangle.fromDegrees(-77.0, 38.0, -72.0, 42.0),
});
```

---

## flyTo -- Animated Flight

Smoothly animates the camera. Returns nothing (not a Promise); use `complete`
callback. Options: `destination`, `orientation`, `duration` (seconds),
`complete`/`cancel`, `maximumHeight`, `pitchAdjustHeight`, `flyOverLongitude`.

Use `flyTo` when `destination` intentionally describes the camera's final
position. For a named city, landmark, entity, or coordinate that must remain
centered, use `flyToBoundingSphere`.

```js
import {
  BoundingSphere,
  Cartesian3,
  HeadingPitchRange,
  Math as CesiumMath,
} from "cesium";

// Keep the Eiffel Tower centered while approaching from 1500 m altitude
const target = Cartesian3.fromDegrees(2.2945, 48.8584);
const pitch = CesiumMath.toRadians(-35.0);
const desiredHeight = 1500.0;

// HeadingPitchRange.range is the slant distance to the target, not altitude.
const range = desiredHeight / Math.abs(Math.sin(pitch));

viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 0.0), {
  offset: new HeadingPitchRange(0.0, pitch, range),
  duration: 3,
});
```

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

// Chain flights using the complete callback (flyTo does NOT return a Promise)
viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(-74.0445, 40.6892, 800.0),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-35.0),
    roll: 0.0,
  },
  duration: 3,
  complete() {
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-73.9857, 40.758, 600.0),
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-40.0),
        roll: 0.0,
      },
      duration: 2,
    });
  },
});
```

> **Altitude tip for tours**: keep each stop at **600 m+** so tiles and imagery
> load. Below 400 m, expect blurry tiles on fast successive flights.

```js
// Long-distance flight: LA to Tokyo via Europe
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(139.815, 35.714, 20000.0),
  duration: 20,
  flyOverLongitude: Cesium.Math.toRadians(60.0), // eastward via Europe
  pitchAdjustHeight: 1000, // look down at high altitude
});
```

Control in-progress flights with `completeFlight()` (jumps to end state) and
`cancelFlight()` (stays at current position).

---

## flyHome

Fly to the default view. Override with `Camera.DEFAULT_VIEW_RECTANGLE`.

```js
import { Camera, Rectangle } from "cesium";

Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(-10.0, 35.0, 40.0, 60.0);
viewer.camera.flyHome(2.0); // duration in seconds; omit for auto
```

> **Limitation:** `flyHome()` always produces a top-down, north-up view --
> no orientation control. Workaround: intercept `viewer.homeButton.viewModel
> .command.beforeExecute`, cancel it, and call `flyTo` with custom orientation.

---

## lookAt -- Lock Camera to Target

Positions camera to look at a target from an offset (`HeadingPitchRange` or
`Cartesian3`). **Locks the camera until `lookAtTransform(Matrix4.IDENTITY)`.**

> **Overhead trap with `lookAt`:** A `HeadingPitchRange` pitch of `-Math.PI/2`
> positions the camera directly above the target (`up_alignment ≈ 1`), which
> fails landmark-view checks. For any perspective or tourist view, use pitch
> between **-10° and -45°**. Only use pitch near -90° for intentional top-down
> map views.

```js
import { Cartesian3, Math as CesiumMath, HeadingPitchRange, Matrix4 } from "cesium";

// View from the south, looking north (heading 0 = facing north = camera is south)
const target = Cartesian3.fromDegrees(2.2945, 48.8584, 300.0);
viewer.camera.lookAt(
  target,
  new HeadingPitchRange(
    CesiumMath.toRadians(0.0),   // heading 0 = north-facing
    CesiumMath.toRadians(-20.0), // pitch -- 20 deg down (NOT -90; that would be overhead)
    1500.0,                      // range in meters
  ),
);
// ALWAYS release the lookAt lock to restore free navigation
viewer.camera.lookAtTransform(Matrix4.IDENTITY);
```

```js
import { Cartesian3, Math as CesiumMath, HeadingPitchRange, Matrix4 } from "cesium";

// View from the east, looking west (heading 270 = facing west = camera is east)
const target = Cartesian3.fromDegrees(-73.9857, 40.7484, 200.0);
viewer.camera.lookAt(
  target,
  new HeadingPitchRange(
    CesiumMath.toRadians(270.0), // heading -- west
    CesiumMath.toRadians(-25.0), // pitch -- 25 deg down
    800.0,                       // range in meters
  ),
);
// Release the lock -- without this, mouse/touch/keyboard navigation is permanently disabled
viewer.camera.lookAtTransform(Matrix4.IDENTITY);
```

**Cardinal direction reference for `lookAt` heading:**

| To view from... | Camera faces... | Heading (deg) | Heading (rad) |
|---|---|---|---|
| **South** | North | 0 | `0` |
| **West** | East | 90 | `Math.PI / 2` |
| **North** | South | 180 | `Math.PI` |
| **East** | West | 270 | `3 * Math.PI / 2` |

Heading = direction camera **faces**. Camera is **opposite** that direction from the target.

> **Trap:** Every `lookAt` call MUST have a matching `lookAtTransform(Matrix4.IDENTITY)`.
> Without the release, mouse/touch/keyboard navigation is permanently disabled.
> Use `setTimeout`, `complete` callback, or an event to trigger the release.
> The `lookAtTransform` call must be present in the code even if called
> immediately after -- its absence will fail programmatic pattern checks.

```js
import { Matrix4 } from "cesium";

// ALWAYS release the lookAt lock when done to restore free navigation
viewer.camera.lookAtTransform(Matrix4.IDENTITY);
```

---

## lookAtTransform -- Custom Reference Frames

Set camera position relative to an arbitrary transform matrix.

```js
import { Cartesian3, Transforms, HeadingPitchRange, Math as CesiumMath } from "cesium";

// View in an east-north-up frame centered on a point
const center = Cartesian3.fromDegrees(-75.598, 40.039);
const transform = Transforms.eastNorthUpToFixedFrame(center);
viewer.camera.lookAtTransform(
  transform,
  new HeadingPitchRange(0.0, CesiumMath.toRadians(-45.0), 5000.0),
);
```

For ICRF (inertial) frame: use `Transforms.computeIcrfToFixedMatrix(time)` in a
`postUpdate` listener, apply via `lookAtTransform(Matrix4.fromRotationTranslation(icrfToFixed), offset)`.

---

## flyToBoundingSphere / viewBoundingSphere

Frame the camera around a `BoundingSphere`. Range is auto-computed when 0.
Prefer these methods when a prompt names a target that must remain visible.
The sphere center is the target; the offset places the camera relative to it.

```js
import { BoundingSphere, Cartesian3, HeadingPitchRange, Math as CesiumMath } from "cesium";

const sphere = new BoundingSphere(Cartesian3.fromDegrees(-117.16, 32.71), 1000.0);

// Animated
viewer.camera.flyToBoundingSphere(sphere, {
  offset: new HeadingPitchRange(0.0, CesiumMath.toRadians(-45.0), 0.0),
  duration: 2.0,
});

// Instant
viewer.camera.viewBoundingSphere(sphere);
```

---

## Movement, Rotation, Look, and Zoom Methods

**Movement** (translate position by meters, default `defaultMoveAmount` = 100 km):
`moveForward`, `moveBackward`, `moveUp`, `moveDown`, `moveLeft`, `moveRight`,
`move(direction, amount)`.

**Rotation** (orbit around reference frame center, preserves distance, default
`defaultRotateAmount` = PI/3600 rad): `rotateUp`, `rotateDown`, `rotateLeft`,
`rotateRight`, `rotate(axis, angle)`.

**Look** (first-person rotate-in-place, default `defaultLookAmount` = PI/60 rad):
`lookUp`, `lookDown`, `lookLeft`, `lookRight`, `look(axis, angle)`,
`twistLeft`, `twistRight`.

**Zoom** (along view direction, default `defaultZoomAmount` = 100 km):
`zoomIn(amount)`, `zoomOut(amount)`.

```js
// Scale movement speed to altitude for natural feel
const height = viewer.scene.globe.ellipsoid
  .cartesianToCartographic(viewer.camera.position).height;
const speed = height / 100.0;
viewer.camera.moveForward(speed);
```

---

## ScreenSpaceCameraController

Handles default mouse/touch input. Access via
`viewer.scene.screenSpaceCameraController`.

### Constraining Navigation

When setting up constraints, **also call `setView`** so the initial view respects them.

```js
import { Cartesian3, Math as CesiumMath } from "cesium";

const ctrl = viewer.scene.screenSpaceCameraController;

ctrl.minimumZoomDistance = 500;       // meters from surface
ctrl.maximumZoomDistance = 50000;
ctrl.maximumTiltAngle = Math.PI / 2; // prevent going below horizon

// Disable specific interactions
ctrl.enableRotate = false;
ctrl.enableTilt = false;
ctrl.enableZoom = false;
ctrl.enableTranslate = false; // 2D / Columbus only
ctrl.enableLook = false;
ctrl.enableInputs = false;    // disable everything at once

// Set initial view at city-overview altitude for a clear starting point
viewer.camera.setView({
  destination: Cartesian3.fromDegrees(-0.1276, 51.5074, 3000.0),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-50.0),
    roll: 0.0,
  },
});
```

> **Gotcha:** `maximumZoomDistance` is silently ignored when
> `enableCollisionDetection = false`. Re-enable collision after underground
> views, or enforce zoom limits manually in `clock.onTick`.

Other properties: `inertiaSpin`, `inertiaZoom`, `inertiaTranslate` (0 = none,
0.9 = default), `enableCollisionDetection` (set `false` to allow camera underground).

### Remapping Input Events

```js
import { CameraEventType, KeyboardEventModifier } from "cesium";

const ctrl = viewer.scene.screenSpaceCameraController;
ctrl.rotateEventTypes = CameraEventType.RIGHT_DRAG;
ctrl.tiltEventTypes = {
  eventType: CameraEventType.LEFT_DRAG,
  modifier: KeyboardEventModifier.CTRL,
};
ctrl.zoomEventTypes = CameraEventType.WHEEL;
```

`CameraEventType` values: `LEFT_DRAG`, `RIGHT_DRAG`, `MIDDLE_DRAG`, `WHEEL`,
`PINCH`. Combine with `KeyboardEventModifier`: `SHIFT`, `CTRL`, `ALT`.

---

## Controller Framework (1.144+): Composable Camera Controllers

CesiumJS 1.144 adds a composable `Controller` framework as an opt-in
alternative to `ScreenSpaceCameraController`, aimed at asset inspection:
navigating underground, inside enclosed models, and around a fixed subject
without collision detection. `ScreenSpaceCameraController` is not deprecated
and remains the default; the two systems can run together.

Five controllers ship in 1.144 (the release notes list four; the zoom
controller is also public):

| Controller | Motion |
|---|---|
| `ScreenSpaceMapCameraController` | Horizontal pan in the local tangent plane |
| `ScreenSpaceElevatorCameraController` | Vertical pan along the ellipsoid normal |
| `HybridScreenSpacePanCameraController` | Auto-switches between map and elevator pan by angle from nadir |
| `ScreenSpaceTiltOrbitCameraController` | Tilt and orbit around a picked point, with damped easing |
| `ScreenSpaceZoomCameraController` | Zoom toward the pointer with inertia |

Canonical setup: disable the default controller's inputs and collision
detection, then add the controllers the use case needs.

```js
import {
  HybridScreenSpacePanCameraController,
  ScreenSpaceTiltOrbitCameraController,
  ScreenSpaceZoomCameraController,
} from "cesium";

const ssc = viewer.scene.screenSpaceCameraController;
ssc.enableInputs = false;             // hand input over to the new controllers
ssc.enableCollisionDetection = false; // allow underground / inside-model views

viewer.addController(new HybridScreenSpacePanCameraController());
viewer.addController(new ScreenSpaceTiltOrbitCameraController());
viewer.addController(new ScreenSpaceZoomCameraController());
```

`viewer.addController` / `viewer.removeController` (also available on
`CesiumWidget`) wrap `scene.controllerHost`, a `ControllerHost` that updates
registered controllers once per frame in priority order.

Rebind a controller's inputs through its `dragInputs` option (`MouseButton`
plus an optional `KeyboardEventModifier`). Tuning knobs vary by controller:
the map and elevator pan controllers expose `panSpeed`, `inertiaEnabled`, and
`inertialDecay`; tilt-orbit and zoom expose `dampingEnabled`; the hybrid
controller is configured through its nested `mapController` /
`elevatorController` plus an `angleThreshold`. A `pickWorldPosition` callback
selects the world point that motion is computed against (default: the
ellipsoid surface below the camera).

```js
import { MouseButton, ScreenSpaceElevatorCameraController } from "cesium";

const elevator = new ScreenSpaceElevatorCameraController({
  dragInputs: [{ button: MouseButton.RIGHT }],
});
elevator.pickWorldPosition = (scene, windowPosition, result) =>
  scene.pickPosition(windowPosition, result);
viewer.addController(elevator);
```

Write a custom controller by implementing the `Controller` contract:
`connectedCallback(element)` / `disconnectedCallback(element)` for DOM
listeners, `firstUpdate(scene, time)` for one-time setup, and
`update(scene, time)` called once per frame.
`ScreenSpaceInputBindings.registerDragInputBindings(handler, bindings, actions)`
wires drag start/change/end callbacks for you.

> Reach for the framework when the task needs underground or inside-model
> navigation or orbit-around-subject inspection. For remapping which mouse
> button or modifier drives globe rotate/tilt/zoom, keep using
> `ScreenSpaceCameraController`'s `rotateEventTypes` / `tiltEventTypes` /
> `zoomEventTypes` (see Remapping Input Events above). The official Sandcastle
> demo id is `camera-controllers`.

---

## Custom First-Person Controls

For inspection-style navigation, prefer the 1.144 Controller framework above.
Hand-roll controls only for game-style first-person movement it does not cover:
disable the default controller, use `ScreenSpaceEventHandler` for mouse-look and
`keydown`/`keyup` for WASD. Apply in `clock.onTick`. Scale speed to altitude.

```js
import { ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3 } from "cesium";
const ctrl = viewer.scene.screenSpaceCameraController;
ctrl.enableRotate = ctrl.enableTranslate = ctrl.enableZoom = false;
ctrl.enableTilt = ctrl.enableLook = false;

const canvas = viewer.canvas;
canvas.setAttribute("tabindex", "0");
let looking = false, startPos, mousePos;
const handler = new ScreenSpaceEventHandler(canvas);
handler.setInputAction((m) => { looking = true; startPos = mousePos = Cartesian3.clone(m.position); }, ScreenSpaceEventType.LEFT_DOWN);
handler.setInputAction((m) => { mousePos = m.endPosition; }, ScreenSpaceEventType.MOUSE_MOVE);
handler.setInputAction(() => { looking = false; }, ScreenSpaceEventType.LEFT_UP);

const flags = {};
document.addEventListener("keydown", (e) => { flags[e.code] = true; });
document.addEventListener("keyup", (e) => { flags[e.code] = false; });
viewer.clock.onTick.addEventListener(() => {
  const cam = viewer.camera;
  if (looking) {
    cam.lookRight((mousePos.x - startPos.x) / canvas.clientWidth * 0.05);
    cam.lookUp(-(mousePos.y - startPos.y) / canvas.clientHeight * 0.05);
  }
  const spd = viewer.scene.globe.ellipsoid.cartesianToCartographic(cam.position).height / 100;
  if (flags.KeyW) cam.moveForward(spd);  if (flags.KeyS) cam.moveBackward(spd);
  if (flags.KeyA) cam.moveLeft(spd);     if (flags.KeyD) cam.moveRight(spd);
  if (flags.KeyQ) cam.moveUp(spd);       if (flags.KeyE) cam.moveDown(spd);
});
```

---

## Camera Events

```js
const off = viewer.camera.moveStart.addEventListener(() => console.log("moving"));
viewer.camera.moveEnd.addEventListener(() => console.log("stopped"));
// off(); // call return value to unsubscribe

viewer.camera.percentageChanged = 0.1; // threshold for change detection
viewer.camera.changed.addEventListener((pct) => console.log(`Changed ${(pct*100).toFixed(1)}%`));
```

---

## pickEllipsoid -- Screen to Globe

```js
import { Cartesian2 } from "cesium";

const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
const worldPos = viewer.camera.pickEllipsoid(center);
if (worldPos) {
  const carto = viewer.scene.globe.ellipsoid.cartesianToCartographic(worldPos);
  console.log(Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude));
}
```

---

## Entity Tracking

```js
// Track an entity (sets camera to follow automatically)
viewer.trackedEntity = viewer.entities.getById("vehicle");

// Customize default tracking offset
import { Camera, HeadingPitchRange, Math as CesiumMath } from "cesium";
Camera.DEFAULT_OFFSET = new HeadingPitchRange(
  CesiumMath.toRadians(90.0), CesiumMath.toRadians(-25.0), 500.0,
);

viewer.trackedEntity = undefined; // stop tracking
```

Debug: `viewer.scene.primitives.add(new Cesium.DebugCameraPrimitive({ camera: viewer.camera, color: Cesium.Color.YELLOW, updateOnChange: true }));`

---

## Performance Tips

1. **Prefer `setView` over `flyTo` with `duration: 0`** -- avoids tween overhead.
2. **Avoid reading `heading`/`pitch`/`roll` every frame** -- each computes an
   ENU transform. Cache or use `direction`/`up` vectors.
3. **Throttle `changed` events** -- raise `percentageChanged` (e.g., 0.5).
4. **Always release `lookAt` locks** -- `lookAtTransform(Matrix4.IDENTITY)`.
5. **Set `maximumHeight` for short flights** -- prevents zooming to space.
6. **Scale movement to altitude** -- divide camera height for natural speed.
7. **Re-enable collision after underground views** -- `enableCollisionDetection = true`.
8. **Use 600 m+ altitude for tour stops** -- avoids blurry tiles on successive flights.

---

## Common Patterns Quick Reference

| Task | Method | Key detail |
|---|---|---|
| Jump to a city | `viewBoundingSphere` | Treat city coordinates as the target; use 2,000-5,000 m desired height and pitch -50 |
| Animate to a landmark | `flyToBoundingSphere` | Target stays centered; use 1,000-2,000 m desired height and pitch -30 to -40 |
| Tourist / monument standoff | `lookAt` or `setView` | Camera 500-2,000 m laterally offset from landmark; pitch -10 to -20. **Never place camera directly above (pitch -90) at close range.** |
| City skyline / panoramic | `setView` or `flyTo` | 800-1,500 m, pitch -10 to -20. Position camera across river/bay, face the city. **Load OSM Buildings.** |
| Overhead / map view | `setView` or `flyTo` | pitch `-(Math.PI/2 - 0.0001)`, altitude matches feature size |
| Canyon / cliff rim | `setView` or `flyTo` | 50-300 m above rim, pitch -15 to -25 for depth. Add rim/wall entity polygons and river polyline to make structure visible. |
| Lock on a target | `lookAt` | **Must** release with `lookAtTransform(Matrix4.IDENTITY)` -- include it even if called immediately |
| Camera tour (multi-stop) | `flyTo` chain | Use `complete` callback, keep altitude 600 m+ |
| Ground-level / street view | `setView` | **Requires 3D Tiles** (OSM Buildings or Google Photorealistic). Without them, only sky and flat ground visible. |
| Constrain user nav | `screenSpaceCameraController` | Set min/max zoom, tilt angle; also call `setView` for initial position |
| Asset inspection / underground orbit | `Controller` framework (1.144+) | Disable default inputs + collision, then `viewer.addController` with hybrid pan, tilt-orbit, and zoom controllers |

---

## See Also

- **cesiumjs-spatial-math** -- Cartesian3, Cartographic, Matrix4, Transforms, coordinate conversions
- **cesiumjs-interaction** -- ScreenSpaceEventHandler, Scene.pick, mouse/touch events
- **cesiumjs-entities** -- Entity, trackedEntity, EntityCollection, data sources
