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
import{a as m}from"./chunk-WIRUK4BS.js";import{a as b}from"./chunk-3UAKIC5Y.js";import{b as v,c as x,d as p}from"./chunk-QEWKHB6D.js";import{d as A}from"./chunk-DV7DPSRL.js";import"./chunk-4FFHQQYZ.js";import"./chunk-KCIWEUSR.js";import{a as c}from"./chunk-7XDW3BZW.js";import{a as y}from"./chunk-F33YCXD2.js";import"./chunk-DUBQPPQZ.js";import"./chunk-CG3JQAX7.js";import"./chunk-P3JQY4NV.js";import{a as i}from"./chunk-K36PKEJW.js";import{b as u}from"./chunk-KD2PMTHD.js";import{e as f}from"./chunk-ZUCO5WNM.js";function s(t){t=i(t,i.EMPTY_OBJECT);let e=i(t.vertexFormat,m.DEFAULT);this._vertexFormat=e,this._workerName="createPlaneGeometry"}s.packedLength=m.packedLength,s.pack=function(t,e,n){return u.typeOf.object("value",t),u.defined("array",e),n=i(n,0),m.pack(t._vertexFormat,e,n),e};var d=new m,P={vertexFormat:d};s.unpack=function(t,e,n){u.defined("array",t),e=i(e,0);let r=m.unpack(t,e,d);return f(n)?(n._vertexFormat=m.clone(r,n._vertexFormat),n):new s(P)};var F=new y(-.5,-.5,0),l=new y(.5,.5,0);s.createGeometry=function(t){let e,n,r=t._vertexFormat,a=new b;if(r.position){if(n=new Float64Array(12),n[0]=F.x,n[1]=F.y,n[2]=0,n[3]=l.x,n[4]=F.y,n[5]=0,n[6]=l.x,n[7]=l.y,n[8]=0,n[9]=F.x,n[10]=l.y,n[11]=0,a.position=new p({componentDatatype:c.DOUBLE,componentsPerAttribute:3,values:n}),r.normal){let t=new Float32Array(12);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=1,t[9]=0,t[10]=0,t[11]=1,a.normal=new p({componentDatatype:c.FLOAT,componentsPerAttribute:3,values:t})}if(r.st){let t=new Float32Array(8);t[0]=0,t[1]=0,t[2]=1,t[3]=0,t[4]=1,t[5]=1,t[6]=0,t[7]=1,a.st=new p({componentDatatype:c.FLOAT,componentsPerAttribute:2,values:t})}if(r.tangent){let t=new Float32Array(12);t[0]=1,t[1]=0,t[2]=0,t[3]=1,t[4]=0,t[5]=0,t[6]=1,t[7]=0,t[8]=0,t[9]=1,t[10]=0,t[11]=0,a.tangent=new p({componentDatatype:c.FLOAT,componentsPerAttribute:3,values:t})}if(r.bitangent){let t=new Float32Array(12);t[0]=0,t[1]=1,t[2]=0,t[3]=0,t[4]=1,t[5]=0,t[6]=0,t[7]=1,t[8]=0,t[9]=0,t[10]=1,t[11]=0,a.bitangent=new p({componentDatatype:c.FLOAT,componentsPerAttribute:3,values:t})}e=new Uint16Array(6),e[0]=0,e[1]=1,e[2]=2,e[3]=0,e[4]=2,e[5]=3}return new x({attributes:a,indices:e,primitiveType:v.TRIANGLES,boundingSphere:new A(y.ZERO,Math.sqrt(2))})};var w=s;function h(t,e){return f(e)&&(t=w.unpack(t,e)),w.createGeometry(t)}var M=h;export{M as default};