"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var helpers_1 = require("./helpers");
require("./index.less");
var uuid = 0;
var activeUUID = null;
var isTouchScreen = 'ontouchstart' in window;
var ImageClip = (function (_super) {
    tslib_1.__extends(ImageClip, _super);
    function ImageClip(props, ctx) {
        var _this = _super.call(this, props, ctx) || this;
        _this.$container = null;
        _this.$viewport = null;
        _this.state = {
            loading: true,
            viewportPos: {
                left: 0,
                top: 0,
                height: 0,
                width: 0,
            },
            backgroundSizeHeight: 0,
            backgroundSizeWidth: 0,
            backgroundPositionX: 0,
            backgroundPositionY: 0,
            containerHeight: 0,
            dragOffset: {
                x: 0, y: 0,
            },
            isDragging: false,
            isResizing: false,
            failed: false,
        };
        _this.internalGetDataURL = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var _a, left, top, height, width, fixedViewPort, clipInfo;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state.viewportPos, left = _a.left, top = _a.top, height = _a.height, width = _a.width;
                        fixedViewPort = helpers_1.prefixClipInfo({
                            x: left,
                            y: top,
                            height: height,
                            width: width,
                        }, this.containerWidth, this.state.containerHeight);
                        clipInfo = {
                            x: fixedViewPort.x * this.scaleRatio,
                            y: fixedViewPort.y * this.scaleRatio,
                            width: fixedViewPort.width * this.scaleRatio,
                            height: fixedViewPort.height * this.scaleRatio,
                        };
                        return [4, helpers_1.clipImageByPosition(this.image, clipInfo.x, clipInfo.y, clipInfo.width, clipInfo.height, this.props.imageType || 'jpeg', this.props.quality || 1, this.props.canOverClip ? this.props.fillColor : null, this.props.canOverClip ? this.state.backgroundPositionX * this.scaleRatio : 0, this.props.canOverClip ? this.state.backgroundPositionY * this.scaleRatio : 0)];
                    case 1: return [2, _b.sent()];
                }
            });
        }); };
        _this.handleDragStart = function (e) {
            activeUUID = _this.uuid;
            if (_this.timer > 0) {
                _this.clearDelayTimer();
            }
            if (e.touches && e.touches.length === 2) {
                _this.clearDelayTimer();
                _this.thumbOriginDistance = helpers_1.distanceOfPoints(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
                _this.moveStartPos = {
                    x: NaN,
                    y: NaN,
                    viewportOriginPos: tslib_1.__assign({}, _this.state.viewportPos),
                };
                _this.movePosRange = {
                    x: [NaN, _this.state.viewportPos.left + _this.state.viewportPos.width / 2 - _this.min.width / 2],
                    y: [NaN, _this.state.viewportPos.top + _this.state.viewportPos.height / 2 - _this.min.height / 2],
                };
                _this.setState({
                    isDragging: false,
                    isResizing: true,
                });
                return;
            }
            var _a = isTouchScreen ? e.touches[0] : e, clientX = _a.clientX, clientY = _a.clientY;
            _this.timer = window.setTimeout(function () {
                _this.setState({
                    isDragging: true,
                });
                _this.moveStartPos = {
                    x: clientX,
                    y: clientY,
                };
                _this.timer = NaN;
                _this.movePosRange = helpers_1.calcOffsetEdge(_this.props.canOverClip ? 0 : _this.state.backgroundPositionX, _this.props.canOverClip ? 0 : _this.state.backgroundPositionY, _this.containerWidth, _this.props.canOverClip ? _this.state.containerHeight : _this.state.backgroundSizeHeight, _this.state.viewportPos.left, _this.state.viewportPos.top, _this.state.viewportPos.width, _this.state.viewportPos.height, 'move');
            }, typeof _this.props.delayTime === 'number' ? _this.props.delayTime : ('ontouchstart' in window ? 150 : 0));
        };
        _this.handleDragEnd = function () {
            if (activeUUID !== _this.uuid) {
                return;
            }
            if (_this.state.isResizing) {
                return _this.handleResizeDragEnd();
            }
            if (_this.timer > 0) {
                _this.clearDelayTimer();
            }
            _this.moveStartPos = null;
            _this.movePosRange = null;
            _this.thumbOriginDistance = null;
            _this.setState(function (s) {
                var nextState = tslib_1.__assign({}, s);
                var _a = s.viewportPos, left = _a.left, top = _a.top, other = tslib_1.__rest(_a, ["left", "top"]);
                nextState.dragOffset = {
                    x: 0, y: 0,
                };
                nextState.isDragging = false;
                nextState.isResizing = false;
                nextState.viewportPos = tslib_1.__assign({ left: left + s.dragOffset.x, top: top + s.dragOffset.y }, other);
                return nextState;
            }, _this.fireChange);
        };
        _this.handleDragOver = function (e) {
            if (_this.uuid !== activeUUID) {
                return;
            }
            if (_this.state.isResizing) {
                return _this.handleResizeDragOver(e);
            }
            if (!_this.state.isDragging && !_this.state.isResizing) {
                if (_this.timer > 0) {
                    _this.clearDelayTimer();
                }
            }
            else if (isTouchScreen && _this.state.isResizing && e.touches && e.touches.length === 2) {
                _this.handleResizeDragOver(e);
            }
            else {
                e.preventDefault();
                var _a = isTouchScreen ? e.touches[0] : e, clientX = _a.clientX, clientY = _a.clientY;
                var offset = {
                    x: Math.max(Math.min(clientX - _this.moveStartPos.x, _this.movePosRange.x[1]), _this.movePosRange.x[0]),
                    y: Math.max(Math.min(clientY - _this.moveStartPos.y, _this.movePosRange.y[1]), _this.movePosRange.y[0]),
                };
                _this.setState({
                    dragOffset: offset,
                });
            }
        };
        _this.handleResizeDragStart = function (e) {
            e.stopPropagation();
            _this.anchorType = e.currentTarget.dataset.type;
            activeUUID = _this.uuid;
            if (_this.timer > 0) {
                _this.clearDelayTimer();
            }
            var _a = isTouchScreen ? e.touches[0] : e, clientX = _a.clientX, clientY = _a.clientY;
            _this.timer = window.setTimeout(function () {
                _this.setState({
                    isResizing: true,
                });
                _this.moveStartPos = {
                    x: clientX,
                    y: clientY,
                    viewportOriginPos: _this.state.viewportPos,
                };
                _this.movePosRange = helpers_1.calcOffsetEdge(_this.props.canOverClip ? 0 : _this.state.backgroundPositionX, _this.props.canOverClip ? 0 : _this.state.backgroundPositionY, _this.containerWidth, _this.props.canOverClip ? _this.state.containerHeight : _this.state.backgroundSizeHeight, _this.state.viewportPos.left, _this.state.viewportPos.top, _this.state.viewportPos.width, _this.state.viewportPos.height, 'scale', _this.min.width, _this.min.height, _this.anchorType, _this.props.ratio);
            }, typeof _this.props.delayTime === 'number' ? _this.props.delayTime : ('ontouchstart' in window ? 150 : 0));
        };
        _this.handleResizeDragEnd = function () {
            _this.anchorType = null;
            if (_this.timer > 0) {
                _this.clearDelayTimer();
            }
            _this.moveStartPos = null;
            _this.movePosRange = null;
            _this.setState(function (s) {
                var nextState = tslib_1.__assign({}, s);
                nextState.dragOffset = {
                    x: 0, y: 0,
                };
                nextState.isResizing = false;
                return nextState;
            }, _this.fireChange);
        };
        _this.handleResizeDragOver = function (e) {
            e.stopPropagation();
            if (!_this.state.isResizing) {
            }
            else if (e.touches && e.touches.length === 2 && _this.thumbOriginDistance > 0) {
                e.stopPropagation();
                e.preventDefault();
                var delta = helpers_1.distanceOfPoints(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
                var fixedDelta = 0.707 * (delta - _this.thumbOriginDistance) / 2;
                _this.thumbOriginDistance = delta;
                var x = void 0;
                var y = void 0;
                var width = void 0;
                var height = void 0;
                width = _this.state.viewportPos.width + fixedDelta * 2;
                x = _this.state.viewportPos.left - fixedDelta;
                y = _this.state.viewportPos.top - fixedDelta;
                height = _this.state.viewportPos.height + fixedDelta * 2;
                var lastRatio = _this.props.ratio ||
                    _this.moveStartPos.viewportOriginPos.width / _this.moveStartPos.viewportOriginPos.height;
                x = Math.min(_this.movePosRange.x[1], Math.max(0, x));
                y = Math.min(_this.movePosRange.y[1], Math.max(0, y));
                width = Math.max(Math.min(_this.containerWidth - x, width), _this.min.width);
                height = Math.max(Math.min(_this.state.containerHeight - y, width / lastRatio), _this.min.height);
                var hBaseWidth = height * lastRatio;
                var wBaseHeight = width / lastRatio;
                _this.setState({
                    viewportPos: {
                        left: x,
                        top: y,
                        width: Math.min(width, hBaseWidth),
                        height: Math.min(height, wBaseHeight),
                    }
                });
            }
            else {
                e.stopPropagation();
                e.preventDefault();
                var _a = isTouchScreen ? e.touches[0] : e, clientX = _a.clientX, clientY = _a.clientY;
                var offset_1 = {
                    x: Math.min(Math.max(clientX - _this.moveStartPos.x, _this.movePosRange.x[0]), _this.movePosRange.x[1]),
                    y: Math.min(Math.max(clientY - _this.moveStartPos.y, _this.movePosRange.y[0]), _this.movePosRange.y[1]),
                };
                _this.setState(function (s) {
                    var nextState = tslib_1.__assign({}, s);
                    var _a = helpers_1.calcScalePos(_this.moveStartPos.viewportOriginPos.left, _this.moveStartPos.viewportOriginPos.top, _this.moveStartPos.viewportOriginPos.width, _this.moveStartPos.viewportOriginPos.height, offset_1.x, offset_1.y, _this.anchorType, _this.props.ratio), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                    nextState.viewportPos = {
                        left: x, top: y, width: width, height: height,
                    };
                    return nextState;
                });
            }
        };
        _this.fireChange = function () {
            if (typeof _this.props.onChange === 'function') {
                var _a = _this.state.viewportPos, left = _a.left, top_1 = _a.top, height = _a.height, width = _a.width;
                var fixedViewPort = helpers_1.prefixClipInfo({
                    x: left,
                    y: top_1,
                    height: height,
                    width: width,
                }, _this.containerWidth, _this.state.containerHeight);
                _this.props.onChange({
                    x: (fixedViewPort.x - _this.state.backgroundPositionX) * _this.scaleRatio,
                    y: (fixedViewPort.y - _this.state.backgroundPositionY) * _this.scaleRatio,
                    width: fixedViewPort.width * _this.scaleRatio,
                    height: fixedViewPort.height * _this.scaleRatio,
                    naturalHeight: _this.image.naturalHeight,
                    naturalWidth: _this.image.naturalWidth,
                });
            }
        };
        _this.getContainerRef = function (ref) {
            _this.$container = ref;
            _this.containerWidth = _this.$container.getBoundingClientRect().width;
        };
        _this.getViewport = function (ref) {
            _this.$viewport = ref;
        };
        _this.getLeftTopAnchor = function (ref) {
            _this.$leftTopAnchor = ref;
        };
        _this.getLeftCenterAnchor = function (ref) {
            _this.$leftCenterAnchor = ref;
        };
        _this.getLeftBottomAnchor = function (ref) {
            _this.$leftBottomAnchor = ref;
        };
        _this.getTopCenterAnchor = function (ref) {
            _this.$topCenterAnchor = ref;
        };
        _this.getBottomCenterAnchor = function (ref) {
            _this.$bottomCenterAnchor = ref;
        };
        _this.getRightTopAnchor = function (ref) {
            _this.$rightTopAnchor = ref;
        };
        _this.getRightCenterAnchor = function (ref) {
            _this.$rightCenterAnchor = ref;
        };
        _this.getRightBottomAnchor = function (ref) {
            _this.$rightBottomAnchor = ref;
        };
        _this.timer = NaN;
        _this.image = null;
        _this.anchorType = null;
        _this.uuid = uuid++;
        if (typeof props.getDataURLDelegator === 'function') {
            props.getDataURLDelegator(_this.internalGetDataURL);
        }
        return _this;
    }
    ImageClip.prototype.componentDidMount = function () {
        var _this = this;
        this.loadImage(this.props.src);
        var anchors = [
            this.$leftTopAnchor,
            this.$leftCenterAnchor,
            this.$leftBottomAnchor,
            this.$topCenterAnchor,
            this.$bottomCenterAnchor,
            this.$rightBottomAnchor,
            this.$rightCenterAnchor,
            this.$rightTopAnchor,
        ];
        if (isTouchScreen) {
            this.$viewport.addEventListener('touchstart', this.handleDragStart, { passive: false });
            anchors.forEach(function (dom) {
                dom.addEventListener('touchstart', _this.handleResizeDragStart, { passive: false });
            });
            document.addEventListener('touchend', this.handleDragEnd, { passive: false });
            document.addEventListener('touchmove', this.handleDragOver, { passive: false });
        }
        else {
            this.$viewport.addEventListener('mousedown', this.handleDragStart, { passive: false });
            anchors.forEach(function (dom) {
                dom.addEventListener('mousedown', _this.handleResizeDragStart, { passive: false });
            });
            document.addEventListener('mouseup', this.handleDragEnd, { passive: false });
            document.addEventListener('mousemove', this.handleDragOver, { passive: false });
        }
    };
    ImageClip.prototype.componentWillUnmount = function () {
        var _this = this;
        var anchors = [
            this.$leftTopAnchor,
            this.$leftCenterAnchor,
            this.$leftBottomAnchor,
            this.$topCenterAnchor,
            this.$bottomCenterAnchor,
            this.$rightBottomAnchor,
            this.$rightCenterAnchor,
            this.$rightTopAnchor,
        ];
        if (isTouchScreen) {
            this.$viewport.removeEventListener('touchstart', this.handleDragStart);
            anchors.forEach(function (dom) {
                dom.removeEventListener('touchstart', _this.handleResizeDragStart);
            });
            document.removeEventListener('touchmove', this.handleDragOver);
            document.removeEventListener('touchend', this.handleDragEnd);
        }
        else {
            this.$viewport.removeEventListener('mousedown', this.handleDragStart);
            anchors.forEach(function (dom) {
                dom.removeEventListener('mousedown', _this.handleResizeDragStart);
            });
            document.removeEventListener('mouseup', this.handleDragEnd);
            document.removeEventListener('mousemove', this.handleDragOver);
        }
    };
    ImageClip.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.getDataURLDelegator !== this.props.getDataURLDelegator
            && typeof nextProps.getDataURLDelegator === 'function') {
            nextProps.getDataURLDelegator(this.internalGetDataURL);
        }
        if (nextProps.src !== this.props.src || nextProps.ratio !== this.props.ratio
            || nextProps.canOverClip !== this.props.canOverClip) {
            return this.loadImage(nextProps.src);
        }
        if (nextProps.x !== undefined && nextProps.y !== undefined && nextProps.width !== undefined && nextProps.height !== undefined) {
            this.setState({
                viewportPos: {
                    left: (nextProps.x / this.scaleRatio) + this.state.backgroundPositionX,
                    top: (nextProps.y / this.scaleRatio) + this.state.backgroundPositionY,
                    height: nextProps.height / this.scaleRatio,
                    width: nextProps.width / this.scaleRatio,
                }
            });
        }
    };
    ImageClip.prototype.loadImage = function (src) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, e_1, layoutInfo;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setState({
                            loading: true,
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        _a = this;
                        return [4, helpers_1.loadImage(src)];
                    case 2:
                        _a.image = _b.sent();
                        return [3, 5];
                    case 3:
                        e_1 = _b.sent();
                        this.props.onError('IMG_LOAD_FAIL');
                        this.setState({
                            failed: true,
                        });
                        return [3, 5];
                    case 4:
                        this.setState({
                            loading: false,
                        });
                        return [7];
                    case 5:
                        if (!this.image) {
                            return [2];
                        }
                        this.containerWidth = this.$container.getBoundingClientRect().width;
                        layoutInfo = helpers_1.calcContainerSize(this.props.ratio, this.props.canOverClip, this.containerWidth, this.image.naturalWidth, this.image.naturalHeight);
                        this.scaleRatio = this.image.naturalWidth / layoutInfo.photoImageWidth;
                        this.setState({
                            containerHeight: layoutInfo.containerHeight,
                            viewportPos: {
                                left: layoutInfo.viewportX,
                                top: layoutInfo.viewportY,
                                height: layoutInfo.viewportHeight,
                                width: layoutInfo.viewportWidth,
                            },
                            backgroundSizeHeight: layoutInfo.photoImageHeight,
                            backgroundSizeWidth: layoutInfo.photoImageWidth,
                            backgroundPositionX: layoutInfo.photoImageX,
                            backgroundPositionY: layoutInfo.photoImageY,
                        }, this.fireChange);
                        return [2];
                }
            });
        });
    };
    ImageClip.prototype.clearDelayTimer = function () {
        clearTimeout(this.timer);
        this.timer = NaN;
        this.moveStartPos = null;
    };
    Object.defineProperty(ImageClip.prototype, "containerStyle", {
        get: function () {
            return {
                backgroundImage: "url(" + this.props.src + ")",
                height: this.state.containerHeight + "px",
                backgroundPosition: this.state.backgroundPositionX + "px " + this.state.backgroundPositionY + "px",
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageClip.prototype, "viewportStyle", {
        get: function () {
            var _a = this.state.viewportPos, height = _a.height, width = _a.width, left = _a.left, top = _a.top;
            var _b = this.state.dragOffset, x = _b.x, y = _b.y;
            return {
                backgroundImage: "url(" + this.props.src + ")",
                backgroundSize: this.state.backgroundSizeWidth + "px " + this.state.backgroundSizeHeight + "px",
                transform: "translate(" + (left + (this.state.isDragging ? x : 0)) + "px," + (top + (this.state.isDragging ? y : 0)) + "px)",
                height: height, width: width,
                backgroundPosition: this.state.backgroundPositionX - left - (this.state.isDragging ? x : 0) + "px"
                    + (" " + (this.state.backgroundPositionY - top - (this.state.isDragging ? y : 0)) + "px"),
                opacity: this.state.isDragging ? 0.7 : 1,
                display: this.state.failed || this.state.loading ? 'none' : 'block',
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageClip.prototype, "min", {
        get: function () {
            var width = helpers_1.getDistance(this.props.minWidth || '37%', this.containerWidth, this.image.naturalWidth);
            var height = helpers_1.getDistance(this.props.minHeight || '37%', this.state.containerHeight, this.image.naturalHeight);
            if (this.props.ratio) {
                var hBaseMinWidth = height * this.props.ratio;
                var wBaseMinHeight = width / this.props.ratio;
                width = Math.min(width, hBaseMinWidth);
                height = Math.min(height, wBaseMinHeight);
            }
            return {
                width: width,
                height: height,
            };
        },
        enumerable: true,
        configurable: true
    });
    ImageClip.prototype.render = function () {
        return (React.createElement("div", { className: "clip-container", ref: this.getContainerRef, style: this.containerStyle },
            React.createElement("div", { className: "clip-container-loading", style: { display: this.state.loading ? 'flex' : 'none' } }, "\u56FE\u7247\u52A0\u8F7D\u4E2D..."),
            React.createElement("div", { className: "clip-viewport" + (this.state.isResizing ? ' clip-resizeing' : ''), ref: this.getViewport, style: this.viewportStyle },
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-lt", "data-type": "lefttop", ref: this.getLeftTopAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-lb", "data-type": "leftbottom", ref: this.getLeftBottomAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-rt", "data-type": "righttop", ref: this.getRightTopAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-rb", "data-type": "rightbottom", ref: this.getRightBottomAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-tm", "data-type": "topcenter", ref: this.getTopCenterAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-bm", "data-type": "bottomcenter", ref: this.getBottomCenterAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-lm", "data-type": "leftcenter", ref: this.getLeftCenterAnchor }),
                React.createElement("div", { style: { display: this.state.failed ? 'none' : 'block' }, className: "clip-anchor clip-anchor-rm", "data-type": "rightcenter", ref: this.getRightCenterAnchor }))));
    };
    ImageClip.defaultProps = {
        onError: function () { },
    };
    return ImageClip;
}(React.Component));
exports.default = ImageClip;
