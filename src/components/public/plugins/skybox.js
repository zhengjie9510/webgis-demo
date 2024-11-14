import * as Cesium from 'cesium'
const BoxGeometry = Cesium.BoxGeometry;
const Cartesian3 = Cesium.Cartesian3;
const defaultValue = Cesium.defaultValue;
const defined = Cesium.defined;
const destroyObject = Cesium.destroyObject;
const DeveloperError = Cesium.DeveloperError;
const GeometryPipeline = Cesium.GeometryPipeline;
const Matrix3 = Cesium.Matrix3;
const Matrix4 = Cesium.Matrix4;
const Transforms = Cesium.Transforms;
const VertexFormat = Cesium.VertexFormat;
const BufferUsage = Cesium.BufferUsage;
const CubeMap = Cesium.CubeMap;
const DrawCommand = Cesium.DrawCommand;
const loadCubeMap = Cesium.loadCubeMap;
const RenderState = Cesium.RenderState;
const VertexArray = Cesium.VertexArray;
const BlendingState = Cesium.BlendingState;
const SceneMode = Cesium.SceneMode;
const ShaderProgram = Cesium.ShaderProgram;
const ShaderSource = Cesium.ShaderSource;
//片元着色器，直接从源码复制
const SkyBoxFS = `#version 300 es
precision mediump float;

uniform samplerCube u_cubeMap;
in vec3 v_texCoord;
out vec4 fragColor;

void main()
{
    vec4 color = texture(u_cubeMap, normalize(v_texCoord));
    fragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
}
`;
//顶点着色器有修改，主要是乘了一个旋转矩阵
const SkyBoxVS = `#version 300 es
in vec3 position;
out vec3 v_texCoord;

uniform mat3 u_rotateMatrix;

void main()
{
    vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
    gl_Position = czm_projection * vec4(p, 1.0);
    v_texCoord = position.xyz;
}
`;

 /**
 * A sky box around the scene to draw stars.  The sky box is defined using the True Equator Mean Equinox (TEME) axes.
 * <p>
 * This is only supported in 3D.  The sky box is faded out when morphing to 2D or Columbus view.  The size of
 * the sky box must not exceed {@link Scene#maximumCubeMapSize}.
 * </p>
 *
 * @alias SkyBox
 * @constructor
 *
 * @param {Object} options Object with the following properties:
 * @param {Object} [options.sources] The source URL or <code>Image</code> object for each of the six cube map faces.  See the example below.
 * @param {Boolean} [options.show=true] Determines if this primitive will be shown.
 *
 *
 * @example
 * scene.skyBox = new Cesium.SkyBox({
 *   sources : {
 *     positiveX : 'skybox_px.png',
 *     negativeX : 'skybox_nx.png',
 *     positiveY : 'skybox_py.png',
 *     negativeY : 'skybox_ny.png',
 *     positiveZ : 'skybox_pz.png',
 *     negativeZ : 'skybox_nz.png'
 *   }
 * });
 *
 * @see Scene#skyBox
 * @see Transforms.computeTemeToPseudoFixedMatrix
 */
function SkyBox(options) {
    /**
     * The sources used to create the cube map faces: an object
     * with <code>positiveX</code>, <code>negativeX</code>, <code>positiveY</code>,
     * <code>negativeY</code>, <code>positiveZ</code>, and <code>negativeZ</code> properties.
     * These can be either URLs or <code>Image</code> objects.
     *
     * @type Object
     * @default undefined
     */
    this.sources = options.sources;
    this._sources = undefined;
    /**
     * 是否开启近地模式
     */
    this.nearGround = options.nearGround;
    /**
     * Determines if the sky box will be shown.
     *
     * @type {Boolean}
     * @default true
     */
    this.show = defaultValue(options.show, true);

    this._command = new DrawCommand({
        modelMatrix: Matrix4.clone(Matrix4.IDENTITY),
        owner: this,
    });
    this._cubeMap = undefined;

    this._attributeLocations = undefined;
    this._useHdr = undefined;
}

/**
 * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
 * get the draw commands needed to render this primitive.
 * <p>
 * Do not call this function directly.  This is documented just to
 * list the exceptions that may be propagated when the scene is rendered:
 * </p>
 *
 * @exception {DeveloperError} this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.
 * @exception {DeveloperError} this.sources properties must all be the same type.
 */
SkyBox.prototype.update = function (frameState, useHdr) {
    const that = this;

    if (!this.show) {
        return undefined;
    }

    if (
        frameState.mode !== SceneMode.SCENE3D &&
        frameState.mode !== SceneMode.MORPHING
    ) {
        return undefined;
    }

    // The sky box is only rendered during the render pass; it is not pickable, it doesn't cast shadows, etc.
    if (!frameState.passes.render) {
        return undefined;
    }

    const context = frameState.context;

    if (this._sources !== this.sources) {
        this._sources = this.sources;
        const sources = this.sources;

        //>>includeStart('debug', pragmas.debug);
        if (
            !defined(sources.positiveX) ||
            !defined(sources.negativeX) ||
            !defined(sources.positiveY) ||
            !defined(sources.negativeY) ||
            !defined(sources.positiveZ) ||
            !defined(sources.negativeZ)
        ) {
            throw new DeveloperError(
                "this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties."
            );
        }

        if (
            typeof sources.positiveX !== typeof sources.negativeX ||
            typeof sources.positiveX !== typeof sources.positiveY ||
            typeof sources.positiveX !== typeof sources.negativeY ||
            typeof sources.positiveX !== typeof sources.positiveZ ||
            typeof sources.positiveX !== typeof sources.negativeZ
        ) {
            throw new DeveloperError(
                "this.sources properties must all be the same type."
            );
        }
        //>>includeEnd('debug');

        if (typeof sources.positiveX === "string") {
            // Given urls for cube-map images.  Load them.
            loadCubeMap(context, this._sources).then(function (cubeMap) {
                that._cubeMap = that._cubeMap && that._cubeMap.destroy();
                that._cubeMap = cubeMap;
            });
        } else {
            this._cubeMap = this._cubeMap && this._cubeMap.destroy();
            this._cubeMap = new CubeMap({
                context: context,
                source: sources,
            });
        }
    }

    const command = this._command;

    if (!defined(command.vertexArray)) {
        command.uniformMap = {
            u_cubeMap: function () {
                return that._cubeMap;
            },
            u_rotateMatrix: function () {
                return that.nearGround ? (command.modelMatrix = Transforms.eastNorthUpToFixedFrame(frameState.camera._positionWC),
                    Matrix4.getMatrix3(command.modelMatrix, new Matrix3)) : Matrix3.IDENTITY;
            }
        };

        const geometry = BoxGeometry.createGeometry(
            BoxGeometry.fromDimensions({
                dimensions: new Cartesian3(2.0, 2.0, 2.0),
                vertexFormat: VertexFormat.POSITION_ONLY,
            })
        );
        const attributeLocations = (this._attributeLocations = GeometryPipeline.createAttributeLocations(
            geometry
        ));

        command.vertexArray = VertexArray.fromGeometry({
            context: context,
            geometry: geometry,
            attributeLocations: attributeLocations,
            bufferUsage: BufferUsage.STATIC_DRAW,
        });

        command.renderState = RenderState.fromCache({
            blending: BlendingState.ALPHA_BLEND,
        });
    }

    if (!defined(command.shaderProgram) || this._useHdr !== useHdr) {
        const fs = new ShaderSource({
            defines: [useHdr ? "HDR" : ""],
            sources: [SkyBoxFS],
        });
        command.shaderProgram = ShaderProgram.fromCache({
            context: context,
            vertexShaderSource: SkyBoxVS,
            fragmentShaderSource: fs,
            attributeLocations: this._attributeLocations,
        });
        this._useHdr = useHdr;
    }

    if (!defined(this._cubeMap)) {
        return undefined;
    }

    return command;
};

/**
 * Returns true if this object was destroyed; otherwise, false.
 * <br /><br />
 * If this object was destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
 *
 * @returns {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
 *
 * @see SkyBox#destroy
 */
SkyBox.prototype.isDestroyed = function () {
    return false;
};

/**
 * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
 * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
 * <br /><br />
 * Once an object is destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
 * assign the return value (<code>undefined</code>) to the object as done in the example.
 *
 * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
 *
 *
 * @example
 * skyBox = skyBox && skyBox.destroy();
 *
 * @see SkyBox#isDestroyed
 */
SkyBox.prototype.destroy = function () {
    const command = this._command;
    command.vertexArray = command.vertexArray && command.vertexArray.destroy();
    command.shaderProgram =
        command.shaderProgram && command.shaderProgram.destroy();
    this._cubeMap = this._cubeMap && this._cubeMap.destroy();
    return destroyObject(this);
};
export default SkyBox;

