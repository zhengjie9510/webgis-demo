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
import{a as k,b as _,c as j}from"./chunk-QP27TPWQ.js";import"./chunk-WIRUK4BS.js";import"./chunk-AAJ456AA.js";import{a as A}from"./chunk-3UAKIC5Y.js";import{b as N,c as g,d as F}from"./chunk-QEWKHB6D.js";import{d as T,f as s}from"./chunk-DV7DPSRL.js";import"./chunk-4FFHQQYZ.js";import"./chunk-KCIWEUSR.js";import{a as b}from"./chunk-7XDW3BZW.js";import{a}from"./chunk-F33YCXD2.js";import"./chunk-DUBQPPQZ.js";import"./chunk-CG3JQAX7.js";import"./chunk-P3JQY4NV.js";import{a as d}from"./chunk-K36PKEJW.js";import{b as h}from"./chunk-KD2PMTHD.js";import{e as w}from"./chunk-ZUCO5WNM.js";var L=0,C=1;function l(e){h.typeOf.object("options",e),h.typeOf.object("options.frustum",e.frustum),h.typeOf.object("options.origin",e.origin),h.typeOf.object("options.orientation",e.orientation);let t,n,r=e.frustum,o=e.orientation,i=e.origin,u=d(e._drawNearPlane,!0);r instanceof _?(t=L,n=_.packedLength):r instanceof k&&(t=C,n=k.packedLength),this._frustumType=t,this._frustum=r.clone(),this._origin=a.clone(i),this._orientation=s.clone(o),this._drawNearPlane=u,this._workerName="createFrustumOutlineGeometry",this.packedLength=2+n+a.packedLength+s.packedLength}l.pack=function(e,t,n){h.typeOf.object("value",e),h.defined("array",t),n=d(n,0);let r=e._frustumType,o=e._frustum;return t[n++]=r,r===L?(_.pack(o,t,n),n+=_.packedLength):(k.pack(o,t,n),n+=k.packedLength),a.pack(e._origin,t,n),n+=a.packedLength,s.pack(e._orientation,t,n),n+=s.packedLength,t[n]=e._drawNearPlane?1:0,t};var E=new _,G=new k,R=new s,S=new a;l.unpack=function(e,t,n){h.defined("array",e),t=d(t,0);let r,o=e[t++];o===L?(r=_.unpack(e,t,E),t+=_.packedLength):(r=k.unpack(e,t,G),t+=k.packedLength);let i=a.unpack(e,t,S);t+=a.packedLength;let u=s.unpack(e,t,R);t+=s.packedLength;let c=1===e[t];if(!w(n))return new l({frustum:r,origin:i,orientation:u,_drawNearPlane:c});let p=o===n._frustumType?n._frustum:void 0;return n._frustum=r.clone(p),n._frustumType=o,n._origin=a.clone(i,n._origin),n._orientation=s.clone(u,n._orientation),n._drawNearPlane=c,n},l.createGeometry=function(e){let t=e._frustumType,n=e._frustum,r=e._origin,a=e._orientation,o=e._drawNearPlane,i=new Float64Array(24);j._computeNearFarPlanes(r,a,t,n,i);let s,u,c=new A({position:new F({componentDatatype:b.DOUBLE,componentsPerAttribute:3,values:i})}),p=o?2:1,k=new Uint16Array(8*(p+1)),m=o?0:1;for(;m<2;++m)s=o?8*m:0,u=4*m,k[s]=u,k[s+1]=u+1,k[s+2]=u+1,k[s+3]=u+2,k[s+4]=u+2,k[s+5]=u+3,k[s+6]=u+3,k[s+7]=u;for(m=0;m<2;++m)s=8*(p+m),u=4*m,k[s]=u,k[s+1]=u+4,k[s+2]=u+1,k[s+3]=u+5,k[s+4]=u+2,k[s+5]=u+6,k[s+6]=u+3,k[s+7]=u+7;return new g({attributes:c,indices:k,primitiveType:N.LINES,boundingSphere:T.fromVertices(i)})};var O=l;function D(e,t){return w(t)&&(e=O.unpack(e,t)),O.createGeometry(e)}var I=D;export{I as default};