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
import{a as P}from"./chunk-PG5ZS3T4.js";import{a as j,b as d}from"./chunk-OH4CN3UY.js";import{a as O}from"./chunk-AAJ456AA.js";import{i as u}from"./chunk-DV7DPSRL.js";import{a as A,b as m,d as l}from"./chunk-KCIWEUSR.js";import{a as e,c as _}from"./chunk-F33YCXD2.js";import{a as g}from"./chunk-K36PKEJW.js";import{a as y,b as p}from"./chunk-KD2PMTHD.js";import{e as r}from"./chunk-ZUCO5WNM.js";var x=new A;function s(t,n){if(p.defined("origin",t),n=g(n,_.WGS84),t=n.scaleToGeodeticSurface(t),!r(t))throw new y("origin must not be at the center of the ellipsoid.");let i=u.eastNorthUpToFixedFrame(t,n);this._ellipsoid=n,this._origin=t,this._xAxis=e.fromCartesian4(m.getColumn(i,0,x)),this._yAxis=e.fromCartesian4(m.getColumn(i,1,x));let o=e.fromCartesian4(m.getColumn(i,2,x));this._plane=O.fromPointNormal(t,o)}Object.defineProperties(s.prototype,{ellipsoid:{get:function(){return this._ellipsoid}},origin:{get:function(){return this._origin}},plane:{get:function(){return this._plane}},xAxis:{get:function(){return this._xAxis}},yAxis:{get:function(){return this._yAxis}},zAxis:{get:function(){return this._plane.normal}}});var C=new P;s.fromPoints=function(e,t){p.defined("cartesians",e);let n=P.fromPoints(e,C);return new s(n.center,t)};var w=new j,h=new e;s.prototype.projectPointOntoPlane=function(t,n){p.defined("cartesian",t);let i=w;i.origin=t,e.normalize(t,i.direction);let o=d.rayPlane(i,this._plane,h);if(r(o)||(e.negate(i.direction,i.direction),o=d.rayPlane(i,this._plane,h)),r(o)){let t=e.subtract(o,this._origin,o),i=e.dot(this._xAxis,t),s=e.dot(this._yAxis,t);return r(n)?(n.x=i,n.y=s,n):new l(i,s)}},s.prototype.projectPointsOntoPlane=function(e,t){p.defined("cartesians",e),r(t)||(t=[]);let n=0,i=e.length;for(let o=0;o<i;o++){let i=this.projectPointOntoPlane(e[o],t[n]);r(i)&&(t[n]=i,n++)}return t.length=n,t},s.prototype.projectPointToNearestOnPlane=function(t,n){p.defined("cartesian",t),r(n)||(n=new l);let i=w;i.origin=t,e.clone(this._plane.normal,i.direction);let o=d.rayPlane(i,this._plane,h);r(o)||(e.negate(i.direction,i.direction),o=d.rayPlane(i,this._plane,h));let s=e.subtract(o,this._origin,o),a=e.dot(this._xAxis,s),c=e.dot(this._yAxis,s);return n.x=a,n.y=c,n},s.prototype.projectPointsToNearestOnPlane=function(e,t){p.defined("cartesians",e),r(t)||(t=[]);let n=e.length;t.length=n;for(let i=0;i<n;i++)t[i]=this.projectPointToNearestOnPlane(e[i],t[i]);return t};var T=new e;s.prototype.projectPointOntoEllipsoid=function(t,n){p.defined("cartesian",t),r(n)||(n=new e);let i=this._ellipsoid,o=this._origin,s=this._xAxis,a=this._yAxis,l=T;return e.multiplyByScalar(s,t.x,l),n=e.add(o,l,n),e.multiplyByScalar(a,t.y,l),e.add(n,l,n),i.scaleToGeocentricSurface(n,n),n},s.prototype.projectPointsOntoEllipsoid=function(e,t){p.defined("cartesians",e);let n=e.length;r(t)?t.length=n:t=new Array(n);for(let i=0;i<n;++i)t[i]=this.projectPointOntoEllipsoid(e[i],t[i]);return t};var M=s;export{M as a};