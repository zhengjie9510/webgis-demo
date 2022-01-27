/* This file is automatically rebuilt by the Cesium build process. */
define(['./when-8166c7dd', './EllipsoidOutlineGeometry-cd48a50b', './GeometryOffsetAttribute-e8e698d7', './RuntimeError-4fdc4459', './Transforms-de823166', './Matrix2-0e286ffc', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './combine-a5c4cc47', './GeometryAttribute-83cf1273', './GeometryAttributes-50becc99', './IndexDatatype-797210ca'], (function (when, EllipsoidOutlineGeometry, GeometryOffsetAttribute, RuntimeError, Transforms, Matrix2, ComponentDatatype, WebGLConstants, combine, GeometryAttribute, GeometryAttributes, IndexDatatype) { 'use strict';

  function createEllipsoidOutlineGeometry(ellipsoidGeometry, offset) {
    if (when.defined(ellipsoidGeometry.buffer)) {
      ellipsoidGeometry = EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.unpack(
        ellipsoidGeometry,
        offset
      );
    }
    return EllipsoidOutlineGeometry.EllipsoidOutlineGeometry.createGeometry(ellipsoidGeometry);
  }

  return createEllipsoidOutlineGeometry;

}));
