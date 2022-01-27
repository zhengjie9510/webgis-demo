/* This file is automatically rebuilt by the Cesium build process. */
define(['./AttributeCompression-a3d02c34', './Matrix2-0e286ffc', './ComponentDatatype-9ed50558', './createTaskProcessorWorker', './RuntimeError-4fdc4459', './when-8166c7dd', './WebGLConstants-0664004c'], (function (AttributeCompression, Matrix2, ComponentDatatype, createTaskProcessorWorker, RuntimeError, when, WebGLConstants) { 'use strict';

  var maxShort = 32767;

  var scratchBVCartographic = new Matrix2.Cartographic();
  var scratchEncodedPosition = new Matrix2.Cartesian3();

  var scratchRectangle = new Matrix2.Rectangle();
  var scratchEllipsoid = new Matrix2.Ellipsoid();
  var scratchMinMaxHeights = {
    min: undefined,
    max: undefined,
  };

  function unpackBuffer(packedBuffer) {
    packedBuffer = new Float64Array(packedBuffer);

    var offset = 0;
    scratchMinMaxHeights.min = packedBuffer[offset++];
    scratchMinMaxHeights.max = packedBuffer[offset++];

    Matrix2.Rectangle.unpack(packedBuffer, offset, scratchRectangle);
    offset += Matrix2.Rectangle.packedLength;

    Matrix2.Ellipsoid.unpack(packedBuffer, offset, scratchEllipsoid);
  }

  function createVectorTilePoints(parameters, transferableObjects) {
    var positions = new Uint16Array(parameters.positions);

    unpackBuffer(parameters.packedBuffer);
    var rectangle = scratchRectangle;
    var ellipsoid = scratchEllipsoid;
    var minimumHeight = scratchMinMaxHeights.min;
    var maximumHeight = scratchMinMaxHeights.max;

    var positionsLength = positions.length / 3;
    var uBuffer = positions.subarray(0, positionsLength);
    var vBuffer = positions.subarray(positionsLength, 2 * positionsLength);
    var heightBuffer = positions.subarray(
      2 * positionsLength,
      3 * positionsLength
    );
    AttributeCompression.AttributeCompression.zigZagDeltaDecode(uBuffer, vBuffer, heightBuffer);

    var decoded = new Float64Array(positions.length);
    for (var i = 0; i < positionsLength; ++i) {
      var u = uBuffer[i];
      var v = vBuffer[i];
      var h = heightBuffer[i];

      var lon = ComponentDatatype.CesiumMath.lerp(rectangle.west, rectangle.east, u / maxShort);
      var lat = ComponentDatatype.CesiumMath.lerp(rectangle.south, rectangle.north, v / maxShort);
      var alt = ComponentDatatype.CesiumMath.lerp(minimumHeight, maximumHeight, h / maxShort);

      var cartographic = Matrix2.Cartographic.fromRadians(
        lon,
        lat,
        alt,
        scratchBVCartographic
      );
      var decodedPosition = ellipsoid.cartographicToCartesian(
        cartographic,
        scratchEncodedPosition
      );
      Matrix2.Cartesian3.pack(decodedPosition, decoded, i * 3);
    }

    transferableObjects.push(decoded.buffer);

    return {
      positions: decoded.buffer,
    };
  }
  var createVectorTilePoints$1 = createTaskProcessorWorker(createVectorTilePoints);

  return createVectorTilePoints$1;

}));
