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
import{f as C}from"./chunk-DV7DPSRL.js";import{a as n,d as b}from"./chunk-F33YCXD2.js";import{a as w}from"./chunk-DUBQPPQZ.js";var j={},q=new n,L=new n,Q=new C,G=new b;function W(t,e,r,a,o,i,l,s,y,c){let m=t+e;n.multiplyByScalar(a,Math.cos(m),q),n.multiplyByScalar(r,Math.sin(m),L),n.add(q,L,q);let u=Math.cos(t);u*=u;let w=Math.sin(t);w*=w;let x=i/Math.sqrt(l*u+o*w)/s;return C.fromAxisAngle(q,x,Q),b.fromQuaternion(Q,G),b.multiplyByVector(G,y,c),n.normalize(c,c),n.multiplyByScalar(c,s,c),c}var U=new n,Z=new n,N=new n,v=new n;j.raisePositionsToHeight=function(t,e,r){let a=e.ellipsoid,o=e.height,i=e.extrudedHeight,l=r?t.length/3*2:t.length/3,s=new Float64Array(3*l),y=t.length,c=r?y:0;for(let m=0;m<y;m+=3){let e=m+1,l=m+2,y=n.fromArray(t,m,U);a.scaleToGeodeticSurface(y,y);let u=n.clone(y,Z),w=a.geodeticSurfaceNormal(y,v),x=n.multiplyByScalar(w,o,N);n.add(y,x,y),r&&(n.multiplyByScalar(w,i,x),n.add(u,x,u),s[m+c]=u.x,s[e+c]=u.y,s[l+c]=u.z),s[m]=y.x,s[e]=y.y,s[l]=y.z}return s};var D=new n,J=new n,K=new n;j.computeEllipsePositions=function(t,e,r){let a=t.semiMinorAxis,o=t.semiMajorAxis,i=t.rotation,l=t.center,s=8*t.granularity,y=a*a,c=o*o,m=o*a,u=n.magnitude(l),x=n.normalize(l,D),h=n.cross(n.UNIT_Z,l,J);h=n.normalize(h,h);let f=n.cross(x,h,K),z=1+Math.ceil(w.PI_OVER_TWO/s),P=w.PI_OVER_TWO/(z-1),_=w.PI_OVER_TWO-z*P;_<0&&(z-=Math.ceil(Math.abs(_)/P));let p,O,d,M,I,T=z*(z+2)*2,g=e?new Array(3*T):void 0,V=0,E=U,R=Z,j=4*z*3,v=j-1,A=0,S=r?new Array(j):void 0;for(_=w.PI_OVER_TWO,E=W(_,i,f,h,y,m,c,u,x,E),e&&(g[V++]=E.x,g[V++]=E.y,g[V++]=E.z),r&&(S[v--]=E.z,S[v--]=E.y,S[v--]=E.x),_=w.PI_OVER_TWO-P,p=1;p<z+1;++p){if(E=W(_,i,f,h,y,m,c,u,x,E),R=W(Math.PI-_,i,f,h,y,m,c,u,x,R),e){for(g[V++]=E.x,g[V++]=E.y,g[V++]=E.z,d=2*p+2,O=1;O<d-1;++O)M=O/(d-1),I=n.lerp(E,R,M,N),g[V++]=I.x,g[V++]=I.y,g[V++]=I.z;g[V++]=R.x,g[V++]=R.y,g[V++]=R.z}r&&(S[v--]=E.z,S[v--]=E.y,S[v--]=E.x,S[A++]=R.x,S[A++]=R.y,S[A++]=R.z),_=w.PI_OVER_TWO-(p+1)*P}for(p=z;p>1;--p){if(_=w.PI_OVER_TWO-(p-1)*P,E=W(-_,i,f,h,y,m,c,u,x,E),R=W(_+Math.PI,i,f,h,y,m,c,u,x,R),e){for(g[V++]=E.x,g[V++]=E.y,g[V++]=E.z,d=2*(p-1)+2,O=1;O<d-1;++O)M=O/(d-1),I=n.lerp(E,R,M,N),g[V++]=I.x,g[V++]=I.y,g[V++]=I.z;g[V++]=R.x,g[V++]=R.y,g[V++]=R.z}r&&(S[v--]=E.z,S[v--]=E.y,S[v--]=E.x,S[A++]=R.x,S[A++]=R.y,S[A++]=R.z)}_=w.PI_OVER_TWO,E=W(-_,i,f,h,y,m,c,u,x,E);let B={};return e&&(g[V++]=E.x,g[V++]=E.y,g[V++]=E.z,B.positions=g,B.numPts=z),r&&(S[v--]=E.z,S[v--]=E.y,S[v--]=E.x,B.outerPositions=S),B};var tt=j;export{tt as a};