---
name: using-cesiumjs-skills
description: Use when a conversation begins with a CesiumJS development request - maps the 14 domain skills on offer and explains how passive activation selects between them
---

# CesiumJS Skills Orientation

This plugin provides 14 domain skills covering CesiumJS v1.144 (~563 public symbols). Skills activate passively via description matching — no explicit invocation is required.

## Available Skills

| Skill | Use when... |
|---|---|
| `cesiumjs-viewer-setup` | Initializing a CesiumJS app, configuring widgets, setting Ion tokens, bootstrapping a globe |
| `cesiumjs-camera` | Positioning the camera, flyTo animations, constraining navigation, custom camera controllers, entity tracking |
| `cesiumjs-entities` | Adding points/labels/models/polygons and segmented paths, loading GeoJSON/KML/CZML/GPX through DataSources |
| `cesiumjs-3d-tiles` | Loading tilesets, compressed/CAD glTF content, MVT, metadata, voxels, point clouds, and clipping |
| `cesiumjs-imagery` | Adding/swapping base map layers, configuring imagery providers, split-screen comparisons |
| `cesiumjs-terrain-environment` | Configuring terrain, querying heights, atmosphere/sky/fog/lighting/shadows, panoramas |
| `cesiumjs-primitives` | Performance-critical static geometry, custom shapes, batching, BufferPrimitive collections, GeoJsonPrimitive |
| `cesiumjs-materials-shaders` | Fabric materials, ImageBasedLighting, post-processing effects, bloom, tonemapping |
| `cesiumjs-custom-shader` | Writing GLSL shader bodies for Model/Cesium3DTileset/VoxelPrimitive; reading feature IDs or structural metadata inside a shader |
| `cesiumjs-time-properties` | Time-dynamic attributes, simulation clocks, interpolation, and interval/sampled path materials |
| `cesiumjs-spatial-math` | Coordinate conversions, ellipsoid geometry, model matrices, intersection tests, projections |
| `cesiumjs-interaction` | User clicks on the globe, multi-modifier input actions, entity/feature selection, edge-snap picking, hover effects, drag interactions |
| `cesiumjs-models-particles` | glTF/GLB loading, KHR meshopt compression, CAD display extensions, animations, and particles |
| `cesiumjs-core-utilities` | HTTP requests via Resource, Color, Event, error handling, helper functions |

## Cross-Domain Questions

When a question spans multiple domains, consult `wiki/Domain-Mapping.md` — the definitive ownership map assigning every public CesiumJS class, function, and enum to exactly one skill.

## Runtime Verification

Chrome DevTools MCP is available for browser-based iteration: console error checking, network inspection, screenshots, and Lighthouse audits.
