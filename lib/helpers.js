"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Defer_1 = require("./Defer");
var CANVAS_ID = "_clip-photo_" + Date.now().toString();
function loadImage(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var img, defer;
        return tslib_1.__generator(this, function (_a) {
            img = new Image();
            defer = new Defer_1.default();
            img.onload = function () {
                defer.resolve(img);
            };
            img.onerror = function () {
                defer.reject(new Error('图片加载失败'));
            };
            img.src = url;
            return [2, defer.promise];
        });
    });
}
exports.loadImage = loadImage;
var base64Canvas = null;
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
exports.base64Image = base64Image;
function clipImageByPosition(img, x, y, width, height, type, quality, backgroundColor, padLeft, padTop) {
    if (type === void 0) { type = 'jpeg'; }
    if (quality === void 0) { quality = 1; }
    if (backgroundColor === void 0) { backgroundColor = null; }
    if (padLeft === void 0) { padLeft = 0; }
    if (padTop === void 0) { padTop = 0; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var canvas, bgColor;
        return tslib_1.__generator(this, function (_a) {
            canvas = document.querySelector("canvas#" + CANVAS_ID);
            bgColor = !backgroundColor ? (type === 'png' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255, 1)') : backgroundColor;
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
            return [2, new Promise(function (resolve, _reject) {
                    setTimeout(function () {
                        var ctx = canvas.getContext('2d');
                        var naturalWidth = img.naturalWidth, naturalHeight = img.naturalHeight;
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
exports.clipImageByPosition = clipImageByPosition;
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
    var containerHeight;
    if (canOverClip) {
        containerHeight = Math.min(Math.ceil(containerWidth / ratio), wrapperWidth);
        if (ratio > natureWidth / natureHeight) {
            photoImageHeight = containerHeight;
            photoImageWidth = natureWidth * photoImageHeight / natureHeight;
        }
        else {
            photoImageWidth = containerWidth;
            photoImageHeight = photoImageWidth * natureHeight / natureWidth;
        }
        viewportX = containerWidth * 0.15;
        viewportY = containerHeight * 0.15;
        viewportWidth = containerWidth * 0.7;
        viewportHeight = containerHeight * 0.7;
    }
    else {
        containerHeight = containerWidth * natureHeight / natureWidth;
        photoImageHeight = containerHeight;
        photoImageWidth = containerWidth;
        if (ratio > natureWidth / natureHeight) {
            viewportWidth = containerWidth;
            viewportX = 0;
            viewportHeight = viewportWidth / ratio;
            viewportY = (containerHeight - viewportHeight) / 2;
        }
        else {
            viewportHeight = containerHeight;
            viewportY = 0;
            viewportWidth = ratio ? viewportHeight * ratio : containerWidth;
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
        containerWidth: containerWidth,
    };
}
exports.calcContainerSize = calcContainerSize;
function setAngleMinRangeInternal(ratio, deltaX, deltaY, type) {
    var x;
    var y;
    if (type === 'left') {
        if (ratio >= Math.abs(deltaX / deltaY)) {
            x = -deltaX;
            y = -deltaX / ratio;
        }
        else {
            y = -deltaY;
            x = -deltaY * ratio;
        }
        return [x, y];
    }
    else {
        if (ratio >= deltaX / deltaY) {
            x = deltaX;
            y = deltaX / ratio;
        }
        else {
            y = deltaY;
            x = deltaY * ratio;
        }
        return [x, y];
    }
}
;
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
    }
    else {
        var deltaX = void 0;
        var deltaY = void 0;
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
        if (anchorType.indexOf('right') !== -1) {
            minX = minWidth - viewportWidth;
        }
        else if (anchorType.indexOf('left') !== -1) {
            minX = -deltaX;
        }
        if (anchorType.indexOf('top') !== -1) {
            minY = -deltaY;
        }
        else if (anchorType.indexOf('bottom') !== -1) {
            minY = minHeight - viewportHeight;
        }
        if (anchorType.indexOf('left') !== -1 || anchorType.indexOf('center') !== -1) {
            maxX = viewportWidth - minWidth;
            maxY = viewportHeight - minHeight;
        }
        if (anchorType.indexOf('left') !== -1) {
            maxX = viewportWidth - minWidth;
        }
        else if (anchorType.indexOf('right') !== -1) {
            maxX = deltaX;
        }
        if (anchorType.indexOf('top') !== -1) {
            maxY = viewportHeight - minHeight;
        }
        else if (anchorType.indexOf('bottom') !== -1) {
            maxY = deltaY;
        }
        if (ratio) {
            if (anchorType === 'lefttop') {
                _a = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left'), minX = _a[0], minY = _a[1];
            }
            else if (anchorType === 'leftcenter') {
                minY = 0;
                maxY = 0;
                deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY);
                if ((deltaX / 2) / deltaY <= ratio) {
                    minX = -deltaX;
                }
                else {
                    minX = -deltaY * 2 * ratio;
                }
            }
            else if (anchorType === 'leftbottom') {
                _b = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left'), minX = _b[0], minY = _b[1];
            }
            else if (anchorType === 'topcenter') {
                minX = 0;
                maxX = 0;
                deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX);
                if ((deltaX * 2) / deltaY <= ratio) {
                    minY = -deltaX * 2 / ratio;
                }
                else {
                    minY = -deltaY;
                }
            }
            else if (anchorType === 'bottomcenter') {
                minX = 0;
                maxX = 0;
                minY = minHeight - viewportHeight;
                deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX);
                if (deltaX * 2 <= ratio * deltaY) {
                    maxY = deltaX * 2 / ratio;
                }
                else {
                    maxY = containerHeight - (viewportY + viewportHeight);
                }
            }
            else if (anchorType === 'righttop') {
                _c = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right'), maxX = _c[0], maxY = _c[1];
            }
            else if (anchorType === 'rightcenter') {
                minY = 0;
                maxY = 0;
                deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY);
                if ((deltaX / 2) / deltaY <= ratio) {
                    maxX = deltaX;
                }
                else {
                    maxX = deltaY * 2 * ratio;
                }
            }
            else if (anchorType === 'rightbottom') {
                _d = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right'), maxX = _d[0], maxY = _d[1];
            }
        }
    }
    return {
        x: [Math.round(minX), Math.round(maxX)],
        y: [Math.round(minY), Math.round(maxY)],
    };
    var _a, _b, _c, _d;
}
exports.calcOffsetEdge = calcOffsetEdge;
function calcScalePos(viewportX, viewportY, viewportWidth, viewportHeight, _deltaX, _deltaY, type, ratio) {
    var x = viewportX;
    var y = viewportY;
    var width = viewportWidth;
    var height = viewportHeight;
    var deltaX = _deltaX;
    var deltaY = _deltaY;
    switch (type) {
        case 'lefttop': {
            x += deltaX;
            width = viewportX + viewportWidth - x;
            if (ratio) {
                y = viewportY + viewportHeight - width / ratio;
            }
            else {
                y += deltaY;
            }
            height = viewportY + viewportHeight - y;
            break;
        }
        case 'leftbottom': {
            x += deltaX;
            width -= deltaX;
            height += deltaY;
            break;
        }
        case 'leftcenter': {
            x += deltaX;
            width -= deltaX;
            if (ratio) {
                height = width / ratio;
                y += (viewportHeight - height) / 2;
            }
            break;
        }
        case 'righttop': {
            width += deltaX;
            if (ratio) {
                height = width / ratio;
                y = viewportHeight + viewportY - height;
            }
            else {
                y += deltaY;
                height -= deltaY;
            }
            break;
        }
        case 'rightbottom': {
            width += deltaX;
            height += deltaY;
            break;
        }
        case 'rightcenter': {
            width += deltaX;
            if (ratio) {
                height = width / ratio;
                y = viewportY + (viewportHeight - height) / 2;
            }
            break;
        }
        case 'topcenter': {
            y += deltaY;
            height -= deltaY;
            if (ratio) {
                width = height * ratio;
                x = viewportX + (viewportWidth - width) / 2;
            }
            break;
        }
        case 'bottomcenter': {
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
        x: x, y: y, width: width, height: height,
    };
}
exports.calcScalePos = calcScalePos;
function getDistance(l, m, naturalSize) {
    if (!l) {
        return 100;
    }
    if (typeof l === 'string' && /^(([1-9]\d*)|0)(\.\d+)?\%$/.test(l)) {
        return Number(l.replace('%', '')) * m * 0.01;
    }
    return m / naturalSize * Number(l);
}
exports.getDistance = getDistance;
function prefixClipInfo(info, containerWidth, containerHeight) {
    var x = info.x, y = info.y, width = info.width, height = info.height;
    var _x = x < 2 ? 0 : Math.max(0, Math.floor(x));
    var _y = y < 2 ? 0 : Math.max(0, Math.floor(y));
    return {
        x: _x,
        y: _y,
        width: Math.abs(containerWidth - _x - width) < 2 ? Math.floor(containerWidth - _x) : Math.ceil(width),
        height: Math.abs(containerHeight - _y - height) < 2 ? Math.floor(containerHeight - _y) : Math.ceil(height),
    };
}
exports.prefixClipInfo = prefixClipInfo;
function distanceOfPoints(x0, y0, x1, y1) {
    if (x1 === void 0) { x1 = 0; }
    if (y1 === void 0) { y1 = 0; }
    return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}
exports.distanceOfPoints = distanceOfPoints;
