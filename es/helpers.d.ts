export declare type AnchorType = 'lefttop' | 'leftcenter' | 'leftbottom' | 'righttop' | 'rightbottom' | 'rightcenter' | 'topcenter' | 'bottomcenter';
export declare function loadImage(url: string): Promise<HTMLImageElement>;
export declare function base64Image(img: HTMLImageElement): any;
export declare function clipImageByPosition(img: HTMLImageElement, x: number, y: number, width: number, height: number, type?: 'jpeg' | 'png' | 'jpg' | 'bmp', quality?: number, backgroundColor?: string | null, padLeft?: number, padTop?: number): Promise<string>;
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
export declare function getDistance(l: number | string, m?: number, naturalSize?: number): number;
export interface IClipPosInfo extends Object {
    x: number;
    y: number;
    width: number;
    height: number;
    naturalHeight?: number;
    naturalWidth?: number;
}
export declare function prefixClipInfo(info: IClipPosInfo, containerWidth: number, containerHeight: number): IClipPosInfo;
export declare function distanceOfPoints(x0: number, y0: number, x1?: number, y1?: number): number;
