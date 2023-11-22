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
import{a as C}from"./chunk-Y33I6CKI.js";import{a as P}from"./chunk-EFCSU2FF.js";import{a as O,b as L}from"./chunk-F33YCXD2.js";import{a as y}from"./chunk-DUBQPPQZ.js";import{e as S}from"./chunk-ZUCO5WNM.js";var T={};function b(t,e){return y.equalsEpsilon(t.latitude,e.latitude,y.EPSILON10)&&y.equalsEpsilon(t.longitude,e.longitude,y.EPSILON10)}var q=new L,v=new L;function w(t,e,i,o){e=P(e,O.equalsEpsilon);let r=e.length;if(r<2)return;let n=S(o),a=S(i),s=new Array(r),h=new Array(r),l=new Array(r),g=e[0];s[0]=g;let u=t.cartesianToCartographic(g,q);a&&(u.height=i[0]),h[0]=u.height,l[0]=n?o[0]:0;let p=h[0],c=l[0],m=p===c,y=1;for(let f=1;f<r;++f){let r=e[f],g=t.cartesianToCartographic(r,v);a&&(g.height=i[f]),m=m&&0===g.height,b(u,g)?u.height<g.height&&(h[y-1]=g.height):(s[y]=r,h[y]=g.height,l[y]=n?o[f]:0,m=m&&h[y]===l[y],L.clone(g,u),++y)}return m||y<2?void 0:(s.length=y,h.length=y,l.length=y,{positions:s,topHeights:h,bottomHeights:l})}var D=new Array(2),F=new Array(2),B={positions:void 0,height:void 0,granularity:void 0,ellipsoid:void 0};T.computePositions=function(t,e,i,o,r,n){let a=w(t,e,i,o);if(!S(a))return;e=a.positions,i=a.topHeights,o=a.bottomHeights;let s,h,l=e.length,g=l-2,u=y.chordLength(r,t.maximumRadius),p=B;if(p.minDistance=u,p.ellipsoid=t,n){let t,r=0;for(t=0;t<l-1;t++)r+=C.numberOfPoints(e[t],e[t+1],u)+1;s=new Float64Array(3*r),h=new Float64Array(3*r);let n=D,a=F;p.positions=n,p.height=a;let g=0;for(t=0;t<l-1;t++){n[0]=e[t],n[1]=e[t+1],a[0]=i[t],a[1]=i[t+1];let r=C.generateArc(p);s.set(r,g),a[0]=o[t],a[1]=o[t+1],h.set(C.generateArc(p),g),g+=r.length}}else p.positions=e,p.height=i,s=new Float64Array(C.generateArc(p)),p.height=o,h=new Float64Array(C.generateArc(p));return{bottomPositions:h,topPositions:s,numCorners:g}};var j=T;export{j as a};