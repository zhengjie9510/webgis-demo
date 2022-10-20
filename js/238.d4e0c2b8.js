"use strict";(self["webpackChunkwebgis"]=self["webpackChunkwebgis"]||[]).push([[238],{6238:function(e,t,n){n.r(t),n.d(t,{default:function(){return v}});var a=n(3396);const r={id:"cesiumContainer"};function i(e,t,n,i,o,s){return(0,a.wg)(),(0,a.iD)("div",r)}n(7658);var o=n(2588),s=n(1845),m=n(5116),c=n(7491),l=n(4977),u=n(5733),d=n(3822),p=n(4081),f=n(2451),g=n(2730),h={mounted(){this.init()},methods:{init(){var e=new o.Z("cesiumContainer");s.Z.supportsImageRenderingPixelated()&&(e.resolutionScale=window.devicePixelRatio),e.scene.postProcessStages.fxaa.enabled=!0;const t="\n        uniform vec4 color;\n        uniform float speed;\n        uniform float percent;\n        uniform float gradient;\n        \n        czm_material czm_getMaterial(czm_materialInput materialInput){\n          czm_material material = czm_getDefaultMaterial(materialInput);\n          vec2 st = materialInput.st;\n          float t = fract(czm_frameNumber * speed / 1000.0);\n          t *= (1.0 + percent);\n          float alpha = smoothstep(t- percent, t, st.s) * step(-t, -st.s);\n          alpha += gradient;\n          material.diffuse = color.rgb;\n          material.alpha = alpha;\n          material.emission = vec3(0.7);\n          return material;\n        }\n        ";e.scene.primitives.add(new m.Z({geometryInstances:this.generateRandomLines([104.065,30.659],100),appearance:new c.Z({material:new l.Z({fabric:{uniforms:{color:new u.Z(1,.5,0,.5),speed:5,percent:.2,gradient:0},source:t}})}),allowPicking:!1}));const n=d.Z.fromDegrees(104.065,30.659);e.camera.lookAt(n,new d.Z(0,-1e4,3930)),e.camera.lookAtTransform(p.Z.IDENTITY)},generateRandomLines:function(e,t){let n=[];for(let a=0;a<t;a++){let t=e[0]+.1*(Math.random()-.5),a=e[1]+.1*(Math.random()-.5);const r=new f.Z({positions:d.Z.fromDegreesArrayHeights([t,a,0,t,a,5e3*Math.random()]),width:1}),i=new g.Z({geometry:r});n.push(i)}return n}}},w=n(89);const Z=(0,w.Z)(h,[["render",i],["__scopeId","data-v-38747462"]]);var v=Z}}]);
//# sourceMappingURL=238.d4e0c2b8.js.map