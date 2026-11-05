# CustomShader Reference

Exhaustive struct/enum tables and built-in uniform catalog for the `cesiumjs-custom-shader` skill. Updated for the CesiumJS 1.144 public API.

---

## Attributes struct

Auto-generated per primitive from glTF attributes. Access via `vsInput.attributes.<name>` or `fsInput.attributes.<name>`.

| glTF attribute | Shader field | GLSL type | Vertex | Fragment | Notes |
|---|---|---|---|---|---|
| `POSITION` | `positionMC` | `vec3` | Yes | Yes | Model coordinates |
| `POSITION` | `positionWC` | `vec3` | — | Yes | World (ECEF) coordinates, low precision |
| `POSITION` | `positionEC` | `vec3` | — | Yes | Eye coordinates |
| `NORMAL` | `normalMC` | `vec3` | Yes | — | Unit normal, model coordinates |
| `NORMAL` | `normalEC` | `vec3` | — | Yes | Unit normal, eye coordinates |
| `TANGENT` | `tangentMC` | `vec3` | Yes | — | `w` stripped after bitangent computation |
| `TANGENT` | `tangentEC` | `vec3` | — | Yes | Same as above, eye space |
| `NORMAL` + `TANGENT` | `bitangentMC` | `vec3` | Yes | — | Only when both N + T present |
| `NORMAL` + `TANGENT` | `bitangentEC` | `vec3` | — | Yes | Same |
| `TEXCOORD_N` | `texCoord_N` | `vec2` | Yes | Yes | N = 0, 1, 2, … |
| `COLOR_N` | `color_N` | `vec4` | Yes | Yes | Alpha defaults to 1 when absent |
| `JOINTS_N` | `joints_N` | `ivec4` | Yes | Yes | Skin joint indices |
| `WEIGHTS_N` | `weights_N` | `vec4` | Yes | Yes | Skin weights |

**Custom underscore-prefixed attributes.** glTF attributes starting with `_` are lowercased and un-prefixed: `_SURFACE_TEMPERATURE` → `fsInput.attributes.surface_temperature`.

**Fallback when missing.** If a primitive lacks a requested attribute (e.g. no `TEXCOORD_0`), the runtime either synthesizes a default or, when no sensible default exists, disables the custom shader stage *just for that primitive*. Other primitives in the same model/tile continue to use the shader.

---

## Coordinate-space validation errors

The `CustomShader` constructor scans shader text and throws `DeveloperError` for ambiguous or wrong-stage attribute names. Error format:

> `<name> (<coord-space>) is not available in the <stage> shader. Did you mean <alternative> (<coord-space>) instead?`

Suffix expansion: `MC` → "(model coordinates)", `WC` → "(Cartesian world coordinates)", `EC` → "(eye coordinates)". Bare names are not expanded.

| Name | Rejected in | Suggested alternative |
|---|---|---|
| `position` | vertex | `positionMC` |
| `position` | fragment | `positionEC` |
| `normal` | vertex | `normalMC` |
| `normal` | fragment | `normalEC` |
| `tangent` | vertex | `tangentMC` |
| `tangent` | fragment | `tangentEC` |
| `bitangent` | vertex | `bitangentMC` |
| `bitangent` | fragment | `bitangentEC` |
| `positionWC` | vertex | `positionMC` |
| `positionEC` | vertex | `positionMC` |
| `normalEC` | vertex | `normalMC` |
| `tangentEC` | vertex | `tangentMC` |
| `bitangentEC` | vertex | `bitangentMC` |
| `normalMC` | fragment | `normalEC` |
| `tangentMC` | fragment | `tangentEC` |
| `bitangentMC` | fragment | `bitangentEC` |

**Note:** `positionMC` is **not** rejected in the fragment shader — it is valid in both stages.

---

## Enums

### CustomShaderMode
Frozen string enum. String value is used directly in the `CUSTOM_SHADER_<MODE>` GLSL define.

| JS constant | String value | Pipeline |
|---|---|---|
| `MODIFY_MATERIAL` (default) | `"MODIFY_MATERIAL"` | material → custom shader → lighting |
| `REPLACE_MATERIAL` | `"REPLACE_MATERIAL"` | custom shader → lighting (skips material stage) |

### LightingModel
Frozen numeric enum. When omitted from the constructor, the model's default lighting is preserved.

| JS constant | Value | Behavior |
|---|---|---|
| `UNLIT` | `0` | Skip lighting; `material.diffuse` used directly as output (alpha still applied) |
| `PBR` | `1` | Physically-based with IBL when available |

### CustomShaderTranslucencyMode
Frozen numeric enum. Default `INHERIT`.

| JS constant | Value | Effect |
|---|---|---|
| `INHERIT` | `0` | Honor the source material's translucency |
| `OPAQUE` | `1` | Force opaque render pass |
| `TRANSLUCENT` | `2` | Force translucent render pass |

### UniformType
Frozen string enum. String values are GLSL type names.

| JS constant | GLSL type | JS value type |
|---|---|---|
| `FLOAT` | `float` | `Number` |
| `VEC2` | `vec2` | `Cartesian2` |
| `VEC3` | `vec3` | `Cartesian3` |
| `VEC4` | `vec4` | `Cartesian4` |
| `INT` | `int` | `Number` |
| `INT_VEC2` | `ivec2` | `Cartesian2` |
| `INT_VEC3` | `ivec3` | `Cartesian3` |
| `INT_VEC4` | `ivec4` | `Cartesian4` |
| `BOOL` | `bool` | `Boolean` |
| `BOOL_VEC2` | `bvec2` | `Cartesian2` |
| `BOOL_VEC3` | `bvec3` | `Cartesian3` |
| `BOOL_VEC4` | `bvec4` | `Cartesian4` |
| `MAT2` | `mat2` | `Matrix2` |
| `MAT3` | `mat3` | `Matrix3` |
| `MAT4` | `mat4` | `Matrix4` |
| `SAMPLER_2D` | `sampler2D` | `TextureUniform` |
| `SAMPLER_CUBE` | `samplerCube` | **Rejected** — throws `DeveloperError("CustomShader does not support samplerCube uniforms")` at construction |

### VaryingType
Frozen string enum. Floating-point types only.

| JS constant | GLSL type |
|---|---|
| `FLOAT` | `float` |
| `VEC2` | `vec2` |
| `VEC3` | `vec3` |
| `VEC4` | `vec4` |
| `MAT2` | `mat2` |
| `MAT3` | `mat3` |
| `MAT4` | `mat4` |

---

## TextureUniform options

```js
new TextureUniform({
  url,                 // string | Resource — mutually exclusive with typedArray
  typedArray,          // Uint8Array — mutually exclusive with url
  width, height,       // required when typedArray is used
  pixelFormat,         // default PixelFormat.RGBA
  pixelDatatype,       // default PixelDatatype.UNSIGNED_BYTE
  repeat,              // default true → REPEAT; false → CLAMP_TO_EDGE (both axes)
  minificationFilter,  // default LINEAR
  magnificationFilter, // default LINEAR
  maximumAnisotropy,   // default 1.0
});
```

**Construction errors:**
- `"exactly one of options.typedArray, options.url must be defined"`
- `"options.width and options.height are required when options.typedArray is defined"`

Texture memory uses row-major storage with WebGL's bottom-up Y convention.

---

## FeatureIds struct

Auto-generated from the primitive's `featureIds` array. All values are GLSL `int` (not `uint`).

| Access | Source | Notes |
|---|---|---|
| `featureId_N` | `EXT_mesh_features` attribute or implicit | `N` is position in `featureIds` array |
| `featureId_N` | `EXT_mesh_features` feature ID texture | **Fragment shader only** |
| `<label>` | `EXT_mesh_features` with `"label": "..."` | Alias for `featureId_N`, e.g. `featureIds.perVertex` |
| `featureId_0` | 3D Tiles 1.0 `BATCH_ID` / `_BATCHID` | Legacy batch IDs transparently remapped |
| `instanceFeatureId_N` | `EXT_instance_features` + `EXT_mesh_gpu_instancing` | Per-instance; no feature ID textures at instance level |
| `featureId_N` | Legacy `EXT_feature_metadata` | `featureIdAttributes` and `featureIdTextures` arrays concatenated |

**WebGL 1 precision:** integer precision is 24 bits via floating-point backing; IDs above 2^24 (~16M) lose precision. WebGL 2 would permit `uint` but CustomShader does not surface it.

---

## Metadata struct

Addressable via `vsInput.metadata.<prop>` and `fsInput.metadata.<prop>`. Sources supported in 1.143:

1. **Property attributes** — per-vertex (vertex and fragment).
2. **Property textures** — per-texel (**fragment only**).
3. **Property tables** — per-feature, keyed by feature ID (added in 1.139 via #13124).

### Type support matrix

| Metadata type | WebGL 1 | WebGL 2 |
|---|---|---|
| `UINT8` (scalar/vector) | Supported | Supported |
| Other integer types (`INT8`, `INT16`, `UINT16`, `INT32`, `UINT32`) | Not supported | Supported (signedness preserved post-1.139) |
| `FLOAT32` | Limited | Supported |
| `FLOAT64`, `INT64`, `UINT64` | Not supported | Limited support via downcasting (1.140+) |
| `BOOLEAN` | — | — |
| `STRING` | — | — |
| `ENUM` | Supported (as integer) | Supported |
| Variable-length arrays | — | — |
| Matrix types | — | — |
| Items > 4 bytes | — | — |

### Normalized values + offset/scale

If the class schema declares `"normalized": true`, the value arrives in-shader as `float` (or floating vector) in `[0, 1]` (unsigned) or `[-1, 1]` (signed). If `offset` and `scale` are also declared, they are applied **after** normalization: stored UINT32 with `normalized: true, offset: 32, scale: 180` arrives as a float in `[32, 212]`.

### Property ID sanitization

GLSL identifiers are restricted. The pipeline:

1. Non-alphanumeric runs collapse to a single `_`.
2. Leading `gl_` prefix is stripped (reserved by GLSL).
3. If the result starts with a digit, prefix with `_`.

| Source name | Sanitized | Access |
|---|---|---|
| `temperature ℃` | `temperature_` | `fsInput.metadata.temperature_` |
| `custom__property` | `custom_property` | `fsInput.metadata.custom_property` |
| `gl_customProperty` | `customProperty` | `fsInput.metadata.customProperty` |
| `12345` | `_12345` | `fsInput.metadata._12345` |
| `temperature ℃` + `temperature ℉` | both → `temperature_` | **Undefined behavior (collision)** |
| `✖️✖️✖️` | empty string | **Undefined behavior** |

### 1.139 breaking change (#13135)

Unsigned integer metadata is no longer cast to signed `int`. Existing shaders using `int x = fsInput.metadata.myUintProperty;` stop compiling in 1.139. Switch to the matching unsigned type (e.g., `uint x = ...;`) or cast explicitly.

---

## MetadataClass struct

One sub-struct per property. Access via `vsInput.metadataClass.<prop>.<field>`.

| Field | Type | Description |
|---|---|---|
| `noData` | same as property | Value indicating no data |
| `defaultValue` | same as property | Default value (GLSL reserves `default` — field is `defaultValue`) |
| `minValue` | same as property | Schema-declared minimum (GLSL reserves `min` — field is `minValue`) |
| `maxValue` | same as property | Schema-declared maximum |

Example GLSL for a `FLOAT32` property named `temperature`:
```glsl
struct floatMetadataClass {
  float noData; float defaultValue; float minValue; float maxValue;
};
struct MetadataClass { floatMetadataClass temperature; };
// Access: vsInput.metadataClass.temperature.minValue
```

---

## MetadataStatistics struct

Populated only when the parent tileset's `tileset.json` carries a `statistics` object. Access via `fsInput.metadataStatistics.<prop>.<field>`.

| Field | Type | Description |
|---|---|---|
| `minValue` | same as property | Observed minimum |
| `maxValue` | same as property | Observed maximum |
| `median` | same as property | Median |
| `sum` | same as property | Sum |
| `mean` | floating-point of same dimension | Mean |
| `standardDeviation` | floating-point of same dimension | σ |
| `variance` | floating-point of same dimension | σ² |

Enum properties note: an `occurrence` field is documented as TODO.

---

## czm_modelVertexOutput

Source: `packages/engine/Source/Shaders/Builtin/Structs/modelVertexOutput.glsl`.

```glsl
struct czm_modelVertexOutput {
  vec3 positionMC;    // Initialized to vsInput.attributes.positionMC. Mutate to displace vertices.
  float pointSize;    // Overrides gl_PointSize for point primitives; overrides Cesium3DTileStyle point size.
};
```

No `#ifdef`-guarded fields.

**Gotcha:** modifying `positionMC` does **not** update the primitive's bounding sphere. Heavily displaced vertices can be frustum-culled even when visually on-screen.

---

## czm_modelMaterial

Source: `packages/engine/Source/Shaders/Builtin/Structs/modelMaterial.glsl`.

```glsl
struct czm_modelMaterial {
  vec4 baseColor;      // Base color of the material.
  vec3 diffuse;        // Incoming light that scatters evenly.
  float alpha;         // 0.0 fully transparent, 1.0 fully opaque.
  vec3 specular;       // f0 — reflected light at normal incidence (PBR).
  float roughness;     // 0.0 glossy, 1.0 rough.
  vec3 normalEC;       // Surface normal in eye coordinates (for normal mapping).
  float occlusion;     // Ambient occlusion (1.0 fully lit, 0.0 fully occluded).
  vec3 emissive;       // Light emitted equally in all directions.
#ifdef USE_SPECULAR
  float specularWeight;
#endif
#ifdef USE_ANISOTROPY
  vec3 anisotropicT;
  vec3 anisotropicB;
  float anisotropyStrength;
#endif
#ifdef USE_CLEARCOAT
  float clearcoatFactor;
  float clearcoatRoughness;
  vec3 clearcoatNormal;
  // clearcoatF0 added when KHR_materials_ior is implemented
#endif
};
```

**All color values are linear RGB** — including for `UNLIT` shaders. sRGB conversion happens after the pipeline unless `scene.highDynamicRange === true`.

Conditional fields appear only when the corresponding glTF extension is active on the primitive: `KHR_materials_specular` → `USE_SPECULAR`, `KHR_materials_anisotropy` → `USE_ANISOTROPY`, `KHR_materials_clearcoat` → `USE_CLEARCOAT`. Do not rely on these unconditionally.

---

## Built-in czm_* automatic uniforms

Available in custom shaders without declaration. The full list lives in `packages/engine/Source/Renderer/AutomaticUniforms.js`. The subset most useful for CustomShader:

### Frame & animation
`czm_frameNumber`, `czm_morphTime`, `czm_pixelRatio`, `czm_pass`, `czm_passTranslucent`

### Matrices
`czm_model`, `czm_inverseModel`, `czm_view`, `czm_inverseView`, `czm_view3D`, `czm_inverseView3D`, `czm_projection`, `czm_inverseProjection`, `czm_infiniteProjection`, `czm_modelView`, `czm_modelView3D`, `czm_inverseModelView`, `czm_inverseModelView3D`, `czm_modelViewProjection`, `czm_modelViewProjectionRelativeToEye`, `czm_modelViewRelativeToEye`, `czm_viewProjection`, `czm_inverseViewProjection`, `czm_normal`, `czm_normal3D`, `czm_inverseNormal`, `czm_inverseNormal3D`, `czm_modelToWindowCoordinates`, `czm_enuToModel`, `czm_modelToEnu`, `czm_viewportTransformation`

### Viewport & camera
`czm_viewport`, `czm_viewerPositionWC`, `czm_encodedCameraPositionMCHigh`, `czm_encodedCameraPositionMCLow`, `czm_eyeHeight`, `czm_eyeHeight2D`, `czm_currentFrustum`, `czm_entireFrustum`, `czm_frustumPlanes`, `czm_globeDepthTexture`, `czm_packDepth`, `czm_unpackDepth`, `czm_orthographicIn3D`

### Scene mode
`czm_sceneMode`, `czm_sceneMode2D`, `czm_sceneMode3D`, `czm_sceneModeColumbusView`, `czm_sceneModeMorphing`, `czm_columbusViewMorph`

### Lighting & environment
`czm_lightColor`, `czm_lightColorHdr`, `czm_lightDirectionEC`, `czm_lightDirectionWC`, `czm_sunDirectionEC`, `czm_sunDirectionWC`, `czm_sunPositionWC`, `czm_moonDirectionEC`, `czm_environmentMap`, `czm_specularEnvironmentMaps`, `czm_specularEnvironmentMapsMaximumLOD`, `czm_sphericalHarmonicCoefficients`, `czm_brdfLut`, `czm_gamma`, `czm_backgroundColor`

### Atmosphere & fog
`czm_atmosphereAnisotropy`, `czm_atmosphereDynamicLighting`, `czm_atmosphereHsbShift`, `czm_atmosphereLightIntensity`, `czm_atmosphereMieAnisotropy`, `czm_atmosphereMieCoefficient`, `czm_atmosphereMieScaleHeight`, `czm_atmosphereRayleighCoefficient`, `czm_atmosphereRayleighScaleHeight`, `czm_fog`, `czm_fogDensity`, `czm_fogMinimumBrightness`, `czm_fogVisualDensityScalar`

### Ellipsoid
`czm_ellipsoidRadii`, `czm_ellipsoidInverseRadii`, `czm_eyeEllipsoidCurvature`, `czm_eyeEllipsoidNormalEC`

### Post-processing & splitting
`czm_edgeColorTexture`, `czm_edgeDepthTexture`, `czm_edgeIdTexture`, `czm_invertClassificationColor`, `czm_splitPosition`, `czm_geometricToleranceOverMeter`

### Math constants
`czm_pi`, `czm_twoPi`, `czm_piOverTwo`, `czm_piOverThree`, `czm_piOverFour`, `czm_piOverSix`, `czm_oneOverPi`, `czm_oneOverTwoPi`, `czm_radiansPerDegree`, `czm_degreesPerRadian`, `czm_epsilon1`..`czm_epsilon7`

The full library of built-in GLSL functions lives in `packages/engine/Source/Shaders/Builtin/Functions/`.

---

## CustomShader public API surface

Constructor: see skill SKILL.md § "Constructor reference".

Public instance methods:

| Method | Description |
|---|---|
| `setUniform(name, value)` | Update a declared uniform. Cartesian/Matrix values are cloned into existing storage via `value.clone(uniform.value)`. `SAMPLER_2D` values trigger an async texture reload through the internal `TextureManager`. Throws `DeveloperError` if `name` is not declared. |
| `update(frameState)` | Called by `Model` / `Cesium3DTileset` / `VoxelPrimitive` each frame. Applications do not call this directly. |
| `isDestroyed()` | Returns `true` after `destroy()`; otherwise `false`. |
| `destroy()` | Releases the `TextureManager` and its GPU resources. Call when discarding a CustomShader that owns texture uniforms. |

Readonly instance fields: `mode`, `lightingModel`, `translucencyMode`, `uniforms`, `varyings`, `vertexShaderText`, `fragmentShaderText`, `uniformMap` (private wiring for the pipeline stage).

---

## Variable-usage detection regex

`CustomShader` scans the user's shader text to pre-compute which attributes/feature-IDs/metadata/material fields are referenced. The regexes (from `findUsedVariables`):

```
[vf]sInput\.attributes\.(\w+)
[vf]sInput\.featureIds\.(\w+)
[vf]sInput\.(?:metadata|metadataClass|metadataStatistics)\.(\w+)
material\.(\w+)
```

Accessing these structs through an aliased local variable bypasses detection — the optimization will not include the field, and the shader may fail at link time. Access `vsInput`/`fsInput`/`material` directly rather than passing them through local references.

---

## Source material

Everything in this reference is sourced from the following `main`-branch files:

- `packages/engine/Source/Scene/Model/CustomShader.js`
- `packages/engine/Source/Scene/Model/CustomShaderMode.js`
- `packages/engine/Source/Scene/Model/CustomShaderTranslucencyMode.js`
- `packages/engine/Source/Scene/Model/LightingModel.js`
- `packages/engine/Source/Scene/Model/UniformType.js`
- `packages/engine/Source/Scene/Model/VaryingType.js`
- `packages/engine/Source/Scene/Model/TextureUniform.js`
- `packages/engine/Source/Shaders/Builtin/Structs/modelMaterial.glsl`
- `packages/engine/Source/Shaders/Builtin/Structs/modelVertexOutput.glsl`
- `packages/engine/Source/Renderer/AutomaticUniforms.js`
- `packages/engine/Source/Scene/Cesium3DTileset.js` (for the `@experimental` + style-interaction JSDoc)
- `Documentation/CustomShaderGuide/README.md` (canonical guide)
- `CHANGES.md` (version notes)
