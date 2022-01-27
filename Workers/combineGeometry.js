/* This file is automatically rebuilt by the Cesium build process. */
define(['./PrimitivePipeline-483f6ce8', './createTaskProcessorWorker', './Transforms-de823166', './Matrix2-0e286ffc', './RuntimeError-4fdc4459', './when-8166c7dd', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './GeometryAttribute-83cf1273', './GeometryAttributes-50becc99', './GeometryPipeline-738030c4', './AttributeCompression-a3d02c34', './EncodedCartesian3-3d8cb924', './IndexDatatype-797210ca', './IntersectionTests-30f5d388', './Plane-456cf3fd', './WebMercatorProjection-37aaa17f'], (function (PrimitivePipeline, createTaskProcessorWorker, Transforms, Matrix2, RuntimeError, when, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, WebMercatorProjection) { 'use strict';

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
