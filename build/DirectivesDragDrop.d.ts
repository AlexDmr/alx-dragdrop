import { ElementRef, EventEmitter, OnInit, OnDestroy } from "@angular/core";
export interface MyTouchEvent extends TouchEvent {
}
export declare class AlxDragDrop {
    nbDragEnter: number;
    constructor();
    removeFeedbackForDragPointer(): void;
    drop(e: any): void;
    dragover(e: any): void;
    dragenter(e: any): void;
    dragleave(e: any): void;
    dragend(e: any): void;
    mousemove(e: any): void;
    mouseup(e: any): void;
    touchmove(e: any): void;
    touchend(e: any): void;
}
export declare class AlxDraggable implements OnInit, OnDestroy {
    draggedData: any;
    startDelay: number;
    startDistance: number;
    onDragStart: EventEmitter<any>;
    onDragEnd: EventEmitter<any>;
    private isBeingDragged;
    private cloneNode;
    private currentDropZone;
    private possibleDropZones;
    private dx;
    private dy;
    private ox;
    private oy;
    private tx;
    private ty;
    private idPointer;
    private root;
    constructor(el: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    onMouseDown(event: MouseEvent): void;
    onTouchStart(event: MyTouchEvent): void;
    prestart(idPointer: string, x: number, y: number): void;
    start(idPointer: string, x: number, y: number): void;
    stop(): void;
    move(x: number, y: number): this;
    deepStyle(original: Element, clone: Element): void;
    deleteClone(): void;
    getClone(): HTMLElement;
}
export declare class AlxDropzone implements OnInit, OnDestroy {
    nbDragEnter: number;
    root: HTMLElement;
    dragCSS: string;
    dragOverCSS: string;
    dragOverCSS_pointer: string;
    acceptFunction: (data: any) => boolean;
    onDropEmitter: EventEmitter<any>;
    onDragStart: EventEmitter<any>;
    onDragEnd: EventEmitter<any>;
    onDragEnter: EventEmitter<any>;
    onDragLeave: EventEmitter<any>;
    private dropCandidateofPointers;
    private pointersHover;
    constructor(el: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
    BrowserDragEnter(event: MouseEvent): void;
    BrowserDragLeave(event: MouseEvent): void;
    BrowserDrop(event: MouseEvent): void;
    drop(obj: any): void;
    checkAccept(drag: AlxDraggable | DragEvent): boolean;
    hasPointerHover(idPointer: string): boolean;
    appendPointerHover(idPointer: string): void;
    removePointerHover(idPointer: string): void;
    appendDropCandidatePointer(idPointer: string): void;
    removeDropCandidatePointer(idPointer: string): void;
}
