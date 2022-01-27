/* This file is automatically rebuilt by the Cesium build process. */
define(['./Matrix2-0e286ffc', './when-8166c7dd', './EllipseGeometry-cdb51d4f', './RuntimeError-4fdc4459', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './GeometryOffsetAttribute-e8e698d7', './Transforms-de823166', './combine-a5c4cc47', './EllipseGeometryLibrary-8f12495f', './GeometryAttribute-83cf1273', './GeometryAttributes-50becc99', './GeometryInstance-520da454', './GeometryPipeline-738030c4', './AttributeCompression-a3d02c34', './EncodedCartesian3-3d8cb924', './IndexDatatype-797210ca', './IntersectionTests-30f5d388', './Plane-456cf3fd', './VertexFormat-c0801687'], (function (Matrix2, when, EllipseGeometry, RuntimeError, ComponentDatatype, WebGLConstants, GeometryOffsetAttribute, Transforms, combine, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, VertexFormat) { 'use strict';

  function createEllipseGeometry(ellipseGeometry, offset) {
    if (when.defined(offset)) {
      ellipseGeometry = EllipseGeometry.EllipseGeometry.unpack(ellipseGeometry, offset);
    }
    ellipseGeometry._center = Matrix2.Cartesian3.clone(ellipseGeometry._center);
    ellipseGeometry._ellipsoid = Matrix2.Ellipsoid.clone(ellipseGeometry._ellipsoid);
    return EllipseGeometry.EllipseGeometry.createGeometry(ellipseGeometry);
  }

  return createEllipseGeometry;

}));
