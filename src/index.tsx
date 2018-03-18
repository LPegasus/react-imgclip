import * as React from 'react';
import {
  loadImage, calcContainerSize, calcOffsetEdge,
  calcScalePos, AnchorType, getDistance, IClipPosInfo,
  prefixClipInfo,
  clipImageByPosition,
  distanceOfPoints,
} from './helpers';

export interface IHandleClipInfoChange {
  (clipInfo: IClipPosInfo): void;
}

let uuid = 0;
let activeUUID: number = null;

export interface IImageClipProps {
  onError?: (errCode: 'IMG_LOAD_FAIL' | '') => any;
  ratio?: number;   // 宽高比
  src?: string;     // 图片地址
  canOverClip?: boolean;  // 是否可以超过剪裁
  onChange?: (info: IClipPosInfo) => void;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number | string;
  minHeight?: number | string;
  getDataURLDelegator?: (fn: () => Promise<string>) => void;
  quality?: number; // 图片压缩质量 (0, 1] default: 1
  imageType?: 'png' | 'jpg' | 'jpeg' | 'bmp';   // 图片压缩类型 default: jpeg
  fillColor?: string;   // 截图空白区图片填充色
  delayTime?: number;
}

export interface IImageClipState {
  viewportPos: {   // 图片基准位置
    left: number; top: number; height: number; width: number;
  } | null;
  loading: boolean;
  containerHeight: number;
  backgroundSizeWidth: number;
  backgroundSizeHeight: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
  dragOffset: { x: number; y: number; };
  isDragging: boolean;
  isResizing: boolean;
  failed: boolean;
}

const isTouchScreen = 'ontouchstart' in window;

export default class ImageClip extends React.Component<IImageClipProps, IImageClipState> {
  static defaultProps = {
    onError: () => { },
  };

  $rightBottomAnchor: HTMLDivElement;
  $leftBottomAnchor: HTMLDivElement;
  $leftCenterAnchor: HTMLDivElement;
  $leftTopAnchor: HTMLDivElement;
  $rightCenterAnchor: HTMLDivElement;
  $rightTopAnchor: HTMLDivElement;
  $topCenterAnchor: HTMLDivElement;
  $bottomCenterAnchor: HTMLDivElement;
  timer: number;
  $container: HTMLDivElement = null;
  containerWidth: number;
  $viewport: HTMLDivElement = null;
  thumbOriginDistance: number;  // 双指缩放的初始距离
  moveStartPos: {   // touchstart 位置
    x: number; y: number;
    viewportOriginPos?: {
      left: number;
      top: number;
      height: number;
      width: number;
    }
  } | null;
  image!: HTMLImageElement | null;
  anchorType!: AnchorType | null;
  scaleRatio: number;
  uuid: number;

  state: IImageClipState = {
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

  movePosRange: {
    x: number[];
    y: number[];
  } | null;

  constructor(props, ctx) {
    super(props, ctx);
    this.timer = NaN;
    this.image = null;
    this.anchorType = null;
    this.uuid = uuid++;
    if (typeof props.getDataURLDelegator === 'function') {
      props.getDataURLDelegator(this.internalGetDataURL);
    }
  }

  componentDidMount() {
    this.loadImage(this.props.src);
    const anchors = [
      this.$leftTopAnchor,
      this.$leftCenterAnchor,
      this.$leftBottomAnchor,
      this.$topCenterAnchor,
      this.$bottomCenterAnchor,
      this.$rightBottomAnchor,
      this.$rightCenterAnchor,
      this.$rightTopAnchor,
    ];

    // chrome 56 之后，touch 事件若要使用 preventDefault 禁用滚动、下拉刷新，必须设置 passive: false
    if (isTouchScreen) {
      this.$viewport.addEventListener('touchstart', this.handleDragStart, { passive: false });
      // this.$viewport.addEventListener('touchmove', this.handleDragOver, { passive: false });
      // this.$viewport.addEventListener('touchend', this.handleDragEnd, { passive: false });
      anchors.forEach(dom => {
        dom.addEventListener('touchstart', this.handleResizeDragStart, { passive: false });
      });
      document.addEventListener('touchend', this.handleDragEnd, { passive: false });
      document.addEventListener('touchmove', this.handleDragOver, { passive: false });
    } else {
      this.$viewport.addEventListener('mousedown', this.handleDragStart, { passive: false });
      // this.$viewport.addEventListener('mousemove', this.handleDragOver, { passive: false });
      // this.$viewport.addEventListener('mouseup', this.handleDragEnd, { passive: false });
      anchors.forEach(dom => {
        dom.addEventListener('mousedown', this.handleResizeDragStart, { passive: false });
      });
      document.addEventListener('mouseup', this.handleDragEnd, { passive: false });
      document.addEventListener('mousemove', this.handleDragOver, { passive: false });
    }
  }

  componentWillUnmount() {
    const anchors = [
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
      // this.$viewport.removeEventListener('touchmove', this.handleDragOver);
      // this.$viewport.removeEventListener('touchend', this.handleDragEnd);
      anchors.forEach(dom => {
        dom.removeEventListener('touchstart', this.handleResizeDragStart);
      });
      document.removeEventListener('touchmove', this.handleDragOver);
      document.removeEventListener('touchend', this.handleDragEnd);
    } else {
      this.$viewport.removeEventListener('mousedown', this.handleDragStart);
      // this.$viewport.removeEventListener('mousemove', this.handleDragOver);
      // this.$viewport.removeEventListener('mouseup', this.handleDragEnd);
      anchors.forEach(dom => {
        dom.removeEventListener('mousedown', this.handleResizeDragStart);
      });
      document.removeEventListener('mouseup', this.handleDragEnd);
      document.removeEventListener('mousemove', this.handleDragOver);
    }
  }

  componentWillReceiveProps(nextProps: IImageClipProps) {
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
  }

  internalGetDataURL = async () => {
    const { left, top, height, width } = this.state.viewportPos;

    const fixedViewPort = prefixClipInfo({
      x: left,
      y: top,
      height: height,
      width: width,
    }, this.containerWidth, this.state.containerHeight);

    const clipInfo = {
      x: fixedViewPort.x * this.scaleRatio,
      y: fixedViewPort.y * this.scaleRatio,
      width: fixedViewPort.width * this.scaleRatio,
      height: fixedViewPort.height * this.scaleRatio,
    };

    return await clipImageByPosition(
      this.image,
      clipInfo.x,
      clipInfo.y,
      clipInfo.width,
      clipInfo.height,
      this.props.imageType || 'jpeg',
      this.props.quality || 1,
      this.props.canOverClip ? this.props.fillColor : null,
      this.props.canOverClip ? this.state.backgroundPositionX * this.scaleRatio : 0,
      this.props.canOverClip ? this.state.backgroundPositionY * this.scaleRatio : 0,
    );
  }

  async loadImage(src: string) {
    this.setState({
      loading: true,
    });

    try {
      this.image = await loadImage(src);
    } catch (e) {
      this.props.onError('IMG_LOAD_FAIL');
      this.setState({
        failed: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }

    if (!this.image) { return; }

    this.containerWidth = this.$container.getBoundingClientRect().width;
    const layoutInfo = calcContainerSize(
      this.props.ratio,
      this.props.canOverClip,
      this.containerWidth,
      this.image.naturalWidth,
      this.image.naturalHeight,
    );
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
  }

  clearDelayTimer() {
    clearTimeout(this.timer);
    this.timer = NaN;
    this.moveStartPos = null;
  }

  handleDragStart = e => {
    activeUUID = this.uuid;
    if (this.timer > 0) {
      this.clearDelayTimer();
    }

    // 切换到 scale 模式
    if (e.touches && e.touches.length === 2) {
      this.clearDelayTimer();
      // 记录初始指间距
      this.thumbOriginDistance = distanceOfPoints(
        e.touches[0].clientX, e.touches[0].clientY,
        e.touches[1].clientX, e.touches[1].clientY,
      );
      this.moveStartPos = {
        x: NaN,
        y: NaN,
        viewportOriginPos: {
          ...this.state.viewportPos,
        },
      };
      this.movePosRange = {
        x: [NaN, this.state.viewportPos.left + this.state.viewportPos.width / 2 - this.min.width / 2],
        y: [NaN, this.state.viewportPos.top + this.state.viewportPos.height / 2 - this.min.height / 2],
      };
      this.setState({
        isDragging: false,
        isResizing: true,
      });
      return;
    }

    const { clientX, clientY } = isTouchScreen ? e.touches[0] : e;
    this.timer = window.setTimeout(() => {
      this.setState({
        isDragging: true,
      });
      this.moveStartPos = {
        x: clientX,
        y: clientY,
      };

      this.timer = NaN;

      // 计算截图 viewport 可移动范围
      this.movePosRange = calcOffsetEdge(
        this.props.canOverClip ? 0 : this.state.backgroundPositionX,
        this.props.canOverClip ? 0 : this.state.backgroundPositionY,
        this.containerWidth,
        this.props.canOverClip ? this.state.containerHeight : this.state.backgroundSizeHeight,
        this.state.viewportPos.left,
        this.state.viewportPos.top,
        this.state.viewportPos.width,
        this.state.viewportPos.height,
        'move',
      );
    }, typeof this.props.delayTime === 'number' ? this.props.delayTime : ('ontouchstart' in window ? 150 : 0));
  }

  handleDragEnd = () => {
    if (activeUUID !== this.uuid) { return; }
    if (this.state.isResizing) {
      return this.handleResizeDragEnd();
    }

    if (this.timer > 0) {
      this.clearDelayTimer();
    }

    // 记录下次开始的位置
    this.moveStartPos = null;
    this.movePosRange = null;
    this.thumbOriginDistance = null;
    this.setState(s => {
      const nextState = { ...s };
      const { left, top, ...other } = s.viewportPos;
      nextState.dragOffset = {
        x: 0, y: 0,
      };
      nextState.isDragging = false;
      nextState.isResizing = false;
      nextState.viewportPos = {
        left: left + s.dragOffset.x,
        top: top + s.dragOffset.y,
        ...other,
      };
      return nextState;
    }, this.fireChange);
  }

  handleDragOver = e => {
    if (this.uuid !== activeUUID) { return; }
    if (this.state.isResizing) {
      return this.handleResizeDragOver(e);
    }
    if (!this.state.isDragging && !this.state.isResizing) {
      if (this.timer > 0) {
        this.clearDelayTimer();
      }
    } else if (isTouchScreen && this.state.isResizing && e.touches && e.touches.length === 2) {
      // 双指缩放
      this.handleResizeDragOver(e);
    } else {
      e.preventDefault();
      const { clientX, clientY } = isTouchScreen ? e.touches[0] : e;
      const offset = {
        x: Math.max(Math.min(clientX - this.moveStartPos.x, this.movePosRange.x[1]), this.movePosRange.x[0]),
        y: Math.max(Math.min(clientY - this.moveStartPos.y, this.movePosRange.y[1]), this.movePosRange.y[0]),
      };

      this.setState({
        dragOffset: offset,
      });
    }
  }

  handleResizeDragStart = e => {
    e.stopPropagation();
    this.anchorType = e.currentTarget.dataset.type;
    activeUUID = this.uuid;

    if (this.timer > 0) {
      this.clearDelayTimer();
    }

    const { clientX, clientY } = isTouchScreen ? e.touches[0] : e;
    this.timer = window.setTimeout(() => {
      this.setState({
        isResizing: true,
      });
      this.moveStartPos = {
        x: clientX,
        y: clientY,
        viewportOriginPos: this.state.viewportPos,
      };

      // 计算截图 anchor 可移动范围
      this.movePosRange = calcOffsetEdge(
        this.props.canOverClip ? 0 : this.state.backgroundPositionX,
        this.props.canOverClip ? 0 : this.state.backgroundPositionY,
        this.containerWidth,
        this.props.canOverClip ? this.state.containerHeight : this.state.backgroundSizeHeight,
        this.state.viewportPos.left,
        this.state.viewportPos.top,
        this.state.viewportPos.width,
        this.state.viewportPos.height,
        'scale',
        this.min.width,
        this.min.height,
        this.anchorType,
        this.props.ratio,
      );
    }, typeof this.props.delayTime === 'number' ? this.props.delayTime : ('ontouchstart' in window ? 150 : 0));
  }

  handleResizeDragEnd = () => {
    this.anchorType = null;
    if (this.timer > 0) {
      this.clearDelayTimer();
    }

    this.moveStartPos = null;
    this.movePosRange = null;

    this.setState(s => {
      const nextState = { ...s };
      nextState.dragOffset = {
        x: 0, y: 0,
      };
      nextState.isResizing = false;
      return nextState;
    }, this.fireChange);
  }

  handleResizeDragOver = e => {
    e.stopPropagation();
    if (!this.state.isResizing) {
    } else if (e.touches && e.touches.length === 2 && this.thumbOriginDistance > 0) {
      e.stopPropagation();
      e.preventDefault();
      const delta = distanceOfPoints(
        e.touches[0].clientX, e.touches[0].clientY,
        e.touches[1].clientX, e.touches[1].clientY,
      );

      // 写死 45 度角缩放
      const fixedDelta = 0.707 * (delta - this.thumbOriginDistance) / 2;

      // 记录本次距离用于下次比较
      this.thumbOriginDistance = delta;

      let x: number;
      let y: number;
      let width: number;
      let height: number;

      width = this.state.viewportPos.width + fixedDelta * 2;   // 写死 45 度角缩放
      x = this.state.viewportPos.left - fixedDelta;
      y = this.state.viewportPos.top - fixedDelta;
      height = this.state.viewportPos.height + fixedDelta * 2;

      const lastRatio = this.props.ratio ||
        this.moveStartPos.viewportOriginPos.width / this.moveStartPos.viewportOriginPos.height;
      x = Math.min(this.movePosRange.x[1], Math.max(0, x));
      y = Math.min(this.movePosRange.y[1], Math.max(0, y));
      width = Math.max(Math.min(this.containerWidth - x, width), this.min.width);
      height = Math.max(Math.min(this.state.containerHeight - y, width / lastRatio), this.min.height);
      const hBaseWidth = height * lastRatio;
      const wBaseHeight = width / lastRatio;
      this.setState({
        viewportPos: {
          left: x,
          top: y,
          width: Math.min(width, hBaseWidth),
          height: Math.min(height, wBaseHeight),
        }
      });
    } else {
      e.stopPropagation();
      e.preventDefault();
      const { clientX, clientY } = isTouchScreen ? e.touches[0] : e;
      const offset = {
        x: Math.min(Math.max(clientX - this.moveStartPos.x, this.movePosRange.x[0]), this.movePosRange.x[1]),
        y: Math.min(Math.max(clientY - this.moveStartPos.y, this.movePosRange.y[0]), this.movePosRange.y[1]),
      };

      this.setState(s => {
        const nextState = { ...s };
        const { x, y, width, height } = calcScalePos(
          this.moveStartPos.viewportOriginPos.left,
          this.moveStartPos.viewportOriginPos.top,
          this.moveStartPos.viewportOriginPos.width,
          this.moveStartPos.viewportOriginPos.height,
          offset.x,
          offset.y,
          this.anchorType,
          this.props.ratio,
        );
        nextState.viewportPos = {
          left: x, top: y, width, height,
        };
        return nextState;
      });
    }
  }

  fireChange = () => {
    if (typeof this.props.onChange === 'function') {
      const { left, top, height, width } = this.state.viewportPos;
      const fixedViewPort = prefixClipInfo({
        x: left,
        y: top,
        height: height,
        width: width,
      }, this.containerWidth, this.state.containerHeight);

      this.props.onChange({
        x: (fixedViewPort.x - this.state.backgroundPositionX) * this.scaleRatio,
        y: (fixedViewPort.y - this.state.backgroundPositionY) * this.scaleRatio,
        width: fixedViewPort.width * this.scaleRatio,
        height: fixedViewPort.height * this.scaleRatio,
        naturalHeight: this.image.naturalHeight,
        naturalWidth: this.image.naturalWidth,
      });
    }
  }

  getContainerRef = ref => {
    this.$container = ref;
    this.containerWidth = this.$container.getBoundingClientRect().width;
  }

  getViewport = ref => {
    this.$viewport = ref;
  }

  getLeftTopAnchor = ref => {
    this.$leftTopAnchor = ref;
  }

  getLeftCenterAnchor = ref => {
    this.$leftCenterAnchor = ref;
  }

  getLeftBottomAnchor = ref => {
    this.$leftBottomAnchor = ref;
  }

  getTopCenterAnchor = ref => {
    this.$topCenterAnchor = ref;
  }

  getBottomCenterAnchor = ref => {
    this.$bottomCenterAnchor = ref;
  }

  getRightTopAnchor = ref => {
    this.$rightTopAnchor = ref;
  }

  getRightCenterAnchor = ref => {
    this.$rightCenterAnchor = ref;
  }

  getRightBottomAnchor = ref => {
    this.$rightBottomAnchor = ref;
  }

  get containerStyle() {
    return {
      backgroundImage: `url(${this.props.src})`,
      height: `${this.state.containerHeight}px`,
      backgroundPosition: `${this.state.backgroundPositionX}px ${this.state.backgroundPositionY}px`,
    };
  }

  get viewportStyle() {
    const { height, width, left, top } = this.state.viewportPos;
    const { x, y } = this.state.dragOffset;
    return {
      backgroundImage: `url(${this.props.src})`,
      backgroundSize: `${this.state.backgroundSizeWidth}px ${this.state.backgroundSizeHeight}px`,
      transform: `translate(${left + (this.state.isDragging ? x : 0)}px,${top + (this.state.isDragging ? y : 0)}px)`,
      height, width,
      backgroundPosition: `${this.state.backgroundPositionX - left - (this.state.isDragging ? x : 0)}px`
        + ` ${this.state.backgroundPositionY - top - (this.state.isDragging ? y : 0)}px`,
      opacity: this.state.isDragging ? 0.7 : 1,
      display: this.state.failed || this.state.loading ? 'none' : 'block',
    };
  }

  get min() {
    let width = getDistance(this.props.minWidth || '37%', this.containerWidth, this.image.naturalWidth);
    let height = getDistance(this.props.minHeight || '37%', this.state.containerHeight, this.image.naturalHeight);
    if (this.props.ratio) {
      // 以高基准计算宽最小值
      const hBaseMinWidth = height * this.props.ratio;
      // 以宽基准计算高最小值
      const wBaseMinHeight = width / this.props.ratio;
      width = Math.min(width, hBaseMinWidth);
      height = Math.min(height, wBaseMinHeight);
    }
    return {
      width,
      height,
    };
  }

  render() {
    return (
      <div
        className="clip-container"
        ref={this.getContainerRef}
        style={this.containerStyle}
      >
        <div className="clip-container-loading" style={{ display: this.state.loading ? 'flex' : 'none' }}>图片加载中...</div>
        <div
          className={`clip-viewport${this.state.isResizing ? ' clip-resizeing' : ''}`}
          ref={this.getViewport}
          style={this.viewportStyle}
        >
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-lt" data-type="lefttop" ref={this.getLeftTopAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-lb" data-type="leftbottom" ref={this.getLeftBottomAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-rt" data-type="righttop" ref={this.getRightTopAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-rb" data-type="rightbottom" ref={this.getRightBottomAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-tm" data-type="topcenter" ref={this.getTopCenterAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-bm" data-type="bottomcenter" ref={this.getBottomCenterAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-lm" data-type="leftcenter" ref={this.getLeftCenterAnchor} />
          <div style={{ display: this.state.failed ? 'none' : 'block' }}
            className="clip-anchor clip-anchor-rm" data-type="rightcenter" ref={this.getRightCenterAnchor} />
        </div>
      </div>
    );
  }
}