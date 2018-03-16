"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadImage = loadImage;
exports.base64Image = base64Image;
exports.clipImageByPosition = clipImageByPosition;
exports.calcContainerSize = calcContainerSize;
exports.calcOffsetEdge = calcOffsetEdge;
exports.calcScalePos = calcScalePos;
exports.getDistance = getDistance;
exports.prefixClipInfo = prefixClipInfo;
exports.distanceOfPoints = distanceOfPoints;

var _tslib = require("tslib");

var tslib_1 = _interopRequireWildcard(_tslib);

var _Defer = require("./Defer");

var _Defer2 = _interopRequireDefault(_Defer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var CANVAS_ID = "_clip-photo_" + Date.now().toString();
/**
 * 加载图片
 *
 * @export
 * @param {string} url 图片地址
 * @returns {Promise<HTMLImageElement>}
 */

function loadImage(url) {
  return tslib_1.__awaiter(this, void 0, void 0, function () {
    var img, defer;
    return tslib_1.__generator(this, function (_a) {
      img = new Image();
      defer = new _Defer2.default();

      img.onload = function () {
        defer.resolve(img);
      };

      img.onerror = function () {
        defer.reject(new Error('图片加载失败'));
      };

      img.src = url;
      return [2
      /*return*/
      , defer.promise];
    });
  });
}

var base64Canvas = null;
/**
 * 获取图片 base64
 *
 * @export
 * @param {HTMLImageElement} img
 * @returns {string}
 */

function base64Image(img) {
  if (base64Canvas === null) {
    base64Canvas = document.createElement('canvas');
    base64Canvas.style.display = 'none';
    base64Canvas.style.position = 'fixed';
    base64Canvas.style.left = '-99999px';
    base64Canvas.style.top = '-99999px';
    document.body.appendChild(base64Canvas);
  }

  base64Canvas.width = img.naturalWidth;
  base64Canvas.height = img.naturalHeight;
  var ctx = base64Canvas.getContext('2d');
  ctx.clearRect(0, 0, base64Canvas.width, base64Canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, base64Canvas.width, base64Canvas.height);
  ctx.drawImage(img, 0, 0);
  return base64Canvas.toDataURL('image/png');
}
/**
 * canvas 剪裁图片
 *
 * @export
 * @param {HTMLImageElement} img
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} type   图片压缩格式
 * @param {number} quality  图片压缩质量 范围：(0, 1]
 * @param {string} [backgroundColor='#fff'] 背景填充色 默认：非 png 白，png 为 transparent
 * @param {number} [padLeft=0] 左空白
 * @param {number} [padTop=0] 上空白
 * @returns
 */


function clipImageByPosition(img, x, y, width, height, type, quality, backgroundColor, padLeft, padTop) {
  if (type === void 0) {
    type = 'jpeg';
  }

  if (quality === void 0) {
    quality = 1;
  }

  if (backgroundColor === void 0) {
    backgroundColor = null;
  }

  if (padLeft === void 0) {
    padLeft = 0;
  }

  if (padTop === void 0) {
    padTop = 0;
  }

  return tslib_1.__awaiter(this, void 0, void 0, function () {
    var canvas, bgColor;
    return tslib_1.__generator(this, function (_a) {
      canvas = document.querySelector("canvas#" + CANVAS_ID);
      bgColor = !backgroundColor ? type === 'png' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255, 1)' : backgroundColor;

      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = CANVAS_ID;
        canvas.style.visibility = 'invisible';
        canvas.style.position = 'fixed';
        canvas.style.left = '-10000px';
        canvas.style.top = '-10000px';
        canvas.style.userSelect = 'none';
        canvas.style.zIndex = '-999';
        document.body.appendChild(canvas);
      }

      return [2
      /*return*/
      , new Promise(function (resolve, _reject) {
        setTimeout(function () {
          var ctx = canvas.getContext('2d');
          var naturalWidth = img.naturalWidth,
              naturalHeight = img.naturalHeight;
          canvas.width = naturalWidth;
          canvas.height = naturalHeight;
          ctx.drawImage(img, 0, 0);
          var imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
          ctx.putImageData(imageData, -(x - padLeft), -(y - padTop), x - padLeft, y - padTop, width - Math.min(0, x - padLeft), height - Math.min(0, y - padTop));
          resolve(canvas.toDataURL("image/" + type, quality));
        }, 16);
      })];
    });
  });
}
/**
 * 剪裁框、容器自适应大小计算
 *
 * @export
 * @param {number} ratio
 * @param {boolean} canOverClip
 * @param {number} wrapperWidth
 * @param {number} natureWidth
 * @param {number} natureHeight
 * @returns {{
 *   viewportX: number;      // 截图位置
 *   viewportY: number;
 *   viewportWidth: number;
 *   viewportHeight: number;
 *   photoImageX: number;    // 图片位置
 *   photoImageY: number;
 *   photoImageWidth: number;
 *   photoImageHeight: number;
 *   containerWidth: number; // 容器大小
 *   containerHeight: number;
 * }}
 */


function calcContainerSize(ratio, canOverClip, wrapperWidth, natureWidth, natureHeight) {
  var viewportX;
  var viewportY;
  var viewportWidth;
  var viewportHeight;
  var photoImageX;
  var photoImageY;
  var photoImageWidth;
  var photoImageHeight;
  var containerWidth = wrapperWidth;
  var containerHeight; // 比较图片的高宽比

  if (canOverClip) {
    // 如果截图的高宽比大于原图的高宽比(如: 21:9 > 4:3)，且可以留白截图，则左右留白
    containerHeight = Math.min(Math.ceil(containerWidth / ratio), wrapperWidth);

    if (ratio > natureWidth / natureHeight) {
      photoImageHeight = containerHeight;
      photoImageWidth = natureWidth * photoImageHeight / natureHeight;
    } else {
      photoImageWidth = containerWidth;
      photoImageHeight = photoImageWidth * natureHeight / natureWidth;
    }

    viewportX = containerWidth * 0.15;
    viewportY = containerHeight * 0.15;
    viewportWidth = containerWidth * 0.7;
    viewportHeight = containerHeight * 0.7;
  } else {
    containerHeight = containerWidth * natureHeight / natureWidth;
    photoImageHeight = containerHeight;
    photoImageWidth = containerWidth; // 最大化截取位置

    if (ratio > natureWidth / natureHeight) {
      // 已宽度为基准
      viewportWidth = containerWidth;
      viewportX = 0;
      viewportHeight = viewportWidth / ratio;
      viewportY = (containerHeight - viewportHeight) / 2;
    } else {
      // 已高度为基准
      viewportHeight = containerHeight;
      viewportY = 0;
      viewportWidth = viewportHeight * ratio;
      viewportX = (containerWidth - viewportWidth) / 2;
    }
  }

  photoImageX = (containerWidth - photoImageWidth) / 2;
  photoImageY = (containerHeight - photoImageHeight) / 2;
  return {
    viewportX: viewportX,
    viewportY: viewportY,
    viewportWidth: viewportWidth,
    viewportHeight: viewportHeight,
    photoImageX: photoImageX,
    photoImageY: photoImageY,
    photoImageWidth: photoImageWidth,
    photoImageHeight: photoImageHeight,
    containerHeight: containerHeight,
    containerWidth: containerWidth
  };
}

function setAngleMinRangeInternal(ratio, deltaX, deltaY, type) {
  var x;
  var y;

  if (type === 'left') {
    if (ratio >= Math.abs(deltaX / deltaY)) {
      x = -deltaX;
      y = -deltaX / ratio;
    } else {
      y = -deltaY;
      x = -deltaY * ratio;
    }

    return [x, y];
  } else {
    if (ratio >= deltaX / deltaY) {
      x = deltaX;
      y = deltaX / ratio;
    } else {
      y = deltaY;
      x = deltaY * ratio;
    }

    return [x, y];
  }
}

;
/**
 * 计算限制剪裁区域不能超过原图时的移动偏移范围
 *
 * @export
 * @param {number} containerX
 * @param {number} containerY
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @param {number} viewportX
 * @param {number} viewportY
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 * @param {string} type  move | scale
 * @param {number?} minWidth   仅 scale 模式有效，限制最小宽度
 * @param {number?} minHeight  仅 scale 模式有效，限制最小高度
 * @param {AnchorType?} anchorType  仅 scale 模式有效，移动的是哪个锚点
 * @param {number?} ratio   仅 scale 模式有效，截图高宽比
 * @returns {{
 *   x: number[],
 *   y: number[],
 * }} x 轴和 y 轴的移动范围
 */

function calcOffsetEdge(containerX, containerY, containerWidth, containerHeight, viewportX, viewportY, viewportWidth, viewportHeight, type, minWidth, minHeight, anchorType, ratio) {
  var minX;
  var minY;
  var maxX;
  var maxY;

  if (type === 'move') {
    minX = containerX - viewportX;
    minY = containerY - viewportY;
    maxX = containerX + containerWidth - (viewportX + viewportWidth);
    maxY = containerY + containerHeight - (viewportY + viewportHeight);
  } else {
    var deltaX = void 0; // 视窗离边框的距离（放大方向）

    var deltaY = void 0; // 视窗离边框的距离（放大方向）

    if (anchorType.indexOf('left') !== -1 || anchorType.indexOf('center') !== -1) {
      maxX = viewportWidth - minWidth;
      maxY = viewportHeight - minHeight;
    }

    if (anchorType.indexOf('right') !== -1) {
      minY = minHeight - viewportHeight;
      minX = minWidth - viewportWidth;
    }

    if (anchorType.indexOf('left') !== -1) {
      deltaX = viewportX;
    }

    if (anchorType.indexOf('right') !== -1) {
      deltaX = containerWidth - (viewportX + viewportWidth);
    }

    if (anchorType.indexOf('top') !== -1) {
      deltaY = viewportY;
    }

    if (anchorType.indexOf('bottom') !== -1) {
      deltaY = containerHeight - (viewportHeight + viewportY);
    }

    if (anchorType === 'lefttop') {
      if (ratio) {
        _a = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left'), minX = _a[0], minY = _a[1];
      }
    } else if (anchorType === 'leftcenter') {
      minY = 0;
      maxY = 0;

      if (ratio) {
        deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY); // 取近的

        if (deltaX / 2 / deltaY <= ratio) {
          minX = -deltaX;
        } else {
          minX = -deltaY * 2 * ratio;
        }
      }
    } else if (anchorType === 'leftbottom') {
      if (ratio) {
        _b = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left'), minX = _b[0], minY = _b[1];
      }
    } else if (anchorType === 'topcenter') {
      minX = 0;
      maxX = 0;

      if (ratio) {
        deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX); // 取近的

        if (deltaX * 2 / deltaY <= ratio) {
          minY = -deltaX * 2 / ratio;
        } else {
          minY = -deltaY;
        }
      }
    } else if (anchorType === 'bottomcenter') {
      minX = 0;
      maxX = 0;
      minY = minHeight - viewportHeight;

      if (ratio) {
        deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX); // 取近的

        if (deltaX * 2 <= ratio * deltaY) {
          maxY = deltaX * 2 / ratio;
        } else {
          maxY = containerHeight - (viewportY + viewportHeight);
        }
      }
    } else if (anchorType === 'righttop') {
      if (ratio) {
        _c = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right'), maxX = _c[0], maxY = _c[1];
      }
    } else if (anchorType === 'rightcenter') {
      minY = 0;
      maxY = 0;

      if (ratio) {
        deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY); // 取近的

        if (deltaX / 2 / deltaY <= ratio) {
          maxX = deltaX;
        } else {
          maxX = deltaY * 2 * ratio;
        }
      }
    } else if (anchorType === 'rightbottom') {
      if (ratio) {
        _d = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right'), maxX = _d[0], maxY = _d[1];
      }
    } else {
      throw new Error('Invalid [anchorType] param of calcOffsetEdge function.');
    }
  }

  return {
    x: [Math.round(minX), Math.round(maxX)],
    y: [Math.round(minY), Math.round(maxY)]
  };

  var _a, _b, _c, _d;
}

function calcScalePos(viewportX, viewportY, viewportWidth, viewportHeight, _deltaX, _deltaY, type, ratio) {
  var x = viewportX;
  var y = viewportY;
  var width = viewportWidth;
  var height = viewportHeight;
  var deltaX = _deltaX;
  var deltaY = _deltaY;

  switch (type) {
    case 'lefttop':
      {
        x += deltaX;
        width = viewportX + viewportWidth - x;

        if (ratio) {
          y = viewportY + viewportHeight - width / ratio;
        } else {
          y += deltaY;
        }

        height = viewportY + viewportHeight - y;
        break;
      }

    case 'leftbottom':
      {
        x += deltaX;
        width -= deltaX;
        height += deltaY;
        break;
      }

    case 'leftcenter':
      {
        x += deltaX;
        width -= deltaX;

        if (ratio) {
          height = width / ratio;
          y += (viewportHeight - height) / 2;
        }

        break;
      }

    case 'righttop':
      {
        width += deltaX;

        if (ratio) {
          height = width / ratio;
          y = viewportHeight + viewportY - height;
        } else {
          y += deltaY;
          height -= deltaY;
        }

        break;
      }

    case 'rightbottom':
      {
        width += deltaX;
        height += deltaY;
        break;
      }

    case 'rightcenter':
      {
        width += deltaX;

        if (ratio) {
          height = width / ratio;
          y = viewportY + (viewportHeight - height) / 2;
        }

        break;
      }

    case 'topcenter':
      {
        y += deltaY;
        height -= deltaY;

        if (ratio) {
          width = height * ratio;
          x = viewportX + (viewportWidth - width) / 2;
        }

        break;
      }

    case 'bottomcenter':
      {
        height += deltaY;

        if (ratio) {
          width = height * ratio;
          x = viewportX + (viewportWidth - width) / 2;
        }

        break;
      }

    default:
      throw new Error('Invalid [type] param of calcScalePos function.');
  }

  if (ratio) {
    height = width / ratio;
  }

  return {
    x: x,
    y: y,
    width: width,
    height: height
  };
}
/**
 * 计算长度
 *
 * @export
 * @param {(number | string)} l 基于 px 的长度或者百分比
 * @param {number} m 当 l 为百分比时必须传入的基准值
 * @param {number} naturalSize 相对原始图片计算
 * @returns {number}
 */


function getDistance(l, m, naturalSize) {
  if (!l) {
    return 100;
  }

  if (typeof l === 'string' && /^(([1-9]\d*)|0)(\.\d+)?\%$/.test(l)) {
    return Number(l.replace('%', '')) * m * 0.01;
  }

  return m / naturalSize * Number(l);
}
/**
 * 更新值时的精度调节
 *
 * @export
 * @param {IClipPosInfo} info
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @returns {IClipPosInfo}
 */


function prefixClipInfo(info, containerWidth, containerHeight) {
  var x = info.x,
      y = info.y,
      width = info.width,
      height = info.height;

  var _x = x < 2 ? 0 : Math.max(0, Math.floor(x));

  var _y = y < 2 ? 0 : Math.max(0, Math.floor(y));

  return {
    x: _x,
    y: _y,
    width: Math.abs(containerWidth - _x - width) < 2 ? Math.floor(containerWidth - _x) : Math.ceil(width),
    height: Math.abs(containerHeight - _y - height) < 2 ? Math.floor(containerHeight - _y) : Math.ceil(height)
  };
}
/**
 * 笛卡尔坐标系两点距离
 *
 * @export
 * @param {number} x0
 * @param {number} y0
 * @param {number} [x1=0]
 * @param {number} [y1=0]
 * @returns
 */


function distanceOfPoints(x0, y0, x1, y1) {
  if (x1 === void 0) {
    x1 = 0;
  }

  if (y1 === void 0) {
    y1 = 0;
  }

  return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}