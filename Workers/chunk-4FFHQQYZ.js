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
import{a}from"./chunk-K36PKEJW.js";import{e as l}from"./chunk-ZUCO5WNM.js";function p(r,o,t){t=a(t,!1);let e,n,f,h={},s=l(r),i=l(o);if(s)for(e in r)r.hasOwnProperty(e)&&(n=r[e],i&&t&&"object"==typeof n&&o.hasOwnProperty(e)?(f=o[e],h[e]="object"==typeof f?p(n,f,t):n):h[e]=n);if(i)for(e in o)o.hasOwnProperty(e)&&!h.hasOwnProperty(e)&&(f=o[e],h[e]=f);return h}var h=p;export{h as a};