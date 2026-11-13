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
import{b as t,c as f}from"./chunk-674HC7OA.js";import{a as s}from"./chunk-MDI2T7LJ.js";import{g as o}from"./chunk-FZYUOFLY.js";async function m(s,t){let e=s.webAssemblyConfig;if(o(e)&&o(e.wasmBinary))return f({module:e.wasmBinary}),!0}function c(s,e){let i=s.webAssemblyConfig;if(o(i))return m(s,e);let{primitive:n,sortType:r}=s;return"Index"===r?t(n.positions,n.modelView,n.count):void 0}var y=s(c);export{y as default};