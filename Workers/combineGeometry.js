/* This file is automatically rebuilt by the Cesium build process. */
define(['./PrimitivePipeline-347d5966', './createTaskProcessorWorker', './Transforms-62a339c3', './Matrix2-92b7fb9d', './RuntimeError-4fdc4459', './when-8166c7dd', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './GeometryAttribute-6f4c3b93', './GeometryAttributes-50becc99', './GeometryPipeline-54fb0bb4', './AttributeCompression-212262a3', './EncodedCartesian3-4a314cb8', './IndexDatatype-797210ca', './IntersectionTests-4f28a69c', './Plane-049255eb', './WebMercatorProjection-6ac42c0a'], (function (PrimitivePipeline, createTaskProcessorWorker, Transforms, Matrix2, RuntimeError, when, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, WebMercatorProjection) { 'use strict';

  function combineGeometry(packedParameters, transferableObjects) {
    var parameters = PrimitivePipeline.PrimitivePipeline.unpackCombineGeometryParameters(
      packedParameters
    );
    var results = PrimitivePipeline.PrimitivePipeline.combineGeometry(parameters);
    return PrimitivePipeline.PrimitivePipeline.packCombineGeometryResults(
      results,
      transferableObjects
    );
  }
  var combineGeometry$1 = createTaskProcessorWorker(combineGeometry);

  return combineGeometry$1;

}));
