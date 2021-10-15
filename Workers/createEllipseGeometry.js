/* This file is automatically rebuilt by the Cesium build process. */
define(['./Matrix2-92b7fb9d', './when-8166c7dd', './EllipseGeometry-eb6b3f48', './RuntimeError-4fdc4459', './ComponentDatatype-9ed50558', './WebGLConstants-0664004c', './GeometryOffsetAttribute-e8e698d7', './Transforms-62a339c3', './combine-a5c4cc47', './EllipseGeometryLibrary-64f7a7c9', './GeometryAttribute-6f4c3b93', './GeometryAttributes-50becc99', './GeometryInstance-c790ce17', './GeometryPipeline-54fb0bb4', './AttributeCompression-212262a3', './EncodedCartesian3-4a314cb8', './IndexDatatype-797210ca', './IntersectionTests-4f28a69c', './Plane-049255eb', './VertexFormat-c0801687'], (function (Matrix2, when, EllipseGeometry, RuntimeError, ComponentDatatype, WebGLConstants, GeometryOffsetAttribute, Transforms, combine, EllipseGeometryLibrary, GeometryAttribute, GeometryAttributes, GeometryInstance, GeometryPipeline, AttributeCompression, EncodedCartesian3, IndexDatatype, IntersectionTests, Plane, VertexFormat) { 'use strict';

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
