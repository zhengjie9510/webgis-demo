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
import{a as x}from"./chunk-MDI2T7LJ.js";import{j as r,l,s as w,u,v as m,z as a}from"./chunk-FZYUOFLY.js";var p=32767,F=new u,L=new l,b=new a,y=new m,i={min:void 0,max:void 0};function V(r){r=new Float64Array(r);let e=0;i.min=r[e++],i.max=r[e++],a.unpack(r,e,b),e+=a.packedLength,m.unpack(r,e,y)}function z(a,e){let n=new Uint16Array(a.positions);V(a.packedBuffer);let t=b,o=y,s=i.min,m=i.max,f=n.length/3,c=n.subarray(0,f),h=n.subarray(f,2*f),d=n.subarray(2*f,3*f);w.zigZagDeltaDecode(c,h,d);let k=new Float64Array(n.length);for(let i=0;i<f;++i){let a=c[i],e=h[i],n=d[i],f=r.lerp(t.west,t.east,a/p),w=r.lerp(t.south,t.north,e/p),y=r.lerp(s,m,n/p),b=u.fromRadians(f,w,y,F),g=o.cartographicToCartesian(b,L);l.pack(g,k,3*i)}return e.push(k.buffer),{positions:k.buffer}}var U=x(z);export{U as default};