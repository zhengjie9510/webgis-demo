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
import{a as M}from"./chunk-AAIHI2WK.js";import{a as V}from"./chunk-N52FZRFP.js";import{a as N}from"./chunk-JZL634RF.js";import{a as k}from"./chunk-3UAKIC5Y.js";import{b as D,c as P,d as L}from"./chunk-QEWKHB6D.js";import{d as y}from"./chunk-DV7DPSRL.js";import"./chunk-4FFHQQYZ.js";import{d as A}from"./chunk-KCIWEUSR.js";import{a as R}from"./chunk-7XDW3BZW.js";import{a as S}from"./chunk-F33YCXD2.js";import"./chunk-DUBQPPQZ.js";import"./chunk-CG3JQAX7.js";import"./chunk-P3JQY4NV.js";import{a as c}from"./chunk-K36PKEJW.js";import{a as T,b as m}from"./chunk-KD2PMTHD.js";import{e as d}from"./chunk-ZUCO5WNM.js";var w=new A;function a(t){t=c(t,c.EMPTY_OBJECT);let e=t.length,i=t.topRadius,o=t.bottomRadius,s=c(t.slices,128),r=Math.max(c(t.numberOfVerticalLines,16),0);if(m.typeOf.number("options.positions",e),m.typeOf.number("options.topRadius",i),m.typeOf.number("options.bottomRadius",o),m.typeOf.number.greaterThanOrEquals("options.slices",s,3),d(t.offsetAttribute)&&t.offsetAttribute===V.TOP)throw new T("GeometryOffsetAttribute.TOP is not a supported options.offsetAttribute for this geometry.");this._length=e,this._topRadius=i,this._bottomRadius=o,this._slices=s,this._numberOfVerticalLines=r,this._offsetAttribute=t.offsetAttribute,this._workerName="createCylinderOutlineGeometry"}a.packedLength=6,a.pack=function(t,e,i){return m.typeOf.object("value",t),m.defined("array",e),i=c(i,0),e[i++]=t._length,e[i++]=t._topRadius,e[i++]=t._bottomRadius,e[i++]=t._slices,e[i++]=t._numberOfVerticalLines,e[i]=c(t._offsetAttribute,-1),e};var b={length:void 0,topRadius:void 0,bottomRadius:void 0,slices:void 0,numberOfVerticalLines:void 0,offsetAttribute:void 0};a.unpack=function(t,e,i){m.defined("array",t),e=c(e,0);let o=t[e++],s=t[e++],r=t[e++],n=t[e++],u=t[e++],f=t[e];return d(i)?(i._length=o,i._topRadius=s,i._bottomRadius=r,i._slices=n,i._numberOfVerticalLines=u,i._offsetAttribute=-1===f?void 0:f,i):(b.length=o,b.topRadius=s,b.bottomRadius=r,b.slices=n,b.numberOfVerticalLines=u,b.offsetAttribute=-1===f?void 0:f,new a(b))},a.createGeometry=function(t){let e=t._length,i=t._topRadius,o=t._bottomRadius,s=t._slices,r=t._numberOfVerticalLines;if(e<=0||i<0||o<0||0===i&&0===o)return;let n,a=2*s,u=M.computePositions(e,i,o,s,!1),f=2*s;if(r>0){let t=Math.min(r,s);n=Math.round(s/t),f+=t}let m,c=N.createTypedArray(a,2*f),p=0;for(m=0;m<s-1;m++)c[p++]=m,c[p++]=m+1,c[p++]=m+s,c[p++]=m+1+s;if(c[p++]=s-1,c[p++]=0,c[p++]=s+s-1,c[p++]=s,r>0)for(m=0;m<s;m+=n)c[p++]=m,c[p++]=m+s;let b=new k;b.position=new L({componentDatatype:R.DOUBLE,componentsPerAttribute:3,values:u}),w.x=.5*e,w.y=Math.max(o,i);let l=new y(S.ZERO,A.magnitude(w));if(d(t._offsetAttribute)){e=u.length;let i=t._offsetAttribute===V.NONE?0:1,o=new Uint8Array(e/3).fill(i);b.applyOffset=new L({componentDatatype:R.UNSIGNED_BYTE,componentsPerAttribute:1,values:o})}return new P({attributes:b,indices:c,primitiveType:D.LINES,boundingSphere:l,offsetAttribute:t._offsetAttribute})};var C=a;function G(t,e){return d(e)&&(t=C.unpack(t,e)),C.createGeometry(t)}var et=G;export{et as default};