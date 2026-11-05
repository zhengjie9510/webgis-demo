# glTF Compatibility Reference

Updated for CesiumJS 1.144. Read this reference when loading compressed glTF,
CAD/design-model content, or glTF embedded in 3D Tiles. These features are
asset-driven and use CesiumJS's built-in model pipeline; they do not require
custom shaders or decoder setup.

---

## KHR Meshopt Compression

CesiumJS 1.143 adds `KHR_meshopt_compression` support, including the v1
attribute codec and `COLOR` filter. Existing `EXT_meshopt_compression` assets
remain supported. If an asset declares both extensions, CesiumJS prefers the
KHR payload.

Load compressed assets through the normal surface:

```js
import { Model } from "cesium";

const model = await Model.fromGltfAsync({
  url: "/models/meshopt-compressed.glb",
});
viewer.scene.primitives.add(model);
```

The same automatic decode path is used by `ModelGraphics` and glTF/GLB content
inside `Cesium3DTileset`. Compress assets offline in the content pipeline;
runtime recompression adds latency and does not reduce transferred bytes.

Do not import `findMeshoptExtension` or `MeshoptDecoder`. The former is an
internal helper omitted from the public TypeScript declarations, and CesiumJS
owns decoder readiness, caching, and resource lifetime.

Use the tagged public conformance asset when verifying 1.143 support:

```text
https://raw.githubusercontent.com/CesiumGS/cesium/1.143/Specs/Data/Models/glTF-2.0/MeshoptCubeTest/glTF-Meshopt/MeshoptCubeTest.gltf
```

It exercises KHR meshopt attribute/index modes, v1 filters, vertex colors, and
animation. A successful render shows the complete labeled 5-by-5 cube grid.

In 1.143, invalid glTF sampler wrap modes fall back to `TextureWrap.REPEAT`
instead of throwing a development-build `DeveloperError`. Still fix invalid
assets at authoring time; the fallback is resilience, not validation.

## CAD and Design-Model Extensions

| Extension | CesiumJS 1.144 behavior | Agent action |
|---|---|---|
| `EXT_mesh_primitive_restart` | Loads primitive-restart line/index data | No runtime option |
| `KHR_mesh_primitive_restart` | Supported since 1.144; the multi-vendor KHR successor of the EXT variant (Khronos spec still in review, not yet ratified) | No runtime option |
| `EXT_mesh_primitive_edge_visibility` | Reconstructs hidden, hard, silhouette, and repeated-hard edges with stable quad rendering. Since 1.144, edge accessor data loads as typed arrays (up to ~19x less JS heap on edge-heavy CAD assets) | Select `EdgeDisplayMode`; edges are hidden by default |
| `BENTLEY_materials_line_style` | Honors screen-pixel `width` and 16-bit dash `pattern` for lines and visible edges | Author values in the glTF material |
| `BENTLEY_materials_point_style` | Honors point `diameter` in CSS pixels; color comes from the material | Author values in the glTF material |
| `EXT_textureInfo_constant_lod` | Generates and blends texture coordinates to maintain a roughly constant on-screen texture scale | Use seamless textures and author real-world scale, offset, and blend distances |
| `BENTLEY_materials_planar_fill` | Supported since 1.144: CAD-style planar polygon fill with depth sorting, background-color masking, and coplanar geometry ordering | Author values in the glTF material; the extension's `wireframeFill` property is a no-op in 1.144 |

Prefer the built-in extension path over recreating edges, dash masks, point
sizing, or constant-LOD sampling in a `CustomShader`. The built-in path batches
with the model pipeline and preserves feature IDs, depth behavior, and tileset
LOD. Use a custom shader only for effects outside the encoded extension data.

`EdgeDisplayMode` values are:

- `SURFACES_ONLY` (default): render surfaces and hide extension edges.
- `SURFACES_AND_EDGES`: composite extension edges over surfaces.
- `EDGES_ONLY`: render CAD-style wireframe content without surfaces.

Extension edges also power the experimental `viewer.scene.snap` edge-snap
picking API added in 1.144 (see `cesiumjs-interaction`).
