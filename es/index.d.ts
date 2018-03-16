/// <reference types="react" />
import * as React from 'react';
import { AnchorType, IClipPosInfo } from './helpers';
import './index.less';
export interface IHandleClipInfoChange {
    (clipInfo: IClipPosInfo): void;
}
export interface IImageClipProps {
    onError?: (errCode: 'IMG_LOAD_FAIL' | '') => any;
    ratio?: number;
    src?: string;
    canOverClip?: boolean;
    onChange?: (info: IClipPosInfo) => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    minWidth?: number | string;
    minHeight?: number | string;
    getDataURLDelegator?: (fn: () => Promise<string>) => void;
    quality?: number;
    imageType?: 'png' | 'jpg' | 'jpeg' | 'bmp';
    fillColor?: string;
    delayTime?: number;
}
export interface IImageClipState {
    viewportPos: {
        left: number;
        top: number;
        height: number;
        width: number;
    } | null;
    loading: boolean;
    containerHeight: number;
    backgroundSizeWidth: number;
    backgroundSizeHeight: number;
    backgroundPositionX: number;
    backgroundPositionY: number;
    dragOffset: {
        x: number;
        y: number;
    };
    isDragging: boolean;
    isResizing: boolean;
    failed: boolean;
}
export default class ImageClip extends React.Component<IImageClipProps, IImageClipState> {
    static defaultProps: {
        onError: () => void;
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
    $container: HTMLDivElement;
    containerWidth: number;
    $viewport: HTMLDivElement;
    thumbOriginDistance: number;
    moveStartPos: {
        x: number;
        y: number;
        viewportOriginPos?: {
            left: number;
            top: number;
            height: number;
            width: number;
        };
    } | null;
    image: HTMLImageElement | null;
    anchorType: AnchorType | null;
    scaleRatio: number;
    uuid: number;
    state: IImageClipState;
    movePosRange: {
        x: number[];
        y: number[];
    } | null;
    constructor(props: any, ctx: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentWillReceiveProps(nextProps: IImageClipProps): void;
    internalGetDataURL: () => Promise<string>;
    loadImage(src: string): Promise<void>;
    clearDelayTimer(): void;
    handleDragStart: (e: any) => void;
    handleDragEnd: () => void;
    handleDragOver: (e: any) => void;
    handleResizeDragStart: (e: any) => void;
    handleResizeDragEnd: () => void;
    handleResizeDragOver: (e: any) => void;
    fireChange: () => void;
    getContainerRef: (ref: any) => void;
    getViewport: (ref: any) => void;
    getLeftTopAnchor: (ref: any) => void;
    getLeftCenterAnchor: (ref: any) => void;
    getLeftBottomAnchor: (ref: any) => void;
    getTopCenterAnchor: (ref: any) => void;
    getBottomCenterAnchor: (ref: any) => void;
    getRightTopAnchor: (ref: any) => void;
    getRightCenterAnchor: (ref: any) => void;
    getRightBottomAnchor: (ref: any) => void;
    readonly containerStyle: {
        backgroundImage: string;
        height: string;
        backgroundPosition: string;
    };
    readonly viewportStyle: {
        backgroundImage: string;
        backgroundSize: string;
        transform: string;
        height: number;
        width: number;
        backgroundPosition: string;
        opacity: number;
        display: string;
    };
    readonly min: {
        width: number;
        height: number;
    };
    render(): JSX.Element;
}
