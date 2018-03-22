import Defer from './Defer';

export type AnchorType = 'lefttop' | 'leftcenter' | 'leftbottom'
  | 'righttop' | 'rightbottom' | 'rightcenter'
  | 'topcenter' | 'bottomcenter';

const CANVAS_ID = `_clip-photo_${Date.now().toString()}`;

/**
 * 加载图片
 *
 * @export
 * @param {string} url 图片地址
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  const defer = new Defer<HTMLImageElement>();
  img.onload = () => {
    defer.resolve(img);
  };
  img.onerror = () => {
    defer.reject(new Error('图片加载失败'));
  };
  img.src = url;

  return defer.promise;
}

let base64Canvas = null;
/**
 * 获取图片 base64
 *
 * @export
 * @param {HTMLImageElement} img
 * @returns {string}
 */
export function base64Image(img: HTMLImageElement) {
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
  const ctx = base64Canvas.getContext('2d');
  ctx.clearRect(0, 0, base64Canvas.width, base64Canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, base64Canvas.width, base64Canvas.height);
  ctx.drawImage(img, 0, 0);
  return base64Canvas.toDataURL('image/png');
}

export interface ClipImageByPositionParams {
  img: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'jpeg' | 'png' | 'jpg' | 'bmp';
  quality?: number;
  backgroundColor?: string | null;
  padLeft?: number;
  padTop?: number;
  exportType?: 'base64' | 'blob';
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
 * @param {'base64' | 'blob'} exportType 输出类型
 * @returns
 */
export async function clipImageByPosition(opts: ClipImageByPositionParams): Promise<string | Blob> {
  const defaultCfg: Partial<ClipImageByPositionParams> = {
    type: 'jpeg',
    quality: 1,
    padLeft: 0,
    padTop: 0,
    exportType: 'base64',
  };

  const options = { ...defaultCfg, ...opts };

  let canvas: HTMLCanvasElement = document.querySelector(`canvas#${CANVAS_ID}`);
  const bgColor = !options.backgroundColor ? (options.type === 'png' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255, 1)') : options.backgroundColor;
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

  return new Promise<string | Blob>((resolve, _reject) => {
    setTimeout(() => {
      const ctx = canvas.getContext('2d');
      const { naturalWidth, naturalHeight } = options.img;
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      ctx.drawImage(options.img, 0, 0);
      const imageData = ctx.getImageData(
        0, 0, naturalWidth, naturalHeight,
      );

      canvas.width = options.width;
      canvas.height = options.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, options.width, options.height);

      ctx.putImageData(
        imageData,
        -(options.x - options.padLeft), -(options.y - options.padTop),
        options.x - options.padLeft, options.y - options.padTop,
        options.width - Math.min(0, options.x - options.padLeft),
        options.height - Math.min(0, options.y - options.padTop),
      );
      if (options.exportType === 'blob') {
        canvas.toBlob(resolve, `image/${options.type}`, options.quality);
      } else {
        resolve(canvas.toDataURL(`image/${options.type}`, options.quality));
      }
    }, 16);
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
export function calcContainerSize(
  ratio: number,
  canOverClip: boolean,
  wrapperWidth: number,
  natureWidth: number,
  natureHeight: number,
): {
    viewportX: number;      // 截图位置
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
    photoImageX: number;    // 图片位置
    photoImageY: number;
    photoImageWidth: number;
    photoImageHeight: number;
    containerWidth: number; // 容器大小
    containerHeight: number;
  } {
  let viewportX: number;
  let viewportY: number;
  let viewportWidth: number;
  let viewportHeight: number;
  let photoImageX: number;
  let photoImageY: number;
  let photoImageWidth: number;
  let photoImageHeight: number;
  let containerWidth: number = wrapperWidth;
  let containerHeight: number;
  // 比较图片的高宽比
  if (canOverClip) {
    // 如果截图的高宽比大于原图的高宽比(如: 21:9 > 4:3)，且可以留白截图，则左右留白
    containerHeight = Math.min(Math.ceil(containerWidth / ratio), wrapperWidth);
    if (ratio > natureWidth / natureHeight) {
      photoImageHeight = containerHeight;
      photoImageWidth = natureWidth * photoImageHeight / natureHeight;
    } else {  // 截图的宽高比小于原图的高宽比（如：4:3 < 16:9），且可以留白截图，则上下留白
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
    photoImageWidth = containerWidth;

    // 最大化截取位置
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
      viewportWidth = ratio ? viewportHeight * ratio : containerWidth;
      viewportX = (containerWidth - viewportWidth) / 2;
    }
  }

  photoImageX = (containerWidth - photoImageWidth) / 2;
  photoImageY = (containerHeight - photoImageHeight) / 2;

  return {
    viewportX,
    viewportY,
    viewportWidth,
    viewportHeight,
    photoImageX,
    photoImageY,
    photoImageWidth,
    photoImageHeight,
    containerHeight,
    containerWidth,
  };
}

function setAngleMinRangeInternal(ratio, deltaX, deltaY, type: 'left' | 'right'): number[] {
  let x: number;
  let y: number;
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
};

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
export function calcOffsetEdge(
  containerX: number, containerY: number, containerWidth: number, containerHeight: number,
  viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number,
  type: 'move' | 'scale', minWidth?: number, minHeight?: number, anchorType?: AnchorType,
  ratio?: number | void
): {
    x: number[],
    y: number[],
  } {
  let minX: number;
  let minY: number;
  let maxX: number;
  let maxY: number;
  if (type === 'move') {
    minX = containerX - viewportX;
    minY = containerY - viewportY;
    maxX = containerX + containerWidth - (viewportX + viewportWidth);
    maxY = containerY + containerHeight - (viewportY + viewportHeight);
  } else {
    let deltaX: number;   // 锚点离边框的距离（放大方向）
    let deltaY: number;

    // 计算点击的锚点到边框的距离
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

    // 计算可移动范围的最小值
    if (anchorType.indexOf('right') !== -1) {
      minX = minWidth - viewportWidth;
    } else if (anchorType.indexOf('left') !== -1) {
      minX = -deltaX;
    }
    if (anchorType.indexOf('top') !== -1) {
      minY = -deltaY;
    } else if (anchorType.indexOf('bottom') !== -1) {
      minY = minHeight - viewportHeight;
    }

    if (anchorType.indexOf('left') !== -1 || anchorType.indexOf('center') !== -1) {
      maxX = viewportWidth - minWidth;
      maxY = viewportHeight - minHeight;
    }

    if (anchorType.indexOf('left') !== -1) {
      maxX = viewportWidth - minWidth;
    } else if (anchorType.indexOf('right') !== -1) {
      maxX = deltaX;
    }
    if (anchorType.indexOf('top') !== -1) {
      maxY = viewportHeight - minHeight;
    } else if (anchorType.indexOf('bottom') !== -1) {
      maxY = deltaY;
    }

    if (ratio) {
      if (anchorType === 'lefttop') {
        [minX, minY] = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left');
      } else if (anchorType === 'leftcenter') {
        minY = 0;
        maxY = 0;
        deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY); // 取近的
        if ((deltaX / 2) / deltaY <= ratio) {
          minX = -deltaX;
        } else {
          minX = -deltaY * 2 * ratio;
        }
      } else if (anchorType === 'leftbottom') {
        [minX, minY] = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'left');
      } else if (anchorType === 'topcenter') {
        minX = 0;
        maxX = 0;
        deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX); // 取近的
        if ((deltaX * 2) / deltaY <= ratio) {
          minY = -deltaX * 2 / ratio;
        } else {
          minY = -deltaY;
        }
      } else if (anchorType === 'bottomcenter') {
        minX = 0;
        maxX = 0;
        minY = minHeight - viewportHeight;
        deltaX = Math.min(containerWidth - (viewportWidth + viewportX), viewportX); // 取近的
        if (deltaX * 2 <= ratio * deltaY) {
          maxY = deltaX * 2 / ratio;
        } else {
          maxY = containerHeight - (viewportY + viewportHeight);
        }
      } else if (anchorType === 'righttop') {
        [maxX, maxY] = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right');
      } else if (anchorType === 'rightcenter') {
        minY = 0;
        maxY = 0;
        deltaY = Math.min(containerHeight - (viewportHeight + viewportY), viewportY); // 取近的
        if ((deltaX / 2) / deltaY <= ratio) {
          maxX = deltaX;
        } else {
          maxX = deltaY * 2 * ratio;
        }
      } else if (anchorType === 'rightbottom') {
        [maxX, maxY] = setAngleMinRangeInternal(ratio, deltaX, deltaY, 'right');
      }
    }
  }

  return {
    x: [Math.round(minX), Math.round(maxX)],
    y: [Math.round(minY), Math.round(maxY)],
  };
}

export function calcScalePos(
  viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number,
  _deltaX: number, _deltaY: number, type: AnchorType,
  ratio?: number | void,
): {
    x: number,
    y: number,
    width: number,
    height: number,
  } {
  let x: number = viewportX;
  let y: number = viewportY;
  let width: number = viewportWidth;
  let height: number = viewportHeight;
  let deltaX = _deltaX;
  let deltaY = _deltaY;
  switch (type) {
    case 'lefttop': {
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
      } else {
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
    x, y, width, height,
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
export function getDistance(l: number | string, m?: number, naturalSize?: number): number {
  if (!l) {
    return 100;
  }
  if (typeof l === 'string' && /^(([1-9]\d*)|0)(\.\d+)?\%$/.test(l)) {
    return Number(l.replace('%', '')) * m * 0.01;
  }

  return m / naturalSize * Number(l);
}

export interface IClipPosInfo extends Object { // 图片的剪裁位置 (非显示位置)
  x: number;
  y: number;
  width: number;
  height: number;
  naturalHeight?: number;
  naturalWidth?: number;
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
export function prefixClipInfo(info: IClipPosInfo, containerWidth: number, containerHeight: number): IClipPosInfo {
  const { x, y, width, height } = info;
  const _x = x < 2 ? 0 : Math.max(0, Math.floor(x));
  const _y = y < 2 ? 0 : Math.max(0, Math.floor(y));
  return {
    x: _x,
    y: _y,
    width: Math.abs(containerWidth - _x - width) < 2 ? Math.floor(containerWidth - _x) : Math.ceil(width),
    height: Math.abs(containerHeight - _y - height) < 2 ? Math.floor(containerHeight - _y) : Math.ceil(height),
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
export function distanceOfPoints(x0: number, y0: number, x1: number = 0, y1: number = 0) {
  return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}
