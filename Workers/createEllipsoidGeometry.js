/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './EllipsoidGeometry-0439b95e', './GeometryOffsetAttribute-e8e698d7', './RuntimeError-4fdc4459', './Transforms-de823166', './Matrix2-0e286ffc', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './GeometryAttribute-83cf1273', './GeometryAttributes-50becc99', './IndexDatatype-797210ca', './VertexFormat-c0801687'], (function (when, EllipsoidGeometry, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, IndexDatatype, VertexFormat) { 'use strict';

  function createEllipsoidGeometry(ellipsoidGeometry, offset) {
    if (when.defined(offset)) {
      ellipsoidGeometry = EllipsoidGeometry.EllipsoidGeometry.unpack(ellipsoidGeometry, offset);
    }
    return EllipsoidGeometry.EllipsoidGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidGeometry;

}));
