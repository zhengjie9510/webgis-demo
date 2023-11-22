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
import{a as C}from"./chunk-DUBQPPQZ.js";import{a as g}from"./chunk-K36PKEJW.js";import{b as d}from"./chunk-KD2PMTHD.js";import{e as i}from"./chunk-ZUCO5WNM.js";var u=C.EPSILON10;function x(r,e,s,n){if(d.defined("equalsEpsilon",e),!i(r))return;s=g(s,!1);let t=i(n),o=r.length;if(o<2)return r;let a,h,l,p=r[0],f=0,c=-1;for(a=1;a<o;++a)h=r[a],e(p,h,u)?(i(l)||(l=r.slice(0,a),f=a-1,c=0),t&&n.push(a)):(i(l)&&(l.push(h),f=a,t&&(c=n.length)),p=h);return s&&e(r[0],r[o-1],u)&&(t&&(i(l)?n.splice(c,0,f):n.push(o-1)),i(l)?l.length-=1:l=r.slice(0,-1)),i(l)?l:r}var a=x;export{a};