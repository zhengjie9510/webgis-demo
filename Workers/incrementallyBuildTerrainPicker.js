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
import{a as y}from"./chunk-MDI2T7LJ.js";import{l as n,r as i,t as o}from"./chunk-FZYUOFLY.js";var b=new n,d=new n,A=[new n,new n,new n],x=new o,f=new n(.5,.5,.5),g=new n(-.5,-.5,-.5);function h(r,e){let t=new Float64Array(r.aabbs),a=Array.from({length:4},((r,e)=>{let i=n.unpack(t,6*e,b),a=n.unpack(t,6*e+3,d);return o.fromCorners(i,a,new o)})),l=new Float64Array(r.inverseTransform),m=i.unpack(l,0,new i),u=new Uint32Array(r.triangleIndices),s=new Float64Array(r.trianglePositions),f=Array.from({length:4},(()=>[]));for(let i=0;i<u.length;i++){n.unpack(s,9*i,A[0]),n.unpack(s,9*i+3,A[1]),n.unpack(s,9*i+6,A[2]);let r=k(m,A);for(let n=0;n<4;n++)a[n].intersectAxisAlignedBoundingBox(r)&&f[n].push(u[i])}return{intersectingTrianglesArrays:f.map((n=>{let r=new Uint32Array(n);return e.push(r.buffer),r.buffer}))}}function k(r,e){i.multiplyByPoint(r,e[0],e[0]),i.multiplyByPoint(r,e[1],e[1]),i.multiplyByPoint(r,e[2],e[2]);let t=o.fromPoints(e,x);return n.clamp(t.minimum,g,f,t.minimum),n.clamp(t.maximum,g,f,t.maximum),t}var C=y(h);export{C as default};