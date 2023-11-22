/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.111
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
import{a as x}from"./chunk-4M7FKQYC.js";import{a as w}from"./chunk-PNRMC4IG.js";import{c}from"./chunk-KCIWEUSR.js";import"./chunk-7XDW3BZW.js";import{a as h,b as l,c as p}from"./chunk-F33YCXD2.js";import{a as i}from"./chunk-DUBQPPQZ.js";import"./chunk-CG3JQAX7.js";import"./chunk-P3JQY4NV.js";import"./chunk-K36PKEJW.js";import"./chunk-KD2PMTHD.js";import"./chunk-ZUCO5WNM.js";var u=32767,F=new l,L=new h,b=new c,y=new p,a={min:void 0,max:void 0};function V(r){r=new Float64Array(r);let n=0;a.min=r[n++],a.max=r[n++],c.unpack(r,n,b),n+=c.packedLength,p.unpack(r,n,y)}function z(r,n){let t=new Uint16Array(r.positions);V(r.packedBuffer);let o=b,e=y,s=a.min,p=a.max,c=t.length/3,m=t.subarray(0,c),f=t.subarray(c,2*c),k=t.subarray(2*c,3*c);w.zigZagDeltaDecode(m,f,k);let j=new Float64Array(t.length);for(let a=0;a<c;++a){let r=m[a],n=f[a],t=k[a],c=i.lerp(o.west,o.east,r/u),w=i.lerp(o.south,o.north,n/u),b=i.lerp(s,p,t/u),y=l.fromRadians(c,w,b,F),d=e.cartographicToCartesian(y,L);h.pack(d,j,3*a)}return n.push(j.buffer),{positions:j.buffer}}var G=x(z);export{G as default};