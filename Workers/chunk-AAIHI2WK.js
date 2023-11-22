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
import{a as w}from"./chunk-DUBQPPQZ.js";var C={computePositions:function(t,o,a,r,n){let s,e=.5*t,i=-e,c=r+r,u=n?2*c:c,P=new Float64Array(3*u),f=0,h=0,l=n?3*c:0,m=n?3*(c+r):3*r;for(s=0;s<r;s++){let t=s/r*w.TWO_PI,c=Math.cos(t),u=Math.sin(t),p=c*a,C=u*a,M=c*o,Q=u*o;P[h+l]=p,P[h+l+1]=C,P[h+l+2]=i,P[h+m]=M,P[h+m+1]=Q,P[h+m+2]=e,h+=3,n&&(P[f++]=p,P[f++]=C,P[f++]=i,P[f++]=M,P[f++]=Q,P[f++]=e)}return P}},Y=C;export{Y as a};