import * as Cesium from 'cesium'
class MyPrimitive {
    constructor(modelMatrix, context, framebuffer = undefined) {
        this.framebuffer = framebuffer;
        this.context = context
        this.width = context.canvas.width
        var v0 = [0.5, 0.5, 0];
        var v1 = [-0.5, 0.5, 0];
        var v2 = [-0.5, -0.5, 0];
        var v3 = [0.5, -0.5, 0];

        var vertex = [
            ...v0, ...v1, ...v2, ...v3
        ]
        var positions = new Float64Array(vertex)

        var nny = [0, -1, 0]
        var normals = new Float32Array([
            ...nny, ...nny, ...nny, ...nny
        ])

        var sts = new Float32Array([
            1., 1.,
            0., 1.,
            0., 0.,
            1., 0.
        ])

        var indices = new Uint16Array([
            0, 1, 2, 0, 2, 3
        ])

        //纹理
        var texture = undefined
        var imageUri = './favicon.ico'
        Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function (image) {
            var textureObj;
            if (Cesium.defined(image.internalFormat)) {
                textureObj = new Cesium.Texture({
                    context: context,
                    pixelFormat: image.internalFormat,
                    width: image.width,
                    height: image.height,
                    source: {
                        arrayBufferView: image.bufferView
                    }
                })
            } else {
                textureObj = new Cesium.Texture({
                    context: context,
                    source: image
                })
            }
            texture = textureObj
        })

        // 1.6 定义attributeLocations
        var attributeLocations = {
            position: 0,
            normal: 1,
            textureCoordinates: 2,
        };

        var vs = `
        in vec3 position;
        in vec3 normal;
        in vec2 st;
        in float batchId;

        out vec3 v_positionEC;
        out vec3 v_normalEC;
        out vec2 v_st;

        void main(){
            v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;
            v_normalEC = czm_normal * normal;
            v_st = st;
            gl_Position = czm_modelViewProjection * vec4(position, 1.0);
        }
        `

        var fs = `
        in vec3 v_positionEC;
        in vec3 v_normalEC;
        in vec2 v_st;
        uniform sampler2D myImage;
        in vec3 v_normal;
        out vec4 fragColor;
        void main(){
            vec3 positionToEyeEC = -v_positionEC;
            vec3 normalEC = normalize(v_normalEC);
            #ifdef FACE_FORWARD
                normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
            #endif

            czm_materialInput materialInput;
            materialInput.normalEC = normalEC;
            materialInput.positionToEyeEC = positionToEyeEC;
            materialInput.st = v_st;

            //An czm_material with default values. 
            //Every material's czm_getMaterial should use this default material as a base for the material it returns. 
            //The default normal value is given by materialInput.normalEC.
            czm_material material = czm_getDefaultMaterial(materialInput);
            material.diffuse = texture(myImage, materialInput.st).rgb;

            // #ifdef FLAT
                fragColor = vec4(material.diffuse + material.emission, material.alpha);  //vec4(normalEC.xyz,1.);
            // #else
            //     fragColor = czm_phong(normalize(positionToEyeEC), material);
            // #endif
        }
        `
        //创建vertexArray（Geometry）
        function createVertexArray(context) {
            var geometry = new Cesium.Geometry({
                attributes: {
                    position: new Cesium.GeometryAttribute({
                        // vtxf 使用double类型的position进行计算
                        // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: positions
                    }),
                    normal: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: normals
                    }),
                    textureCoordinates: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 2,
                        values: sts
                    })
                },
                // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
                indices: indices,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
            });

            var vertexArray = Cesium.VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                // interleave : true
            });

            return vertexArray;
        }

        //创建command
        function createCommand(context) {
            var translucent = false
            var closed = true
            // 借用一下Appearance.getDefaultRenderState
            var rawRenderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, undefined);
            var renderState = Cesium.RenderState.fromCache(rawRenderState);

            var vertexShaderSource = new Cesium.ShaderSource({
                sources: [vs]
            });

            var fragmentShaderSource = new Cesium.ShaderSource({
                sources: [fs]
            });

            var uniformMap = {
                myImage: function () {
                    if (Cesium.defined(texture)) {
                        return texture;
                    } else {
                        return context.defaultTexture;
                    }
                }
            }

            var shaderProgram = Cesium.ShaderProgram.fromCache({
                context: context,
                vertexShaderSource: vertexShaderSource,
                fragmentShaderSource: fragmentShaderSource,
                attributeLocations: attributeLocations
            });

            return new Cesium.DrawCommand({
                vertexArray: createVertexArray(context),
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                renderState: renderState,
                shaderProgram: shaderProgram,
                uniformMap: uniformMap,
                owner: this,
                framebuffer: this.framebuffer ? this.framebuffer : undefined,
                pass: Cesium.Pass.OPAQUE,
                modelMatrix: modelMatrix,
            })
        }

        //清空命令
        function createClearCommand(fb) {
            return new Cesium.ClearCommand({
                pass: Cesium.Pass.OPAQUE,
                color: new Cesium.Color(0., 0., 0., 0.),
                framebuffer: this.framebuffer,
                // stencil : 0,
                // owner : this,
                depth: 1.0,
            })
        }

        this.show = true
        this._command = undefined
        this._createCommand = createCommand;

        this._cCommand = undefined
        this._createClearCommand = createClearCommand;
    }

    update(frameState) {
        if (!this.show) {
            return
        }
        if (!Cesium.defined(this._cCommand) && this.framebuffer) {
            this._cCommand = this._createClearCommand()
        }
        if (Cesium.defined(this._cCommand)) {
            frameState.commandList.push(this._cCommand)
        }
        if (!Cesium.defined(this._command)) {
            this._command = this._createCommand(frameState.context)
        }

        this._command = this._createCommand(frameState.context)
        if (Cesium.defined(this._command)) {
            frameState.commandList.push(this._command)
        }

    }

    isDestroyed() {
        return false;
    }

    destroy() {
        if (Cesium.defined(this._command)) {
            this._command.shaderProgram = this._command.shaderProgram && this._command.shaderProgram.destroy();
        }
        return Cesium.destroyObject(this);
    }
}
export default MyPrimitive;