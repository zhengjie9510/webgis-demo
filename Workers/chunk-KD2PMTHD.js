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
import{e as u}from"./chunk-ZUCO5WNM.js";function f(t){let e;this.name="DeveloperError",this.message=t;try{throw new Error}catch(n){e=n.stack}this.stack=e}u(Object.create)&&(f.prototype=Object.create(Error.prototype),f.prototype.constructor=f),f.prototype.toString=function(){let t=`${this.name}: ${this.message}`;return u(this.stack)&&(t+=`\n${this.stack.toString()}`),t},f.throwInstantiationError=function(){throw new f("This function defines an interface and should not be called directly.")};var r=f,n={};function c(t){return`${t} is required, actual value was undefined`}function a(t,e,n){return`Expected ${n} to be typeof ${e}, actual typeof was ${t}`}n.typeOf={},n.defined=function(t,e){if(!u(e))throw new r(c(t))},n.typeOf.func=function(t,e){if("function"!=typeof e)throw new r(a(typeof e,"function",t))},n.typeOf.string=function(t,e){if("string"!=typeof e)throw new r(a(typeof e,"string",t))},n.typeOf.number=function(t,e){if("number"!=typeof e)throw new r(a(typeof e,"number",t))},n.typeOf.number.lessThan=function(t,e,o){if(n.typeOf.number(t,e),e>=o)throw new r(`Expected ${t} to be less than ${o}, actual value was ${e}`)},n.typeOf.number.lessThanOrEquals=function(t,e,o){if(n.typeOf.number(t,e),e>o)throw new r(`Expected ${t} to be less than or equal to ${o}, actual value was ${e}`)},n.typeOf.number.greaterThan=function(t,e,o){if(n.typeOf.number(t,e),e<=o)throw new r(`Expected ${t} to be greater than ${o}, actual value was ${e}`)},n.typeOf.number.greaterThanOrEquals=function(t,e,o){if(n.typeOf.number(t,e),e<o)throw new r(`Expected ${t} to be greater than or equal to ${o}, actual value was ${e}`)},n.typeOf.object=function(t,e){if("object"!=typeof e)throw new r(a(typeof e,"object",t))},n.typeOf.bool=function(t,e){if("boolean"!=typeof e)throw new r(a(typeof e,"boolean",t))},n.typeOf.bigint=function(t,e){if("bigint"!=typeof e)throw new r(a(typeof e,"bigint",t))},n.typeOf.number.equals=function(t,e,o,a){if(n.typeOf.number(t,o),n.typeOf.number(e,a),o!==a)throw new r(`${t} must be equal to ${e}, the actual values are ${o} and ${a}`)};var l=n;export{r as a,l as b};