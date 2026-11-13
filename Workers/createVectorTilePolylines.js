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
import{a as K}from"./chunk-MDI2T7LJ.js";import{Da as G,K as R,j as F,l as t,s as B,u as _,v as L,z as M}from"./chunk-FZYUOFLY.js";var O=32767,ct=new _,rt=new t;function it(e,r,a,n,f){let u=e.length/3,s=e.subarray(0,u),o=e.subarray(u,2*u),i=e.subarray(2*u,3*u);B.zigZagDeltaDecode(s,o,i);let c=new Float64Array(e.length);for(let l=0;l<u;++l){let e=s[l],u=o[l],p=i[l],d=F.lerp(r.west,r.east,e/O),b=F.lerp(r.south,r.north,u/O),w=F.lerp(a,n,p/O),k=_.fromRadians(d,b,w,ct),h=f.cartographicToCartesian(k,rt);t.pack(h,c,3*l)}return c}var Y=it,X=new M,$=new L,j=new t,S={min:void 0,max:void 0};function at(e){e=new Float64Array(e);let r=0;S.min=e[r++],S.max=e[r++],M.unpack(e,r,X),r+=M.packedLength,L.unpack(e,r,$),r+=L.packedLength,t.unpack(e,r,j)}function dt(t){let e=t.length,r=new Uint32Array(e+1),a=0;for(let n=0;n<e;++n)r[n]=a,a+=t[n];return r[e]=a,r}var Z=new t,q=new t,J=new t,ut=new t,Q=new t;function ft(e,r){let a=new Uint16Array(e.positions),n=new Uint16Array(e.widths),f=new Uint32Array(e.counts),u=new Uint16Array(e.batchIds);at(e.packedBuffer);let s,o=X,i=$,c=j,l=S.min,p=S.max,d=Y(a,o,l,p,i),b=d.length/3,w=4*b-4,k=new Float32Array(3*w),h=new Float32Array(3*w),y=new Float32Array(3*w),A=new Float32Array(2*w),F=new Uint16Array(w),m=0,g=0,x=0,L=0,U=f.length;for(s=0;s<U;++s){let e=f[s],r=n[s],a=u[s];for(let n=0;n<e;++n){let f;if(0===n){let e=t.unpack(d,3*L,Z),r=t.unpack(d,3*(L+1),q);f=t.subtract(e,r,J),t.add(e,f,f)}else f=t.unpack(d,3*(L+n-1),J);let u,s=t.unpack(d,3*(L+n),ut);if(n===e-1){let r=t.unpack(d,3*(L+e-1),Z),a=t.unpack(d,3*(L+e-2),q);u=t.subtract(r,a,Q),t.add(r,u,u)}else u=t.unpack(d,3*(L+n+1),Q);t.subtract(f,c,f),t.subtract(s,c,s),t.subtract(u,c,u);let o=0===n?2:0,i=n===e-1?2:4;for(let e=o;e<i;++e){t.pack(s,k,m),t.pack(f,h,m),t.pack(u,y,m),m+=3;let n=e-2<0?-1:1;A[g++]=e%2*2-1,A[g++]=n*r,F[x++]=a}}L+=e}let v=R.createTypedArray(w,6*b-6),D=0,E=0;for(U=b-1,s=0;s<U;++s)v[E++]=D,v[E++]=D+2,v[E++]=D+1,v[E++]=D+1,v[E++]=D+2,v[E++]=D+3,D+=4;r.push(k.buffer,h.buffer,y.buffer),r.push(A.buffer,F.buffer,v.buffer);let O={indexDatatype:2===v.BYTES_PER_ELEMENT?R.UNSIGNED_SHORT:R.UNSIGNED_INT,currentPositions:k.buffer,previousPositions:h.buffer,nextPositions:y.buffer,expandAndWidth:A.buffer,batchIds:F.buffer,indices:v.buffer};if(e.keepDecodedPositions){let t=dt(f);r.push(d.buffer,t.buffer),O=G(O,{decodedPositions:d.buffer,decodedPositionOffsets:t.buffer})}return O}var xt=K(ft);export{xt as default};