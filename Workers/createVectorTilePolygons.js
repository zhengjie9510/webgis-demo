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
import{a as It}from"./chunk-MDI2T7LJ.js";import{K as W,V as F,X as R,g as A,j as et,l as o,s as bt,u as nt,v as j,z}from"./chunk-FZYUOFLY.js";var kt=new o,Bt=new j,Nt=new z,E={min:void 0,max:void 0,indexBytesPerElement:void 0};function Pt(t){let e=new Float64Array(t),n=0;E.indexBytesPerElement=e[n++],E.min=e[n++],E.max=e[n++],o.unpack(e,n,kt),n+=o.packedLength,j.unpack(e,n,Bt),n+=j.packedLength,z.unpack(e,n,Nt)}function Tt(t){let e=t.length,n=0;for(let r=0;r<e;++r)n+=F.packedLength+3+t[r].batchIds.length;return n}function Ct(t,e,n){let r=e.length,a=2+r*R.packedLength+1+Tt(n),o=new Float64Array(a),f=0;o[f++]=t,o[f++]=r;for(let l=0;l<r;++l)R.pack(e[l],o,f),f+=R.packedLength;let i=n.length;o[f++]=i;for(let l=0;l<i;++l){let t=n[l];F.pack(t.color,o,f),f+=F.packedLength,o[f++]=t.offset,o[f++]=t.count;let e=t.batchIds,r=e.length;o[f++]=r;for(let n=0;n<r;++n)o[f++]=e[n]}return o}var yt=32767,wt=new o,Ht=new o,St=new o,Ut=new o,Mt=new o,Lt=new nt,Ft=new z;function Rt(t,e){let n;Pt(t.packedBuffer),n=2===E.indexBytesPerElement?new Uint16Array(t.indices):new Uint32Array(t.indices);let r=new Uint16Array(t.positions),a=new Uint32Array(t.counts),f=new Uint32Array(t.indexCounts),i=new Uint32Array(t.batchIds),l=new Uint32Array(t.batchTableColors),s=new Array(a.length),c=kt,h=Bt,u=Nt,d=E.min,g=E.max,p=t.minimumHeights,w=t.maximumHeights;A(p)&&A(w)&&(p=new Float32Array(p),w=new Float32Array(w));let y,b,I,m=r.length/2,N=r.subarray(0,m),x=r.subarray(m,2*m);bt.zigZagDeltaDecode(N,x);let k=new Float64Array(3*m);for(y=0;y<m;++y){let t=N[y],e=x[y],n=et.lerp(u.west,u.east,t/yt),r=et.lerp(u.south,u.north,e/yt),a=nt.fromRadians(n,r,0,Lt),f=h.cartographicToCartesian(a,wt);o.pack(f,k,3*y)}let L=a.length,T=new Array(L),U=new Array(L),O=0,S=0;for(y=0;y<L;++y)T[y]=O,U[y]=S,O+=a[y],S+=f[y];let B=new Float32Array(3*m*2),P=new Uint16Array(2*m),M=new Uint32Array(U.length),_=new Uint32Array(f.length),j=[],v={};for(y=0;y<L;++y)I=l[y],A(v[I])?(v[I].positionLength+=a[y],v[I].indexLength+=f[y],v[I].batchIds.push(y)):v[I]={positionLength:a[y],indexLength:f[y],offset:0,indexOffset:0,batchIds:[y]};let C,D=0,Y=0;for(I in v)if(v.hasOwnProperty(I)){C=v[I],C.offset=D,C.indexOffset=Y;let t=2*C.positionLength,e=2*C.indexLength+6*C.positionLength;D+=t,Y+=e,C.indexLength=e}let z=[];for(I in v)v.hasOwnProperty(I)&&(C=v[I],z.push({color:F.fromRgba(parseInt(I)),offset:C.indexOffset,count:C.indexLength,batchIds:C.batchIds}));for(y=0;y<L;++y){I=l[y],C=v[I];let t=C.offset,e=3*t,r=t,m=T[y],N=a[y],x=i[y],E=d,L=g;A(p)&&A(w)&&(E=p[y],L=w[y]);let F=Number.POSITIVE_INFINITY,O=Number.NEGATIVE_INFINITY,S=Number.POSITIVE_INFINITY,D=Number.NEGATIVE_INFINITY;for(b=0;b<N;++b){let t=o.unpack(k,3*m+3*b,wt);h.scaleToGeodeticSurface(t,t);let n=h.cartesianToCartographic(t,Lt),a=n.latitude,f=n.longitude;F=Math.min(a,F),O=Math.max(a,O),S=Math.min(f,S),D=Math.max(f,D);let i=h.geodeticSurfaceNormal(t,Ht),l=o.multiplyByScalar(i,E,St),s=o.add(t,l,Ut);l=o.multiplyByScalar(i,L,l);let u=o.add(t,l,Mt);o.subtract(u,c,u),o.subtract(s,c,s),o.pack(u,B,e),o.pack(s,B,e+3),P[r]=x,P[r+1]=x,e+=6,r+=2}u=Ft,u.west=S,u.east=D,u.south=F,u.north=O,s[y]=R.fromRectangle(u,d,g,h);let Y=C.indexOffset,z=U[y],G=f[y];for(M[y]=Y,b=0;b<G;b+=3){let e=n[z+b]-m,r=n[z+b+1]-m,a=n[z+b+2]-m;j[Y++]=2*e+t,j[Y++]=2*r+t,j[Y++]=2*a+t,j[Y++]=2*a+1+t,j[Y++]=2*r+1+t,j[Y++]=2*e+1+t}for(b=0;b<N;++b){let e=b,n=(b+1)%N;j[Y++]=2*e+1+t,j[Y++]=2*n+t,j[Y++]=2*e+t,j[Y++]=2*e+1+t,j[Y++]=2*n+1+t,j[Y++]=2*n+t}C.offset+=2*N,C.indexOffset=Y,_[y]=Y-M[y]}j=W.createTypedArray(B.length/3,j);let G=z.length;for(let o=0;o<G;++o){let t=z[o].batchIds,e=0,n=t.length;for(let r=0;r<n;++r)e+=_[t[r]];z[o].count=e}let H=2===j.BYTES_PER_ELEMENT?W.UNSIGNED_SHORT:W.UNSIGNED_INT,V=Ct(H,s,z);return e.push(B.buffer,j.buffer,M.buffer,_.buffer,P.buffer,V.buffer),{positions:B.buffer,indices:j.buffer,indexOffsets:M.buffer,indexCounts:_.buffer,batchIds:P.buffer,packedBuffer:V.buffer}}var Dt=It(Rt);export{Dt as default};