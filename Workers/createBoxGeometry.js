/* This file is automatically rebuilt by the Cesium build process. */
define(['./BoxGeometry-cbf2d438', './when-8166c7dd', './GeometryOffsetAttribute-e8e698d7', './RuntimeError-4fdc4459', './Transforms-62a339c3', './Matrix2-92b7fb9d', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './GeometryAttribute-6f4c3b93', './GeometryAttributes-50becc99', './VertexFormat-c0801687'], (function (BoxGeometry, when, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, VertexFormat) { 'use strict';

  function createBoxGeometry(boxGeometry, offset) {
    if (when.defined(offset)) {
      boxGeometry = BoxGeometry.BoxGeometry.unpack(boxGeometry, offset);
    }
    return BoxGeometry.BoxGeometry.createGeometry(boxGeometry);
  }

  return createBoxGeometry;

}));
