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
import{a as u}from"./chunk-F6M5ZWO4.js";import"./chunk-3XZ3CL24.js";import"./chunk-GACOCTFW.js";import"./chunk-P6X455E3.js";import{a as f}from"./chunk-MDI2T7LJ.js";import"./chunk-FZYUOFLY.js";function a(t,e){return u.createMesh(t).then((function(t){let r=t.vertices.buffer,u=t.indices.buffer,s=t.westIndicesSouthToNorth.buffer,n=t.southIndicesEastToWest.buffer,i=t.eastIndicesNorthToSouth.buffer,o=t.northIndicesWestToEast.buffer;return e.push(r,u,s,n,i,o),{verticesBuffer:r,indicesBuffer:u,vertexCountWithoutSkirts:t.vertexCountWithoutSkirts,indexCountWithoutSkirts:t.indexCountWithoutSkirts,encoding:t.encoding,westIndicesBuffer:s,southIndicesBuffer:n,eastIndicesBuffer:i,northIndicesBuffer:o}}))}var T=f(a);export{T as default};