---
name: cesiumjs-models-particles
description: "CesiumJS models, glTF, and particle effects - Model, KHR_meshopt_compression, CAD glTF extensions, EdgeDisplayMode, ModelAnimation, ModelNode, ParticleSystem, emitters, GPM extensions. Use when loading compressed or CAD-style glTF/GLB models, controlling edge rendering, playing model animations, positioning particles, or working with geospatial positioning metadata."
---
# CesiumJS Models, glTF & Particle Effects

Version baseline: CesiumJS v1.144.

## Quick Reference

| Class | Purpose |
|---|---|
| `Model` | Low-level glTF/GLB primitive; positioned via `modelMatrix` |
| `ModelAnimation` | Active animation instance on a model |
| `ModelAnimationCollection` | Collection at `model.activeAnimations` |
| `ModelNode` | Named node with modifiable transform |
| `ModelFeature` | Per-feature styling/picking for feature-ID models |
| `EdgeDisplayMode` | Controls draft glTF edge-visibility rendering on Model/Cesium3DTileset |
| `ParticleSystem` | Billboard-based particle manager (fire, smoke, rain) |
| `Particle` | Single particle with position, velocity, life |
| `ParticleBurst` | Scheduled burst of particles |
| `BoxEmitter` / `CircleEmitter` | Emit within box volume / flat disk |
| `ConeEmitter` / `SphereEmitter` | Emit from cone tip / within sphere |

The Entity API exposes models through `ModelGraphics` (see cesiumjs-entities). The Primitive API uses `Model.fromGltfAsync` for full control over `modelMatrix`, animations, and node transforms.

---

## Loading a glTF/GLB Model

Always use the async factory -- never call the constructor directly.

```js
import { Model, Cartesian3, Transforms, HeadingPitchRoll, Math as CesiumMath } from "cesium";

const model = await Model.fromGltfAsync({ url: "path/to/model.glb" });
viewer.scene.primitives.add(model);
```

### Public Sample Models

CesiumJS ships sample models usable without ion tokens:

```
https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumAir/Cesium_Air.glb
https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumMan/Cesium_Man.glb
https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumMilkTruck/CesiumMilkTruck.glb
```

CesiumJS 1.143 decodes `KHR_meshopt_compression` automatically, including the
v1 attribute codec and `COLOR` filter. Do not import a decoder or private loader
helper. When loading compressed glTF, CAD-style lines/points/edges, or
constant-LOD textures, read [REFERENCE.md](REFERENCE.md) for the complete
support and authoring matrix. The same loader behavior applies to glTF content
inside 3D Tiles.

### Positioned Model with Heading

```js
const position = Cartesian3.fromDegrees(-123.074, 44.050, 5000);
const hpr = new HeadingPitchRoll(CesiumMath.toRadians(135), 0, 0);

const model = await Model.fromGltfAsync({
  url: "CesiumAir.glb",
  modelMatrix: Transforms.headingPitchRollToFixedFrame(position, hpr),
  minimumPixelSize: 128,  // never smaller than 128 px on screen
  maximumScale: 20000,    // cap for minimumPixelSize enlargement
  scale: 2.0,             // uniform scale multiplier
});
viewer.scene.primitives.add(model);
```

> **Visual eval framing:** for model screenshots, the model must be fully inside
> the frame and recognizable, not clipped at the bottom edge. Use
> `minimumPixelSize` 256-400 for public sample aircraft, add a subtle
> `silhouetteColor`/`silhouetteSize`, and place the camera with explicit
> coordinates aimed at the known model position. Avoid shallow pitches that put
> the model below the frame or rely on `viewer.flyTo(model)`, which is
> version-sensitive for `Model` primitives.

### Avoiding Distorted Model Appearance

Models can appear stretched or warped when scale is applied non-uniformly or when the orientation matrix is built incorrectly. Common pitfalls:

- **Always use `Transforms.headingPitchRollToFixedFrame` (or the Entity API's `headingPitchRollQuaternion`) for ground-aligned orientation.** Hand-rolled quaternions often invert pitch/roll axes and produce vertically stretched silhouettes.
- **Use `scale` (uniform) for size, not a non-uniform `Matrix4.fromScale`.** A non-uniform scale baked into `modelMatrix` will distort the model. Reserve `Matrix4.fromScale` for per-node tweaks (e.g., stretching a single turret), not the whole model.
- **Pair `minimumPixelSize` with a sensible `maximumScale`.** Without a cap, distant small models can balloon to fill the frame and look elongated when the camera is close.

### Key `Model.fromGltfAsync` Options

| Option | Type | Default |
|---|---|---|
| `url` | `string\|Resource` | required |
| `modelMatrix` | `Matrix4` | `IDENTITY` |
| `scale` | `number` | `1.0` |
| `minimumPixelSize` | `number` | `0.0` |
| `maximumScale` | `number` | -- |
| `show` | `boolean` | `true` |
| `color` / `colorBlendMode` / `colorBlendAmount` | `Color` / `ColorBlendMode` / `number` | -- / `HIGHLIGHT` / `0.5` |
| `edgeDisplayMode` | `EdgeDisplayMode` | `SURFACES_ONLY` |
| `silhouetteColor` / `silhouetteSize` | `Color` / `number` | `RED` / `0.0` |
| `shadows` | `ShadowMode` | `ENABLED` |
| `heightReference` | `HeightReference` | `NONE` |
| `customShader` | `CustomShader` | -- |
| `id` | `any` | -- |
| `allowPicking` | `boolean` | `true` |

---

## Readiness and Lifecycle

`fromGltfAsync` resolves once glTF JSON is parsed, but WebGL resources may still load. Wait for `readyEvent` before accessing animations, nodes, or `boundingSphere`.

```js
const model = await Model.fromGltfAsync({ url: "robot.glb" });
viewer.scene.primitives.add(model);

model.readyEvent.addEventListener(() => {
  console.log("Bounding sphere:", model.boundingSphere);
});
```

```js
// Synchronous check
if (model.ready) { const bs = model.boundingSphere; }
```

---

## Animations

Managed through `model.activeAnimations` (`ModelAnimationCollection`).

### Play by Name / Play All

```js
model.readyEvent.addEventListener(() => {
  // Single animation
  const anim = model.activeAnimations.add({
    name: "Walk",                          // glTF animation name
    loop: Cesium.ModelAnimationLoop.REPEAT, // NONE | REPEAT | MIRRORED_REPEAT
    multiplier: 1.0,                       // playback speed (must be > 0)
  });
  anim.start.addEventListener((m, a) => console.log(`Started: ${a.name}`));

  // Or play all animations at once
  model.activeAnimations.addAll({
    loop: Cesium.ModelAnimationLoop.REPEAT,
    multiplier: 0.5,
  });
});
```

Additional `add` options: `index`, `reverse`, `startTime`, `stopTime`, `delay`, `removeOnStop`, `animationTime` (custom time callback).

**Animations require `viewer.clock.shouldAnimate = true` to advance.** A walking character will appear frozen mid-pose (or distorted if at the seam between keyframes) if the clock is stopped.

### Animation Events

```js
animation.start.addEventListener((model, animation) => { });
animation.update.addEventListener((model, animation, time) => { });
animation.stop.addEventListener((model, animation) => { });
// Collection-level
model.activeAnimations.animationAdded.addEventListener((model, anim) => { });
```

```js
model.activeAnimations.remove(animation); // remove one
model.activeAnimations.removeAll();        // remove all
```

---

## Model Nodes

Override named node transforms for procedural animation (e.g., turret rotation).

```js
model.readyEvent.addEventListener(() => {
  const node = model.getNode("Turret");
  node.matrix = Cesium.Matrix4.fromScale(
    new Cesium.Cartesian3(5.0, 1.0, 1.0), node.matrix
  );
});
```

Properties: `name` (read-only), `id` (read-only index), `show` (boolean), `matrix` (Matrix4 -- set to `undefined` to restore original and re-enable glTF animations).

---

## Coloring, Silhouettes, and Feature Picking

```js
// Tint + silhouette
model.color = Cesium.Color.RED.withAlpha(0.5);
model.colorBlendMode = Cesium.ColorBlendMode.MIX;
model.colorBlendAmount = 0.5;
model.silhouetteColor = Cesium.Color.YELLOW;
model.silhouetteSize = 2.0;
```

### Edge Display Mode (Experimental, 1.142+)

For glTF assets using the draft `EXT_mesh_primitive_edge_visibility` extension,
`EdgeDisplayMode` controls whether extension-provided edges are hidden, composited
over surfaces, or rendered alone. Models without the extension are unaffected.

```js
import { EdgeDisplayMode, Model } from "cesium";

const model = await Model.fromGltfAsync({
  url: "/models/cad-part.glb",
  edgeDisplayMode: EdgeDisplayMode.SURFACES_AND_EDGES,
});
viewer.scene.primitives.add(model);

model.edgeDisplayMode = EdgeDisplayMode.EDGES_ONLY;       // CAD-style wireframe
model.edgeDisplayMode = EdgeDisplayMode.SURFACES_ONLY;    // default
```

When a glTF has `EXT_mesh_features` or `EXT_structural_metadata`, picking returns a `ModelFeature`:

```js
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.endPosition);
  if (picked instanceof Cesium.ModelFeature) {
    picked.getPropertyIds().forEach((name) => {
      console.log(`${name}: ${picked.getProperty(name)}`);
    });
    picked.color = Cesium.Color.YELLOW;
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
```

---

## Height Reference

```js
// Primitive API -- scene is required for height reference
const model = await Model.fromGltfAsync({
  url: "truck.glb",
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  scene: viewer.scene,
});

// Entity API
viewer.entities.add({
  position: Cartesian3.fromDegrees(-75.59, 40.03),
  model: { uri: "truck.glb", heightReference: Cesium.HeightReference.CLAMP_TO_GROUND },
});
```

Values: `NONE`, `CLAMP_TO_GROUND`, `RELATIVE_TO_GROUND`, `CLAMP_TO_TERRAIN`, `RELATIVE_TO_TERRAIN`, `CLAMP_TO_3D_TILE`, `RELATIVE_TO_3D_TILE`.

---

## Particle Systems

`ParticleSystem` renders billboard-based effects. Position with `modelMatrix` (world) and `emitterModelMatrix` (local offset).

**Always set `viewer.clock.shouldAnimate = true` before adding a particle system** -- particles only move when the clock is running. A stopped clock produces a static "blob" at the emitter origin rather than a directional plume.

### Producing a Legible Vertical Plume

A common failure mode is rendering a diffuse spherical blob instead of a recognizable rising column. To make plumes read as vertical:

- **Use `CircleEmitter` or a narrow `ConeEmitter`** for upward-biased velocity. `SphereEmitter` and `BoxEmitter` radiate in all directions and produce blob-like shapes.
- **Bias velocity strongly upward** -- emitters' local +Z is up in the `modelMatrix` frame; set `modelMatrix` via `Transforms.eastNorthUpToFixedFrame` so +Z is local up.
- **Use a multi-second `minimumParticleLife` / `maximumParticleLife`** (e.g., 1.5-4.0) so particles travel far enough to form a visible column before fading.
- **Scale particles over their lifetime** (`startScale` small, `endScale` 3-6x larger) so the plume widens with height, matching real smoke.
- **Keep the emitter footprint smaller than the visible plume.** For crater smoke, use a small disk or point source; oversized ground ellipses read as the subject instead of a source marker.
- **Avoid solving clipping by making the plume huge.** If the top is clipped, first increase camera range or lower particle life/speed/endScale; do not let the plume fill all four edges of the frame.
- **Wait for several seconds of simulation time before screenshotting** -- the plume needs to develop. Advance the clock or use `viewer.clock.shouldAnimate = true` and wait.

### Smoke Trail

```js
import { ParticleSystem, CircleEmitter, Color, Cartesian2, Transforms, Cartesian3 } from "cesium";

viewer.clock.shouldAnimate = true; // required -- particles don't move on a stopped clock

const smokeSystem = new ParticleSystem({
  image: "smoke.png",
  startColor: Color.LIGHTGRAY.withAlpha(0.7),
  endColor: Color.WHITE.withAlpha(0.0),
  startScale: 1.0,
  endScale: 5.0,
  emissionRate: 10,
  minimumSpeed: 1.0,
  maximumSpeed: 4.0,
  minimumParticleLife: 1.2,
  maximumParticleLife: 3.0,
  imageSize: new Cartesian2(25, 25), // pixel size
  emitter: new CircleEmitter(2.0),   // radius in meters
  modelMatrix: Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-75.157, 39.978)),
  lifetime: 16.0,
  loop: true,
});
viewer.scene.primitives.add(smokeSystem);
```

### Volcanic / Crater Smoke Calibration

For terrain-scale smoke such as Mount St. Helens, use an oblique camera and a restrained source marker. The marker should confirm the emitter location without becoming a giant ground disk, and the plume should fit entirely in frame with terrain visible underneath.

```js
import { ParticleSystem, CircleEmitter, Color, Cartesian2, Transforms, Cartesian3 } from "cesium";

viewer.clock.shouldAnimate = true;

const sourcePosition = Cartesian3.fromDegrees(-122.1944, 46.1914, 2549);

viewer.entities.add({
  position: sourcePosition,
  point: {
    pixelSize: 10,
    color: Color.ORANGE,
    outlineColor: Color.BLACK,
    outlineWidth: 2,
  },
});

const craterSmoke = new ParticleSystem({
  image: createRadialParticle(48, "rgba(180,180,180,0.75)"),
  startColor: Color.LIGHTGRAY.withAlpha(0.65),
  endColor: Color.WHITE.withAlpha(0.0),
  startScale: 0.8,
  endScale: 4.0,
  emissionRate: 35,
  minimumSpeed: 20.0,
  maximumSpeed: 45.0,
  minimumParticleLife: 2.0,
  maximumParticleLife: 4.0,
  imageSize: new Cartesian2(22, 22),
  emitter: new CircleEmitter(35.0),
  modelMatrix: Transforms.eastNorthUpToFixedFrame(sourcePosition),
  lifetime: 20.0,
  loop: true,
});
viewer.scene.primitives.add(craterSmoke);

viewer.trackedEntity = undefined;
viewer.camera.lookAt(
  sourcePosition,
  new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(35),
    Cesium.Math.toRadians(-22),
    6500
  )
);
```

Use this pattern when a prompt asks for smoke over a named geographic source:

- **Prefer a `point` or small billboard marker** over an `ellipse` unless the prompt specifically asks for a ground footprint.
- **Keep the plume top, base, and source marker visible at once.** A clipped plume or missing marker is a framing failure even if particles are rendering.
- **Use an oblique pitch for tall plumes.** Near-nadir views flatten the vertical volume into a gray blob.

### Emitter Types

```js
import { BoxEmitter, CircleEmitter, ConeEmitter, SphereEmitter } from "cesium";

new BoxEmitter(new Cesium.Cartesian3(10, 10, 10));  // 3D box, velocity outward
new CircleEmitter(2.0);                              // flat disk, velocity +Z
new ConeEmitter(Cesium.Math.toRadians(30));          // cone tip, velocity toward base
new SphereEmitter(5.0);                              // sphere, velocity radiates out
```

### Particle Bursts

```js
const firework = new ParticleSystem({
  image: getParticleCanvas(),
  startColor: Color.RED,
  endColor: Color.RED.withAlpha(0.0),
  particleLife: 1.0,
  speed: 100.0,
  imageSize: new Cartesian2(7, 7),
  emissionRate: 0,  // bursts only
  emitter: new SphereEmitter(0.1),
  bursts: [
    new Cesium.ParticleBurst({ time: 0.0, minimum: 100, maximum: 200 }),
    new Cesium.ParticleBurst({ time: 2.0, minimum: 50, maximum: 100 }),
    new Cesium.ParticleBurst({ time: 4.0, minimum: 200, maximum: 300 }),
  ],
  lifetime: 6.0,
  loop: false,
  modelMatrix: Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-75.597, 40.038)),
});
viewer.scene.primitives.add(firework);
```

### Update Callback (Gravity / Wind)

The `updateCallback` runs per-particle per-frame for forces like gravity.

```js
const gravityScratch = new Cesium.Cartesian3();
function applyGravity(particle, dt) {
  Cesium.Cartesian3.normalize(particle.position, gravityScratch);
  Cesium.Cartesian3.multiplyByScalar(gravityScratch, -9.8 * dt, gravityScratch);
  particle.velocity = Cesium.Cartesian3.add(particle.velocity, gravityScratch, particle.velocity);
}

const system = new ParticleSystem({
  image: "smoke.png",
  emissionRate: 20,
  emitter: new ConeEmitter(Cesium.Math.toRadians(45)),
  updateCallback: applyGravity,
  modelMatrix: Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-105, 40, 1000)),
});
viewer.scene.primitives.add(system);
```

### Framing Particle Effects So the Map Is Visible

Particle effects should stand out against the map underneath, **not** against the sky or a featureless background. Two common framing failures:

1. **Camera too close + shallow pitch** → the plume fills the frame and the map disappears behind it.
2. **Camera too steep / near-nadir** → tall plumes flatten into a blob and the source geometry reads wrong.

Use `viewer.camera.lookAt` with `HeadingPitchRange` to anchor on the emitter and dial in an oblique view that keeps the map context visible:

```js
const position = Cartesian3.fromDegrees(-122.1944, 46.1914, 2549);
viewer.trackedEntity = undefined;
viewer.camera.lookAt(
  position,
  new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(35),   // heading
    Cesium.Math.toRadians(-22),  // oblique pitch preserves plume height
    6500                         // increase range until top and base fit
  )
);
```

Guidelines:
- **Pitch in the -35° to -60° range** for short, ground-hugging effects where map context matters more than vertical extent.
- **Pitch in the -10° to -30° range** for tall plumes where vertical volume matters (e.g., volcanic columns).
- **Verify the marker/source is in-frame** by including a billboard or point at the emitter location; if the camera is wrong, the marker will be missing from the screenshot and the issue is obvious.
- **Keep background terrain visible around the plume.** If particles touch multiple image edges, reduce particle scale/life/speed or increase camera range before taking the screenshot.
- **Reset `viewer.trackedEntity = undefined`** before `lookAt`, or the tracked entity's reference frame will override your camera transform.

---

## Attaching Particles to a Moving Model

Sync `modelMatrix` each frame via `scene.preUpdate`. Use `emitterModelMatrix` for a local offset (e.g., exhaust pipe).

```js
const entity = viewer.entities.add({
  position: sampledPosition,
  orientation: new Cesium.VelocityOrientationProperty(sampledPosition),
  model: { uri: "truck.glb", minimumPixelSize: 64 },
});

// Local offset to exhaust pipe
const trs = new Cesium.TranslationRotationScale();
trs.translation = new Cesium.Cartesian3(-4.0, 0.0, 1.4);
const emitterModelMatrix = Cesium.Matrix4.fromTranslationRotationScale(trs, new Cesium.Matrix4());

const exhaust = new ParticleSystem({
  image: "smoke.png",
  startColor: Color.GRAY.withAlpha(0.7),
  endColor: Color.TRANSPARENT,
  emissionRate: 8,
  speed: 2.0,
  particleLife: 1.5,
  imageSize: new Cartesian2(20, 20),
  emitter: new CircleEmitter(0.5),
  emitterModelMatrix: emitterModelMatrix,
});
viewer.scene.primitives.add(exhaust);

viewer.scene.preUpdate.addEventListener((scene, time) => {
  exhaust.modelMatrix = entity.computeModelMatrix(time, new Cesium.Matrix4());
});
```

---

## Canvas-Based Particle Images

Generate particle textures dynamically instead of loading image files. A radial gradient produces soft, realistic edges for smoke and water effects.

```js
// Soft radial-gradient particle (smoke, water, fog)
function createRadialParticle(size = 32, colorStop = "rgba(200,200,200,0.9)") {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, colorStop);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return c;
}

// Solid circle (high-contrast, fireworks, sparks)
function createCircleImage(size = 20) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  return c;
}

// Pass canvas directly as image
new ParticleSystem({ image: createRadialParticle(), /* ...other options */ });
```

Use `Color.fromCssColorString` for specific particle colors when named colors don't suffice:

```js
startColor: Cesium.Color.fromCssColorString("#66ccff").withAlpha(0.95),
endColor: Cesium.Color.WHITE.withAlpha(0.0),
```

---

## Entity API Model (ModelGraphics)

For simpler use cases, add a model through the Entity API (see cesiumjs-entities for full coverage).

```js
const entity = viewer.entities.add({
  name: "Aircraft",
  position: Cartesian3.fromDegrees(-123.074, 44.050, 5000),
  orientation: Cesium.Transforms.headingPitchRollQuaternion(
    Cartesian3.fromDegrees(-123.074, 44.050, 5000),
    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(135), 0, 0)
  ),
  model: {
    uri: "CesiumAir.glb",
    minimumPixelSize: 128,
    maximumScale: 20000,
    silhouetteColor: Color.RED,
    silhouetteSize: 2.0,
  },
});
viewer.trackedEntity = entity;
```

**Framing trade-off with `viewer.trackedEntity`:** tracking centers the model but uses an auto-computed range derived from the bounding sphere, which often produces a too-close, low-context shot. For prompts that ask for both the model and map context (terrain, landmarks, labels), prefer `viewer.camera.flyTo` / `lookAt` to a manually chosen position and clear `viewer.trackedEntity = undefined` first.

---

## GPM Extension (NGA_gpm_local)

CesiumJS experimentally supports the NGA Geospatial Positioning Metadata glTF extension. Types: `AnchorPointDirect`, `AnchorPointIndirect`, `CorrelationGroup`, `GltfGpmLocal`, `Spdcf`. Parsed automatically when loading a glTF with `NGA_gpm_local` -- the API is experimental and subject to change.

---

## Performance Tips

1. **Use `.glb` over `.gltf`** -- binary format avoids extra HTTP requests and is smaller on the wire.
2. **Enable Draco compression** (`KHR_draco_mesh_compression`) for 80-90% smaller meshes.
3. **Use KTX2/Basis textures** (`KHR_texture_basisu`) for GPU-compressed textures; keep dimensions power-of-two.
4. **Set `minimumPixelSize` carefully** -- large values force enlargement of distant models, increasing draw cost.
5. **Limit silhouettes** -- extra rendering pass per silhouetted model; more than 256 may cause stencil artifacts.
6. **Reuse scratch `Matrix4` objects** -- avoid allocating every frame when syncing particle systems to moving entities.
7. **Match emission rate to effect density** -- dense jets (fountains, fire) may need rates of 200-1000/s; diffuse smoke works well at 10-60/s. Profile on target hardware.
8. **Prefer pixel-sized particles** (`sizeInMeters: false`, default) -- meter-sized particles are expensive at close range.
9. **Set finite `lifetime`** on particle systems -- `Number.MAX_VALUE` (default) prevents pool cleanup.
10. **Disable picking for decorations** -- `allowPicking: false` saves GPU memory on models that need no interaction.
11. **Destroy when done** -- `viewer.scene.primitives.remove(model)` then `model.destroy()` to free WebGL resources.

---

## See Also

- **cesiumjs-custom-shader** -- GLSL authoring for `Model.customShader` (struct reference, feature IDs, metadata, vertex displacement)
- **cesiumjs-materials-shaders** -- ImageBasedLighting, post-processing stages for models
- **cesiumjs-entities** -- Entity API ModelGraphics, data sources, time-dynamic properties
- **cesiumjs-3d-tiles** -- Cesium3DTileset (uses Model internally), clipping, styling
