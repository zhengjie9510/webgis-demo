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
import{a as O,b as d}from"./chunk-DV7DPSRL.js";import{c as R,d as g}from"./chunk-KCIWEUSR.js";import{b as p}from"./chunk-F33YCXD2.js";import{a as w}from"./chunk-K36PKEJW.js";import{b as m}from"./chunk-KD2PMTHD.js";import{e as f}from"./chunk-ZUCO5WNM.js";function o(t,e,h,i){this.x=w(t,0),this.y=w(e,0),this.width=w(h,0),this.height=w(i,0)}o.packedLength=4,o.pack=function(t,e,h){return m.typeOf.object("value",t),m.defined("array",e),h=w(h,0),e[h++]=t.x,e[h++]=t.y,e[h++]=t.width,e[h]=t.height,e},o.unpack=function(t,e,h){return m.defined("array",t),e=w(e,0),f(h)||(h=new o),h.x=t[e++],h.y=t[e++],h.width=t[e++],h.height=t[e],h},o.fromPoints=function(t,e){if(f(e)||(e=new o),!f(t)||0===t.length)return e.x=0,e.y=0,e.width=0,e.height=0,e;let h=t.length,i=t[0].x,n=t[0].y,r=t[0].x,a=t[0].y;for(let o=1;o<h;o++){let e=t[o],h=e.x,f=e.y;i=Math.min(h,i),r=Math.max(h,r),n=Math.min(f,n),a=Math.max(f,a)}return e.x=i,e.y=n,e.width=r-i,e.height=a-n,e};var L=new O,X=new p,Y=new p;o.fromRectangle=function(t,e,h){if(f(h)||(h=new o),!f(t))return h.x=0,h.y=0,h.width=0,h.height=0,h;e=w(e,L);let i=e.project(R.southwest(t,X)),n=e.project(R.northeast(t,Y));return g.subtract(n,i,n),h.x=i.x,h.y=i.y,h.width=n.x,h.height=n.y,h},o.clone=function(t,e){if(f(t))return f(e)?(e.x=t.x,e.y=t.y,e.width=t.width,e.height=t.height,e):new o(t.x,t.y,t.width,t.height)},o.union=function(t,e,h){m.typeOf.object("left",t),m.typeOf.object("right",e),f(h)||(h=new o);let i=Math.min(t.x,e.x),n=Math.min(t.y,e.y),r=Math.max(t.x+t.width,e.x+e.width),a=Math.max(t.y+t.height,e.y+e.height);return h.x=i,h.y=n,h.width=r-i,h.height=a-n,h},o.expand=function(t,e,h){m.typeOf.object("rectangle",t),m.typeOf.object("point",e),h=o.clone(t,h);let i=e.x-h.x,n=e.y-h.y;return i>h.width?h.width=i:i<0&&(h.width-=i,h.x=e.x),n>h.height?h.height=n:n<0&&(h.height-=n,h.y=e.y),h},o.intersect=function(t,e){m.typeOf.object("left",t),m.typeOf.object("right",e);let h=t.x,i=t.y,n=e.x,o=e.y;return h>n+e.width||h+t.width<n||i+t.height<o||i>o+e.height?d.OUTSIDE:d.INTERSECTING},o.equals=function(t,e){return t===e||f(t)&&f(e)&&t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height},o.prototype.clone=function(t){return o.clone(this,t)},o.prototype.intersect=function(t){return o.intersect(this,t)},o.prototype.equals=function(t){return o.equals(this,t)};var S=o;export{S as a};