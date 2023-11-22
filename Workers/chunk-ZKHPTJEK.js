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
import{a as O}from"./chunk-DV7DPSRL.js";import{c as I,e as V}from"./chunk-KCIWEUSR.js";import{a as W,b as v}from"./chunk-F33YCXD2.js";import{a as R}from"./chunk-DUBQPPQZ.js";import{a as k}from"./chunk-KD2PMTHD.js";import{e as N}from"./chunk-ZUCO5WNM.js";var z=Math.cos,Z=Math.sin,D=Math.sqrt,L={computePosition:function(t,n,a,r,o,s,e){let i=n.radiiSquared,g=t.nwCorner,h=t.boundingRectangle,l=g.latitude-t.granYCos*r+o*t.granXSin,u=z(l),c=Z(l),C=i.z*c,S=g.longitude+r*t.granYSin+o*t.granXCos,w=u*z(S),R=u*Z(S),m=i.x*w,d=i.y*R,O=D(m*w+d*R+C*c);if(s.x=m/O,s.y=d/O,s.z=C/O,a){let n=t.stNwCorner;N(n)?(l=n.latitude-t.stGranYCos*r+o*t.stGranXSin,S=n.longitude+r*t.stGranYSin+o*t.stGranXCos,e.x=(S-t.stWest)*t.lonScalar,e.y=(l-t.stSouth)*t.latScalar):(e.x=(S-h.west)*t.lonScalar,e.y=(l-h.south)*t.latScalar)}}},A=new V,g=new W,F=new v,b=new W,q=new O;function B(t,n,a,r,o,s,e){let i=Math.cos(n),h=r*i,l=a*i,u=Math.sin(n),c=r*u,C=a*u;g=q.project(t,g),g=W.subtract(g,b,g);let S=V.fromRotation(n,A);g=V.multiplyByVector(S,g,g),g=W.add(g,b,g),t=q.unproject(g,t),s-=1,e-=1;let w=t.latitude,R=w+s*C,m=w-h*e,d=w-h*e+s*C,O=Math.max(w,R,m,d),p=Math.min(w,R,m,d),X=t.longitude,Y=X+s*l,I=X+e*c,f=X+e*c+s*l,_=Math.max(X,Y,I,f),M=Math.min(X,Y,I,f);return{north:O,south:p,east:_,west:M,granYCos:h,granYSin:c,granXCos:l,granXSin:C,nwCorner:t}}L.computeOptions=function(t,n,a,r,o,s,e){let i=t.east,g=t.west,h=t.north,l=t.south,u=!1,c=!1;h===R.PI_OVER_TWO&&(u=!0),l===-R.PI_OVER_TWO&&(c=!0);let C,S=h-l;C=g>i?R.TWO_PI-g+i:i-g;let w=Math.ceil(C/n)+1,m=Math.ceil(S/n)+1,d=C/(w-1),O=S/(m-1),p=I.northwest(t,s),W=I.center(t,F);(0!==a||0!==r)&&(W.longitude<p.longitude&&(W.longitude+=R.TWO_PI),b=q.project(W,b));let X=O,Y=d,f=0,_=0,M=I.clone(t,o),P={granYCos:X,granYSin:f,granXCos:Y,granXSin:_,nwCorner:p,boundingRectangle:M,width:w,height:m,northCap:u,southCap:c};if(0!==a){let t=B(p,a,d,O,W,w,m);if(h=t.north,l=t.south,i=t.east,g=t.west,h<-R.PI_OVER_TWO||h>R.PI_OVER_TWO||l<-R.PI_OVER_TWO||l>R.PI_OVER_TWO)throw new k("Rotated rectangle is invalid.  It crosses over either the north or south pole.");P.granYCos=t.granYCos,P.granYSin=t.granYSin,P.granXCos=t.granXCos,P.granXSin=t.granXSin,M.north=h,M.south=l,M.east=i,M.west=g}if(0!==r){a-=r;let t=I.northwest(M,e),n=B(t,a,d,O,W,w,m);P.stGranYCos=n.granYCos,P.stGranXCos=n.granXCos,P.stGranYSin=n.granYSin,P.stGranXSin=n.granXSin,P.stNwCorner=t,P.stWest=n.west,P.stSouth=n.south}return P};var nt=L;export{nt as a};