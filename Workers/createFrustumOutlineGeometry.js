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
import{a as A}from"./chunk-UBKFZE5C.js";import{B as T,C as b,D as N,E as g,F,g as w,i as h,ia as k,ja as _,l as s,m as y,x as m}from"./chunk-FZYUOFLY.js";var d=0,j=1;function P(e){h.typeOf.object("options",e),h.typeOf.object("options.frustum",e.frustum),h.typeOf.object("options.origin",e.origin),h.typeOf.object("options.orientation",e.orientation);let t,n,a=e.frustum,r=e.orientation,i=e.origin,o=e._drawNearPlane??!0;a instanceof _?(t=d,n=_.packedLength):a instanceof k&&(t=j,n=k.packedLength),this._frustumType=t,this._frustum=a.clone(),this._origin=s.clone(i),this._orientation=m.clone(r),this._drawNearPlane=o,this._workerName="createFrustumOutlineGeometry",this.packedLength=2+n+s.packedLength+m.packedLength}P.pack=function(e,t,n){h.typeOf.object("value",e),h.defined("array",t),n=n??0;let a=e._frustumType,r=e._frustum;return t[n++]=a,a===d?(_.pack(r,t,n),n+=_.packedLength):(k.pack(r,t,n),n+=k.packedLength),s.pack(e._origin,t,n),n+=s.packedLength,m.pack(e._orientation,t,n),n+=m.packedLength,t[n]=e._drawNearPlane?1:0,t};var C=new _,E=new k,G=new m,R=new s;P.unpack=function(e,t,n){h.defined("array",e),t=t??0;let a,r=e[t++];r===d?(a=_.unpack(e,t,C),t+=_.packedLength):(a=k.unpack(e,t,E),t+=k.packedLength);let i=s.unpack(e,t,R);t+=s.packedLength;let o=m.unpack(e,t,G);t+=m.packedLength;let u=1===e[t];if(!w(n))return new P({frustum:a,origin:i,orientation:o,_drawNearPlane:u});let c=r===n._frustumType?n._frustum:void 0;return n._frustum=a.clone(c),n._frustumType=r,n._origin=s.clone(i,n._origin),n._orientation=m.clone(o,n._orientation),n._drawNearPlane=u,n},P.createGeometry=function(e){let t=e._frustumType,n=e._frustum,a=e._origin,r=e._orientation,i=e._drawNearPlane,o=new Float64Array(24);A._computeNearFarPlanes(a,r,t,n,o);let s,u,c=new F({position:new g({componentDatatype:y.DOUBLE,componentsPerAttribute:3,values:o})}),p=i?2:1,m=new Uint16Array(8*(p+1)),_=i?0:1;for(;_<2;++_)s=i?8*_:0,u=4*_,m[s]=u,m[s+1]=u+1,m[s+2]=u+1,m[s+3]=u+2,m[s+4]=u+2,m[s+5]=u+3,m[s+6]=u+3,m[s+7]=u;for(_=0;_<2;++_)s=8*(p+_),u=4*_,m[s]=u,m[s+1]=u+4,m[s+2]=u+1,m[s+3]=u+5,m[s+4]=u+2,m[s+5]=u+6,m[s+6]=u+3,m[s+7]=u+7;return new N({attributes:c,indices:m,primitiveType:b.LINES,boundingSphere:T.fromVertices(o)})};var L=P;function S(e,t){return w(t)&&(e=L.unpack(e,t)),L.createGeometry(e)}var V=S;export{V as default};