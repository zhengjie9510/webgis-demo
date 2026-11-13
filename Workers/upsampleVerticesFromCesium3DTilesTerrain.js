/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.147.0
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
import{a as f}from"./chunk-F6M5ZWO4.js";import"./chunk-3XZ3CL24.js";import"./chunk-GACOCTFW.js";import"./chunk-P6X455E3.js";import{a as u}from"./chunk-MDI2T7LJ.js";import"./chunk-FZYUOFLY.js";function h(e,i){let t=f.upsampleMesh(e),n=t.vertices.buffer,o=t.indices.buffer,u=t.westIndicesSouthToNorth.buffer,r=t.southIndicesEastToWest.buffer,s=t.eastIndicesNorthToSouth.buffer,h=t.northIndicesWestToEast.buffer;return i.push(n,o,u,r,s,h),{verticesBuffer:n,indicesBuffer:o,vertexCountWithoutSkirts:t.vertexCountWithoutSkirts,indexCountWithoutSkirts:t.indexCountWithoutSkirts,encoding:t.encoding,westIndicesBuffer:u,southIndicesBuffer:r,eastIndicesBuffer:s,northIndicesBuffer:h,minimumHeight:t.minimumHeight,maximumHeight:t.maximumHeight,boundingSphere:t.boundingSphere3D,orientedBoundingBox:t.orientedBoundingBox,horizonOcclusionPoint:t.horizonOcclusionPoint}}var I=u(h);export{I as default};