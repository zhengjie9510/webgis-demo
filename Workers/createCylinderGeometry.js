/* This file is automatically rebuilt by the Cesium build process. */
define(['./CylinderGeometry-619912a5', './when-8166c7dd', './GeometryOffsetAttribute-e8e698d7', './RuntimeError-4fdc4459', './Transforms-62a339c3', './Matrix2-92b7fb9d', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './CylinderGeometryLibrary-5924d4e5', './GeometryAttribute-6f4c3b93', './GeometryAttributes-50becc99', './IndexDatatype-797210ca', './VertexFormat-c0801687'], (function (CylinderGeometry, when, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, CylinderGeometryLibrary, GeometryAttribute, GeometryAttributes, IndexDatatype, VertexFormat) { 'use strict';

  function createCylinderGeometry(cylinderGeometry, offset) {
    if (when.defined(offset)) {
      cylinderGeometry = CylinderGeometry.CylinderGeometry.unpack(cylinderGeometry, offset);
    }
    return CylinderGeometry.CylinderGeometry.createGeometry(cylinderGeometry);
  }

  return createCylinderGeometry;

}));
