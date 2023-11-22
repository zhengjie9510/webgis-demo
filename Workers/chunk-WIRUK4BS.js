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
import{a as t}from"./chunk-K36PKEJW.js";import{a as O}from"./chunk-KD2PMTHD.js";import{e as f}from"./chunk-ZUCO5WNM.js";function n(n){n=t(n,t.EMPTY_OBJECT),this.position=t(n.position,!1),this.normal=t(n.normal,!1),this.st=t(n.st,!1),this.bitangent=t(n.bitangent,!1),this.tangent=t(n.tangent,!1),this.color=t(n.color,!1)}n.POSITION_ONLY=Object.freeze(new n({position:!0})),n.POSITION_AND_NORMAL=Object.freeze(new n({position:!0,normal:!0})),n.POSITION_NORMAL_AND_ST=Object.freeze(new n({position:!0,normal:!0,st:!0})),n.POSITION_AND_ST=Object.freeze(new n({position:!0,st:!0})),n.POSITION_AND_COLOR=Object.freeze(new n({position:!0,color:!0})),n.ALL=Object.freeze(new n({position:!0,normal:!0,st:!0,tangent:!0,bitangent:!0})),n.DEFAULT=n.POSITION_NORMAL_AND_ST,n.packedLength=6,n.pack=function(n,e,o){if(!f(n))throw new O("value is required");if(!f(e))throw new O("array is required");return o=t(o,0),e[o++]=n.position?1:0,e[o++]=n.normal?1:0,e[o++]=n.st?1:0,e[o++]=n.tangent?1:0,e[o++]=n.bitangent?1:0,e[o]=n.color?1:0,e},n.unpack=function(e,o,i){if(!f(e))throw new O("array is required");return o=t(o,0),f(i)||(i=new n),i.position=1===e[o++],i.normal=1===e[o++],i.st=1===e[o++],i.tangent=1===e[o++],i.bitangent=1===e[o++],i.color=1===e[o],i},n.clone=function(t,e){if(f(t))return f(e)||(e=new n),e.position=t.position,e.normal=t.normal,e.st=t.st,e.tangent=t.tangent,e.bitangent=t.bitangent,e.color=t.color,e};var _=n;export{_ as a};