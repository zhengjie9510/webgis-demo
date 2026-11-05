---
name: cesiumjs-time-properties
description: "CesiumJS time, properties, and animation - Clock, JulianDate, TimeInterval, Property, SampledProperty, CallbackProperty, PathMode, interval and sampled path materials, interpolation, splines, CZML temporal data. Use when making entity attributes or path materials time-dynamic, configuring the simulation clock, interpolating positions, or working with sampled, interval, or callback properties."
---
# CesiumJS Time, Properties & Animation

Version baseline: CesiumJS v1.144

Covers the temporal data-binding layer: Clock/JulianDate time system, the Property hierarchy that makes entity attributes change over time, interpolation algorithms, splines, and material properties. Properties live here (not with Entities) because SampledProperty and CallbackProperty are meaningless without Clock/JulianDate. The Material class (Fabric) belongs in cesiumjs-materials-shaders.

## JulianDate -- The Time Primitive

Stores whole days + fractional seconds separately for precision. Always uses TAI internally.

```js
import { JulianDate } from "cesium";

// Creation: fromIso8601 (most common), fromDate, now
const date = JulianDate.fromIso8601("2025-06-15T12:00:00Z");
const jd = JulianDate.fromDate(new Date("2025-06-15T12:00:00Z"));
const now = JulianDate.now();

// Conversion: toIso8601, toDate, toGregorianDate
const iso = JulianDate.toIso8601(date); // "2025-06-15T12:00:00Z"
const greg = JulianDate.toGregorianDate(date); // {year, month, day, hour, ...}

// Arithmetic -- all require a result parameter to avoid allocations
const r = new JulianDate();
JulianDate.addSeconds(date, 3600, r); // also: addMinutes, addHours, addDays

// Differences and comparisons
const stop = JulianDate.addHours(date, 24, new JulianDate());
JulianDate.secondsDifference(stop, date); // 86400
JulianDate.lessThan(date, stop);          // true
JulianDate.compare(date, stop);           // negative (date < stop)
```

## Clock -- Simulation Time Controller

The Viewer creates a Clock automatically. Configure it to control playback speed and bounds.

```js
import { Viewer, JulianDate, ClockRange, ClockStep } from "cesium";

const viewer = new Viewer("cesiumContainer");
const start = JulianDate.fromIso8601("2025-06-15T00:00:00Z");
const stop = JulianDate.addHours(start, 24, new JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = ClockRange.LOOP_STOP; // loop at end
viewer.clock.multiplier = 60;                   // 60x real-time
viewer.clock.shouldAnimate = true;
viewer.timeline.zoomTo(start, stop);

// Per-frame callback: compute a [0,1] fraction for camera or property animation
viewer.clock.onTick.addEventListener((clock) => {
  const elapsed = JulianDate.secondsDifference(clock.currentTime, clock.startTime);
  const total = JulianDate.secondsDifference(clock.stopTime, clock.startTime);
  const t = Math.max(0, Math.min(1, elapsed / total));
  // Example: interpolate camera position linearly between two points
  // const dest = Cartesian3.lerp(startPos, endPos, t, new Cartesian3());
  // viewer.camera.setView({ destination: dest, orientation: { heading: 0, pitch: CesiumMath.toRadians(-30), roll: 0 } });
});
```

**Manual clock advancement** -- call `viewer.clock.tick()` to advance the clock by one frame outside the render loop (useful for setting up a mid-interval state before a screenshot):

```js
// Advance to midpoint before screenshot
viewer.clock.currentTime = JulianDate.addSeconds(start, 15, new JulianDate());
viewer.clock.tick(); // fires onTick listeners immediately
```

| ClockRange | Behavior |
|---|---|
| `UNBOUNDED` | Advances forever in both directions |
| `CLAMPED` | Stops at start/stop time |
| `LOOP_STOP` | Wraps from stop back to start |

| ClockStep | Behavior |
|---|---|
| `TICK_DEPENDENT` | Each tick advances by `multiplier` seconds (frame-dependent) |
| `SYSTEM_CLOCK_MULTIPLIER` | Elapsed wall time x `multiplier` (default) |
| `SYSTEM_CLOCK` | Real-time; ignores multiplier |

## TimeInterval & TimeIntervalCollection

```js
import { TimeInterval, TimeIntervalCollection, JulianDate } from "cesium";

const interval = TimeInterval.fromIso8601({
  iso8601: "2025-06-15T00:00:00Z/2025-06-16T00:00:00Z",
  data: { phase: "daylight" },  // attach arbitrary data
});
TimeInterval.contains(interval, JulianDate.fromIso8601("2025-06-15T12:00:00Z")); // true

// Used by Entity.availability to cull entities outside the time window
const availability = new TimeIntervalCollection([
  new TimeInterval({
    start: JulianDate.fromIso8601("2025-06-15T00:00:00Z"),
    stop: JulianDate.fromIso8601("2025-06-16T00:00:00Z"),
  }),
]);
```

## Property System -- Time-Varying Values

Every entity attribute is a Property. CesiumJS calls `property.getValue(time)` each frame.

### ConstantProperty

Returns the same value regardless of time. CesiumJS auto-wraps raw values, so explicit use is rare.

```js
import { ConstantProperty, Color } from "cesium";
const prop = new ConstantProperty(Color.RED);
prop.setValue(Color.BLUE); // fires definitionChanged
```

### SampledProperty -- Interpolated Time Series

Stores discrete samples and interpolates. Type can be `Number`, `Cartesian3`, `Color`, or any `Packable`.

```js
import { SampledProperty, JulianDate, LagrangePolynomialApproximation, ExtrapolationType } from "cesium";

const prop = new SampledProperty(Number);
const t0 = JulianDate.fromIso8601("2025-06-15T00:00:00Z");
prop.addSample(t0, 1.0);
prop.addSample(JulianDate.addSeconds(t0, 60, new JulianDate()), 2.5);
prop.addSample(JulianDate.addSeconds(t0, 120, new JulianDate()), 1.0);
prop.getValue(JulianDate.addSeconds(t0, 30, new JulianDate())); // ~1.75

// Default: LinearApproximation degree 1. Switch to smoother Lagrange:
prop.setInterpolationOptions({ interpolationDegree: 5, interpolationAlgorithm: LagrangePolynomialApproximation });
prop.forwardExtrapolationType = ExtrapolationType.HOLD; // hold last value outside range
```

### SampledPositionProperty -- Interpolated Positions

Specialized for Cartesian3 positions. Supports reference frames (`ReferenceFrame.FIXED` default, or `INERTIAL`).

```js
import { SampledPositionProperty, JulianDate, Cartesian3, LagrangePolynomialApproximation, ExtrapolationType } from "cesium";

const position = new SampledPositionProperty();
const start = JulianDate.fromIso8601("2025-06-15T00:00:00Z");
for (let i = 0; i <= 360; i += 45) {
  const rad = (i * Math.PI) / 180;
  position.addSample(
    JulianDate.addSeconds(start, i, new JulianDate()),
    Cartesian3.fromDegrees(-112 + 0.045 * Math.cos(rad), 36 + 0.03 * Math.sin(rad), 2000 + Math.random() * 500),
  );
}
position.setInterpolationOptions({ interpolationDegree: 5, interpolationAlgorithm: LagrangePolynomialApproximation });
position.forwardExtrapolationType = ExtrapolationType.HOLD;
```

For screenshot or evaluation scenes, a sampled path alone is often not enough. Add an obvious marker to the same moving entity (`point`, `billboard`, or `model`) so the current sample is recognizable at the clock's `currentTime`.

```js
import { Color } from "cesium";

const aircraft = viewer.entities.add({
  position,
  point: {
    pixelSize: 14,
    color: Color.CYAN,
    outlineColor: Color.BLACK,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  path: {
    width: 4,
    leadTime: 180,
    trailTime: 180,
    material: Color.YELLOW,
  },
});
```

| Algorithm | Best For | Degree |
|---|---|---|
| `LinearApproximation` | Fast piecewise-linear | 1 (fixed) |
| `LagrangePolynomialApproximation` | Smooth curves from sparse samples | 1--9 |
| `HermitePolynomialApproximation` | Smooth curves with velocity derivatives | 1--9 |

### CallbackProperty -- Computed on Demand

Evaluates a function every frame. Second argument (`isConstant`) must be `false` if value changes.

```js
import { CallbackProperty, Color, JulianDate } from "cesium";

// Pulsing alpha via sine wave
const startTime = JulianDate.now();
const pulse = new CallbackProperty((time, result) => {
  const s = JulianDate.secondsDifference(time, startTime);
  return Color.RED.withAlpha(0.5 + 0.5 * Math.sin(s * 2), result ?? new Color());
}, false);

// Hue cycling -- full color wheel every `period` seconds using Color.fromHsl
// Color.fromHsl(hue 0-1, saturation 0-1, lightness 0-1, alpha 0-1, result?)
const period = 8; // seconds per full cycle
const hueCycle = new CallbackProperty((time, result) => {
  const s = JulianDate.secondsDifference(time, viewer.clock.startTime);
  const hue = (s % period) / period;
  return Color.fromHsl(hue, 0.8, 0.5, 0.8, result ?? new Color());
}, false);
// Use as: polygon.material = new ColorMaterialProperty(hueCycle);

// Growing polygon -- mutate the array, property auto-updates
const pts = [/* initial Cartesian3[] */];
const dynamicPts = new CallbackProperty(() => pts, false);
```

### CompositeProperty -- Stitching Properties Over Time

Delegates to different sub-properties for different time ranges. Each interval's `data` is a Property.

```js
import { CompositeProperty, ConstantProperty, SampledProperty, TimeInterval, JulianDate } from "cesium";

const composite = new CompositeProperty();
composite.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2025-06-15T00:00:00Z/2025-06-15T12:00:00Z", data: new ConstantProperty(1.0) }));
const sampled = new SampledProperty(Number);
sampled.addSample(JulianDate.fromIso8601("2025-06-15T12:00:00Z"), 1.0);
sampled.addSample(JulianDate.fromIso8601("2025-06-16T00:00:00Z"), 5.0);
composite.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2025-06-15T12:00:00Z/2025-06-16T00:00:00Z", isStartIncluded: false, data: sampled }));
```

### VelocityOrientationProperty -- Auto-Orient Along Path

Computes Quaternion from a position property's velocity. Essential for vehicles and aircraft.

```js
import { VelocityOrientationProperty, SampledPositionProperty } from "cesium";
const position = new SampledPositionProperty();
// ... add samples ...
viewer.entities.add({
  position, orientation: new VelocityOrientationProperty(position),
  model: { uri: "aircraft.glb", minimumPixelSize: 64 },
});
```

For robust visual recognition, do not rely only on an external model URI unless the asset is guaranteed to load. Pair the model with a `point` or `billboard` marker when the prompt expects the aircraft/satellite/vehicle itself to be visible.

### ReferenceProperty -- Cross-Entity Binding

Links one entity's property to another by ID string (`"entityId#propertyPath"`).

```js
import { ReferenceProperty } from "cesium";
viewer.entities.add({ id: "leader", position: Cartesian3.fromDegrees(-75, 40, 1000) });
viewer.entities.add({ id: "follower",
  position: ReferenceProperty.fromString(viewer.entities, "leader#position"),
  point: { pixelSize: 10 } });
```

This is useful after loading CZML: keep the CZML-driven path in the data source, then add a normal viewer entity marker whose position references the CZML entity. That makes the current subject visible and easy to inspect without duplicating samples.

## Material Properties

Control entity surface appearance. All options accept raw values or Property instances for time-dynamic behavior. Surface types: `ColorMaterialProperty`, `ImageMaterialProperty`, `GridMaterialProperty`, `StripeMaterialProperty`, `CheckerboardMaterialProperty`. Polyline types: `PolylineArrowMaterialProperty`, `PolylineDashMaterialProperty`, `PolylineGlowMaterialProperty`, `PolylineOutlineMaterialProperty`.

```js
import { ColorMaterialProperty, SampledProperty, Color, JulianDate } from "cesium";

const solid = new ColorMaterialProperty(Color.RED);

// Time-varying color via SampledProperty
const colorProp = new SampledProperty(Color);
const t0 = JulianDate.fromIso8601("2025-06-15T00:00:00Z");
colorProp.addSample(t0, Color.BLUE);
colorProp.addSample(JulianDate.addHours(t0, 6, new JulianDate()), Color.RED);
const animated = new ColorMaterialProperty(colorProp);
```

## Segmented Path Materials (1.143+)

`PathMode.WHOLE` preserves the original behavior: the material evaluated at the
current simulation time colors the entire visible path. Use
`PathMode.PORTIONS` to keep past and future path portions colored by the
material at each portion's time.

Prefer interval materials for discrete phases because Cesium splits only at
the interval boundaries:

```js
import {
  Color, ColorMaterialProperty, CompositeMaterialProperty,
  PathMode, TimeInterval,
} from "cesium";

const phases = new CompositeMaterialProperty();
phases.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2026-07-15T12:00:00Z/2026-07-15T12:02:00Z",
  isStopIncluded: false,
  data: new ColorMaterialProperty(Color.LIME),
}));
phases.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2026-07-15T12:02:00Z/2026-07-15T12:04:00Z",
  data: new ColorMaterialProperty(Color.ORANGE),
}));

viewer.entities.add({
  position, // a time-dynamic PositionProperty
  path: {
    material: phases,
    materialMode: PathMode.PORTIONS,
    resolution: 30,
    leadTime: 240,
    trailTime: 240,
    width: 6,
  },
});
```

`materialMode` is a `Property`, not only a fixed enum. Use a time-varying mode
when the same path should switch rendering strategies during a simulation:

```js
import {
  PathGraphics, PathMode, TimeInterval, TimeIntervalCollectionProperty,
} from "cesium";

const mode = new TimeIntervalCollectionProperty();
mode.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2026-07-15T12:00:00Z/2026-07-15T12:02:00Z",
  isStopIncluded: false,
  data: PathMode.PORTIONS,
}));
mode.intervals.addInterval(TimeInterval.fromIso8601({
  iso8601: "2026-07-15T12:02:00Z/2026-07-15T12:04:00Z",
  data: PathMode.WHOLE,
}));

const path = new PathGraphics({ material: phases, materialMode: mode });
viewer.entities.add({ position, path });
```

For an interpolated color transition, pass a `SampledProperty(Color)` to
`ColorMaterialProperty` and keep `materialMode: PathMode.PORTIONS`. Cesium
creates split points at roughly each `resolution` step. Use the largest step
that preserves the intended transition and bound `leadTime`/`trailTime`; tiny
steps over long windows create many polylines.

- Positive fractional resolutions are valid. In `PORTIONS` mode, a non-positive
  resolution safely falls back to 60 seconds.
- Keep the default `WHOLE` mode for constant materials; segmentation adds no
  value.
- CesiumJS 1.143 types include `materialMode` in
  `PathGraphics.ConstructorOptions` but omit the instance member. Set it in the
  constructor/entity object as above for TypeScript; direct runtime mutation is
  valid JavaScript but needs a narrow local type augmentation or cast.

## Splines -- Parametric Curve Interpolation

Splines use unitless parametric time (not JulianDate) for smooth animation curves.

```js
import { HermiteSpline, CatmullRomSpline, Cartesian3 } from "cesium";

// Natural cubic (C2, auto-tangents)
const spline = HermiteSpline.createNaturalCubic({
  times: [0, 1.5, 3, 4.5, 6],
  points: [
    new Cartesian3(1235398, -4810983, 4146266), new Cartesian3(1372574, -5345182, 4606657),
    new Cartesian3(-757983, -5542796, 4514323), new Cartesian3(-2821260, -5248423, 4021290),
    new Cartesian3(-2539788, -4724797, 3620093) ],
});
const point = spline.evaluate(2.0); // evaluate at parametric time t=2

// CatmullRom (C1, auto-tangents from control points)
const catmull = new CatmullRomSpline({ times: [0, 1, 2, 3], points: [p0, p1, p2, p3] });
```

| Spline | Use |
|---|---|
| `LinearSpline` | Piecewise-linear (C0), cheapest |
| `HermiteSpline` | Cubic with tangents (C1+); factories: `createNaturalCubic`, `createClampedCubic`, `createC1` |
| `CatmullRomSpline` | Auto-tangents from control points (C1) |
| `QuaternionSpline` | Rotation interpolation via SLERP (C1) |
| `ConstantSpline` | Single value for all times |
| `SteppedSpline` | Holds value until next control point |
| `MorphWeightSpline` | glTF morph target weights (C1) |

## CZML Temporal Data

CZML streams time-dynamic data. The `document` packet sets the clock; entity packets use `epoch` + offset arrays for compact positions. Position format: `[secondsFromEpoch, lon, lat, alt, ...]`.

```js
import { Viewer, CzmlDataSource, Color, ReferenceProperty } from "cesium";

const czml = [
  { id: "document", version: "1.0", clock: {
      interval: "2025-06-15T00:00:00Z/2025-06-15T06:00:00Z",
      currentTime: "2025-06-15T00:00:00Z", multiplier: 60,
      range: "LOOP_STOP", step: "SYSTEM_CLOCK_MULTIPLIER" } },
  { id: "aircraft", availability: "2025-06-15T00:00:00Z/2025-06-15T06:00:00Z",
    position: { epoch: "2025-06-15T00:00:00Z",
      cartographicDegrees: [0,-75,40,10000, 10800,-88,42,11000, 21600,-118,34,9000],
      interpolationAlgorithm: "LAGRANGE", interpolationDegree: 5 },
    point: { pixelSize: 12, color: { rgba: [0,255,255,255] },
             outlineColor: { rgba: [0,0,0,255] }, outlineWidth: 2 },
    path: { width: { number: 3 }, leadTime: { number: 10800 }, trailTime: { number: 10800 },
            material: { solidColor: { color: { rgba: [255,255,0,255] } } } } },
];

const viewer = new Viewer("cesiumContainer", { shouldAnimate: true });
const ds = await CzmlDataSource.load(czml);
viewer.dataSources.add(ds);

// Optional robust marker: references the CZML entity position but lives in viewer.entities.
viewer.entities.add({
  id: "aircraft-marker",
  position: ReferenceProperty.fromString(ds.entities, "aircraft#position"),
  point: {
    pixelSize: 16,
    color: Color.CYAN,
    outlineColor: Color.BLACK,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
});

await viewer.zoomTo(ds);
```

CZML accepts the enum name directly. To retain phase colors along a path, set
`path.materialMode` to `"PORTIONS"` and provide `path.material` as an array of
interval-tagged material packets. Keep `"WHOLE"` or omit the field for legacy
whole-path behavior.

For satellite-orbit CZML screenshots, keep the orbit path and the satellite marker distinct: the path proves the trajectory, while a large point or billboard at the current CZML position proves the satellite subject. If the view is global, use `disableDepthTestDistance: Number.POSITIVE_INFINITY` on the marker so it remains visible against the globe.

## EasingFunction -- Camera Flight Curves

Constants for `camera.flyTo` timing (not Property interpolation). Common values: `LINEAR_NONE`, `CUBIC_IN_OUT`, `QUADRATIC_IN_OUT`. Full set includes `QUARTIC`, `QUINTIC`, `SINUSOIDAL`, `EXPONENTIAL`, `CIRCULAR`, `ELASTIC`, `BACK`, `BOUNCE` variants (each with `_IN`, `_OUT`, `_IN_OUT`).

```js
import { EasingFunction, Cartesian3 } from "cesium";
viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(-75, 40, 50000),
  duration: 3.0,
  easingFunction: EasingFunction.CUBIC_IN_OUT,
});
```

## Framing Time-Dynamic Entities

A time-dynamic entity is useless if the camera is not framed on it. After building a flight or orbit, **always** explicitly frame the scene -- the default Viewer camera sits in space and will not auto-zoom to your entities. Three options, in order of preference for screenshots:

1. **`viewer.zoomTo(entityOrDataSource)`** -- best-fit framing that returns a `Promise` once tilesets/data sources are ready. Use for CZML data sources and one-shot local setups. For a single moving entity, this frames the entity's bounding sphere at its current sampled position, which often produces a near-ground close-up; for visualizing the full arc of a long route, prefer option 3.
2. **`viewer.trackedEntity = entity`** -- locks the camera to follow the entity over time. Best when the path spans large distances (cross-country flights, orbits) and you want the entity centered every frame.
3. **`viewer.camera.flyTo` / `setView`** with an explicit `Cartesian3.fromDegrees` or `Rectangle.fromDegrees` -- use when the path's extent is known and the default zoom is too wide or too tight (e.g., a JFK->LAX flight needs a continental-US framing, not a clipped airport close-up or a full-globe view).

```js
// Continental-US framing for a JFK -> LAX flight path
import { Rectangle } from "cesium";
viewer.camera.setView({
  destination: Rectangle.fromDegrees(-130, 20, -60, 50), // west, south, east, north
});
```

**Choosing framing by path scale:**

| Path scale | Recommended framing |
|---|---|
| Local (city, <50 km) | `viewer.zoomTo(entity)` or `setView` with `Cartesian3.fromDegrees(lon, lat, ~5000-50000)` |
| Regional/continental (cross-country flight) | `setView` with `Rectangle.fromDegrees(...)` covering both endpoints + ~5° padding |
| Orbital (LEO satellite, ~90 min orbit) | `setView` with `Cartesian3.fromDegrees(lon, lat, ~20-30 million m)` so the full arc curves around the visible hemisphere |
| Long-distance with continuous tracking | `viewer.trackedEntity = entity` |

For path arcs that should be fully visible (lead + trail), zoom out enough that `leadTime + trailTime` of motion fits in the viewport. If the judge can only see a fragment of the arc, the framing is too tight. For orbits, set `leadTime` and `trailTime` to cover at least one half-orbit (e.g., ~2700 seconds for LEO) so the arc visibly wraps the planet.

For long-distance flights such as JFK to LAX, set the clock to mid-flight, use `leadTime` and `trailTime` large enough to cover the route around the current time, add a visible aircraft marker, then use a continental rectangle. Do not call `zoomTo(aircraft)` for this composition unless the prompt asks for a close follow shot.

## Putting It Together: Animated Flight

Combines Clock, SampledPositionProperty, VelocityOrientationProperty, and availability. Always set `leadTime` and `trailTime` on `path` to control how much of the trail is visible relative to the current time, and explicitly frame the entity before any screenshot.

```js
import {
  Viewer, JulianDate, ClockRange, SampledPositionProperty, VelocityOrientationProperty,
  TimeIntervalCollection, TimeInterval, Cartesian3, LagrangePolynomialApproximation, Color,
} from "cesium";

const viewer = new Viewer("cesiumContainer", { shouldAnimate: true });
const start = JulianDate.fromIso8601("2025-06-15T16:00:00Z");
const stop = JulianDate.addSeconds(start, 360, new JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = ClockRange.LOOP_STOP;
viewer.clock.multiplier = 10;
viewer.timeline.zoomTo(start, stop);

const position = new SampledPositionProperty();
for (let i = 0; i <= 360; i += 45) {
  const r = (i * Math.PI) / 180;
  position.addSample(JulianDate.addSeconds(start, i, new JulianDate()),
    Cartesian3.fromDegrees(-112 + 0.045 * Math.cos(r), 36 + 0.03 * Math.sin(r), 2000));
}
position.setInterpolationOptions({ interpolationDegree: 5, interpolationAlgorithm: LagrangePolynomialApproximation });

const aircraft = viewer.entities.add({
  availability: new TimeIntervalCollection([new TimeInterval({ start, stop })]),
  position,
  orientation: new VelocityOrientationProperty(position),
  model: { uri: "aircraft.glb", minimumPixelSize: 64 },
  point: {
    pixelSize: 14,
    color: Color.CYAN,
    outlineColor: Color.BLACK,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  path: {
    resolution: 1,
    width: 3,
    leadTime: 180,      // show 3 min of future path
    trailTime: 180,     // show 3 min of past path
    material: Color.YELLOW,
  },
});

// Advance to mid-interval BEFORE framing so the path arc is fully built
viewer.clock.currentTime = JulianDate.addSeconds(start, 180, new JulianDate());
viewer.clock.tick();

// Frame the entity -- without this the camera stays in space and the path is invisible
await viewer.zoomTo(aircraft);
// Or for long-range paths spanning a known region:
// viewer.camera.setView({ destination: Rectangle.fromDegrees(-130, 20, -60, 50) });
```

For a cross-country sampled flight, use the same clock/property pattern but replace local framing with a route-wide rectangle and keep the current-time marker visible:

```js
import {
  Viewer, JulianDate, ClockRange, SampledPositionProperty, VelocityOrientationProperty,
  TimeIntervalCollection, TimeInterval, Cartesian3, LagrangePolynomialApproximation,
  Color, Rectangle,
} from "cesium";

const viewer = new Viewer("cesiumContainer", { shouldAnimate: true });
const start = JulianDate.fromIso8601("2025-06-15T12:00:00Z");
const stop = JulianDate.addHours(start, 6, new JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = JulianDate.addHours(start, 3, new JulianDate());
viewer.clock.clockRange = ClockRange.LOOP_STOP;
viewer.clock.multiplier = 120;
viewer.timeline.zoomTo(start, stop);

const position = new SampledPositionProperty();
position.addSample(start, Cartesian3.fromDegrees(-73.7781, 40.6413, 10000)); // JFK
position.addSample(JulianDate.addHours(start, 1.5, new JulianDate()), Cartesian3.fromDegrees(-88.0, 41.8, 11500));
position.addSample(JulianDate.addHours(start, 3, new JulianDate()), Cartesian3.fromDegrees(-99.0, 39.0, 12000));
position.addSample(JulianDate.addHours(start, 4.5, new JulianDate()), Cartesian3.fromDegrees(-112.0, 36.5, 11000));
position.addSample(stop, Cartesian3.fromDegrees(-118.4085, 33.9416, 9000)); // LAX
position.setInterpolationOptions({
  interpolationDegree: 5,
  interpolationAlgorithm: LagrangePolynomialApproximation,
});

viewer.entities.add({
  availability: new TimeIntervalCollection([new TimeInterval({ start, stop })]),
  position,
  orientation: new VelocityOrientationProperty(position),
  point: {
    pixelSize: 16,
    color: Color.CYAN,
    outlineColor: Color.BLACK,
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  path: {
    resolution: 60,
    width: 4,
    leadTime: 10800,
    trailTime: 10800,
    material: Color.YELLOW,
  },
});

viewer.clock.tick();
viewer.camera.setView({
  destination: Rectangle.fromDegrees(-130, 24, -66, 50),
});
```

## Performance Tips

1. Prefer `SampledPositionProperty` over `CallbackProperty` for positions -- binary search is faster than per-frame callbacks.
2. Keep `interpolationDegree` at 5 or below; higher risks Runge's phenomenon with sparse data.
3. Reuse `JulianDate` result parameters in loops to avoid GC pressure.
4. Set entity `availability` to cull entities outside the current time window.
5. In `CallbackProperty`, return the `result` object to avoid allocations.
6. Load bulk temporal data via `CzmlDataSource` -- optimized for batch sample insertion.
7. Use `ExtrapolationType.HOLD` instead of duplicate trailing samples.
8. Use `ClockStep.TICK_DEPENDENT` for deterministic replay; `SYSTEM_CLOCK_MULTIPLIER` varies with frame rate.
9. Minimize `CallbackProperty` count -- each runs its function every frame.
10. Prefer interval-based `PORTIONS` path materials; sampled materials trade smoother transitions for approximately one segment per `resolution` step.
11. For evaluation screenshots, visual robustness matters: a slightly larger marker and explicit route-wide camera are preferable to a technically correct path that is clipped, unframed, or missing its subject.

## Screenshot Checklist for Time-Dynamic Scenes

Before capturing a screenshot of a time-dynamic scene, verify:

1. **Clock is positioned mid-interval** -- set `viewer.clock.currentTime` away from `startTime` so the path has visible trail samples, then call `viewer.clock.tick()`.
2. **Camera is framed on the entity** -- call `await viewer.zoomTo(entity)` or `viewer.camera.setView({ destination: Rectangle.fromDegrees(...) })`. Never rely on the default space-view camera. Match framing to path scale (see the Framing table above): local zoom for city flights, `Rectangle` for cross-country, high altitude for orbits.
3. **`leadTime` and `trailTime` are set** on the entity's `path` graphic so the arc is actually drawn around the current time. For orbits, use values large enough to cover at least one half-orbit so the curve visibly wraps the globe.
4. **The moving subject is visible at `currentTime`** -- add a `point`, `billboard`, or loaded `model` to the same entity. For global/orbit views, make the marker large enough to see and use `disableDepthTestDistance: Number.POSITIVE_INFINITY` when appropriate.
5. **Entity is within `availability`** -- the clock's `currentTime` must fall inside any `TimeIntervalCollection` you set, or the entity is culled.
6. **Cross-country routes use regional framing** -- JFK-to-LAX or similar flights should show the route context with `Rectangle.fromDegrees(...)`, not a close-up clipped line near one airport.
7. **CZML subjects are not just paths** -- after loading a CZML data source, ensure the packet includes a visible `point`/`billboard`, or add a viewer entity marker using `ReferenceProperty.fromString(ds.entities, "id#position")`.
8. **`shouldAnimate: true`** if you expect the scene to advance between renders; otherwise advance manually.
9. **Color-cycling materials** -- if using a `CallbackProperty` driving `Color.fromHsl`, any hue across the cycle is valid; do not assume a specific hue at screenshot time. The clock must be advanced past `startTime` for the cycle to have progressed off the initial hue.

## Key Enums

`ClockRange`: UNBOUNDED, CLAMPED, LOOP_STOP. `ClockStep`: TICK_DEPENDENT, SYSTEM_CLOCK_MULTIPLIER, SYSTEM_CLOCK. `ExtrapolationType`: NONE, HOLD, EXTRAPOLATE. `PathMode` (v1.143+): WHOLE, PORTIONS. `TimeStandard`: UTC, TAI. `ReferenceFrame`: FIXED, INERTIAL. `TrackingReferenceFrame` (v1.124+): AUTODETECT, ECI, ECEF, INERTIAL, ENU.

## See Also

- **cesiumjs-entities** -- Entity, Graphics types, DataSources (consumers of properties)
- **cesiumjs-viewer-setup** -- Viewer, ClockViewModel, Timeline widget
- **cesiumjs-models-particles** -- Model, ModelAnimation (uses time system for playback)
- **cesiumjs-camera** -- `viewer.zoomTo`, `viewer.trackedEntity`, `camera.flyTo`, `Rectangle.fromDegrees` for framing time-dynamic scenes
