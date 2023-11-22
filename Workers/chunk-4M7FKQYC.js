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
import{e as f}from"./chunk-ZUCO5WNM.js";function c(e){let r,s=e.name,a=e.message;r=f(s)&&f(a)?`${s}: ${a}`:e.toString();let t=e.stack;return f(t)&&(r+=`\n${t}`),r}var i=c;function l(e){async function r({data:r}){let s=[],a={id:r.id,result:void 0,error:void 0};self.CESIUM_BASE_URL=r.baseUrl;try{let t=await e(r.parameters,s);a.result=t}catch(t){t instanceof Error?a.error={name:t.name,message:t.message,stack:t.stack}:a.error=t}r.canTransferArrayBuffer||(s.length=0);try{postMessage(a,s)}catch(t){a.result=void 0,a.error=`postMessage failed with error: ${i(t)}\n  with responseMessage: ${JSON.stringify(a)}`,postMessage(a)}}function s(e){postMessage({id:e.data?.id,error:`postMessage failed with error: ${JSON.stringify(e)}`})}return self.onmessage=r,self.onmessageerror=s,self}var d=l;export{d as a};