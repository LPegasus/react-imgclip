export declare type AnchorType = 'lefttop' | 'leftcenter' | 'leftbottom' | 'righttop' | 'rightbottom' | 'rightcenter' | 'topcenter' | 'bottomcenter';
/**
 * 加载图片
 *
 * @export
 * @param {string} url 图片地址
 * @returns {Promise<HTMLImageElement>}
 */
export declare function loadImage(url: string): Promise<HTMLImageElement>;
/**
 * 获取图片 base64
 *
 * @export
 * @param {HTMLImageElement} img
 * @returns {string}
 */
export declare function base64Image(img: HTMLImageElement): any;
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
export declare function clipImageByPosition(img: HTMLImageElement, x: number, y: number, width: number, height: number, type?: 'jpeg' | 'png' | 'jpg' | 'bmp', quality?: number, backgroundColor?: string | null, padLeft?: number, padTop?: number): Promise<string>;
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
export declare function calcContainerSize(ratio: number, canOverClip: boolean, wrapperWidth: number, natureWidth: number, natureHeight: number): {
    viewportX: number;
    viewportY: number;
    viewportWidth: number;
    viewportHeight: number;
    photoImageX: number;
    photoImageY: number;
    photoImageWidth: number;
    photoImageHeight: number;
    containerWidth: number;
    containerHeight: number;
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
export declare function calcOffsetEdge(containerX: number, containerY: number, containerWidth: number, containerHeight: number, viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number, type: 'move' | 'scale', minWidth?: number, minHeight?: number, anchorType?: AnchorType, ratio?: number | void): {
    x: number[];
    y: number[];
};
export declare function calcScalePos(viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number, _deltaX: number, _deltaY: number, type: AnchorType, ratio?: number | void): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * 计算长度
 *
 * @export
 * @param {(number | string)} l 基于 px 的长度或者百分比
 * @param {number} m 当 l 为百分比时必须传入的基准值
 * @param {number} naturalSize 相对原始图片计算
 * @returns {number}
 */
export declare function getDistance(l: number | string, m?: number, naturalSize?: number): number;
export interface IClipPosInfo extends Object {
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
export declare function prefixClipInfo(info: IClipPosInfo, containerWidth: number, containerHeight: number): IClipPosInfo;
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
export declare function distanceOfPoints(x0: number, y0: number, x1?: number, y1?: number): number;
