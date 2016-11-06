import {Directive, ElementRef, Input, HostListener, EventEmitter, Output, OnInit, OnDestroy} from "@angular/core";
import {myDoc} from "./DragDropUtils";

/* Polyfill TouchEvent */
interface MyTouchEvent extends TouchEvent {}
/*
interface ShadowRoot extends DocumentFragment {
    styleSheets     : StyleSheetList;
    innerHTML       : string;
    host            : Element;
    activeElement   : Element;
    elementFromPoint        (x : number, y : number) : Element;
    elementsFromPoint       (x : number, y : number) : Element[];
    caretPositionFromPoint  (x : number, y : number); // => CaretPosition
};

interface ElementWithShadowRoot extends HTMLElement {
    shadowRoot  : ShadowRoot;
};*/
type Pointer = {x: number, y: number};
class DragManager {
    draggingPointer     = new Map<string, Pointer>();
    draggedStructures   = new Map<string, AlxDraggable>();
    dropZones           = new Map<Element, AlxDropzone >();
    //constructor() {}
    preStartDrag( idPointer: string, dragged: AlxDraggable, x: number, y: number
                , delay: number, dist: number) : Promise<any> {
        // console.log("preStartDrag", idPointer, dragged, x, y, delay);
        this.draggingPointer  .set(idPointer, {x: x, y: y});
        return new Promise<void>( (resolve, reject) => {
            setTimeout(() => {
                let ptr   = this.draggingPointer.get(idPointer);
                let gogo  = ptr && (Math.abs(x - ptr.x) + Math.abs(y - ptr.y)) < dist;
                this.draggingPointer.delete(idPointer);
                if(gogo) {resolve();} else {reject();}
            }, Math.max(0, delay));
        }); // End of Promise
    }
    public startDrag(idPointer: string, dragged: AlxDraggable, x: number, y: number) : Map<Element, AlxDropzone> {
        // console.log("startdrag", dragged, x, y);
        this.draggedStructures.set(idPointer, dragged);
        let possibleDropZones = new Map<Element, AlxDropzone>();
        this.dropZones.forEach( dz => {
            if( dz.checkAccept(dragged) ) {
                dz.appendDropCandidatePointer( idPointer );
                possibleDropZones.set(dz.root, dz);
            }
        } );
        return possibleDropZones;
    }
    public isAssociatedToDropZone(element: Element) : boolean {
        return this.dropZones.has( element );
    }
    public registerDropZone( dropzone: AlxDropzone ) {
        this.dropZones.set(dropzone.root, dropzone);
    }
    public unregisterDropZone( dropzone: AlxDropzone ) {
        this.dropZones.delete(dropzone.root);
    }
    public pointerMove(idPointer: string, x: number, y: number) : boolean {
        let ptr = this.draggingPointer.get(idPointer);
        if(ptr) {ptr.x = x; ptr.y = y;}
        let dragged = this.draggedStructures.get(idPointer);
        if(dragged) {
            dragged.move(x, y);
        }
        return dragged !== undefined;
    }
    public pointerRelease(idPointer: string) : boolean {
        let dragged = this.draggedStructures.get(idPointer);
        if(dragged) {
            dragged.stop();
            this.draggedStructures.delete(idPointer);
            this.draggingPointer  .delete(idPointer);
        }
        return dragged !== undefined;
    }
}
let DM = new DragManager();

let dragDropInit = false;
@Directive({
    selector: "*[alx-dragdrop]"
})
export class AlxDragDrop {
    constructor() {
        if(dragDropInit) {
            console.error( "Do not create multiple instance of directive alx-dragdrop !" );
        } else {
            console.log( "AlxDragDrop enabled !");
            dragDropInit = true;
        }
    }
    @HostListener( "document: mousemove", ["$event"] ) mousemove( e ) {
        DM.pointerMove   ("mouse", e.clientX, e.clientY);
    }
    @HostListener( "document: mouseup"  , ["$event"] ) mouseup  ( e ) {
        DM.pointerRelease("mouse");
    }
    @HostListener( "document: touchmove", ["$event"] ) touchmove( e ) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            let touch:Touch = e.changedTouches.item(i);
            if (DM.pointerMove(touch.identifier.toString(), touch.clientX, touch.clientY)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }
    @HostListener( "document: touchend" , ["$event"] ) touchend ( e ) {
        for(let i=0; i<e.changedTouches.length; i++) {
            let touch : Touch = e.changedTouches.item(i);
            if( DM.pointerRelease(touch.identifier.toString()) ) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }
}

@Directive({
    selector: "*[alx-draggable]"
})
export class AlxDraggable implements OnInit, OnDestroy {
    @Input ("alx-draggable" ) draggedData : any;
    @Input ("alx-touch-delay") touchDelay : number;
    @Input ("alx-touch-distance") touchDistance: number;
    @Output("alx-drag-start") onDragStart = new EventEmitter<any>();
    @Output("alx-drag-end"  ) onDragEnd   = new EventEmitter<any>();
    private isBeingDragged                : boolean = false;
    private cloneNode                     : HTMLElement = null;
    private currentDropZone               : AlxDropzone;
    private possibleDropZones = new Map<Element, AlxDropzone>();
    private dx : number;
    private dy : number;
    private ox : number;
    private oy : number;
    private tx : number;
    private ty : number;
    private idPointer : string;
    private root : HTMLElement;
    constructor(el: ElementRef) {
        this.root = el.nativeElement;
        if(!dragDropInit) {
           console.error("You should add one alx-dragdrop attribute to your code before using alx-draggable");
        }
        //console.log( "new instance of AlxDraggable", this );
    }
    ngOnInit() {
        //
    }
    ngOnDestroy() {
        this.stop();
    }
    @HostListener("mousedown" , ["$event"]) onMouseDown (event : MouseEvent) {
        //console.log("mousedown on", this, event);
        event.preventDefault();
        event.stopPropagation();
        this.start("mouse", event.clientX, event.clientY);
    }
    @HostListener("touchstart", ["$event"]) onTouchStart(event: MyTouchEvent) {
        //console.log("touchstart on", this);
        // event.preventDefault();
        event.stopPropagation();
        for(let i=0; i<event.changedTouches.length; i++) {
            let touch : Touch = event.changedTouches.item(i);
            this.prestart(touch.identifier.toString(), touch.clientX, touch.clientY);
        }
    }
    prestart(idPointer: string, x: number, y: number) {
        DM.preStartDrag(idPointer, this, x, y, this.touchDelay || 50, this.touchDistance || 10).then(
            () => {
                this.start(idPointer, x, y);
            },
            () => {
                // console.error("skip the drag");
            }
            );
    }
    start(idPointer: string, x: number, y: number) {
        if( !this.isBeingDragged ) {
            this.isBeingDragged = true;
            this.idPointer = idPointer;
            // let bbox = this.root.getBoundingClientRect();
            this.ox = x; this.oy = y;
            this.dx = x - this.root.offsetLeft; // Math.round(bbox.left + window.pageXOffset);
            this.dy = y - this.root.offsetTop ; // Math.round(bbox.top  + window.pageYOffset);
            /*let D = document.querySelector("#debug");
            D.innerHTML = window.pageXOffset + " ; " + window.pageYOffset + "<br/>"
                        + window.scrollX + " ; " + window.scrollY + "<br/>"
                        + this.root.offsetLeft + " ; " + this.root.offsetTop + "<br/>"
                        // + bbox.left + " ; " + bbox.top
                        ;*/
            this.tx = this.root.offsetWidth ; // bbox.width ;
            this.ty = this.root.offsetHeight; // bbox.height;
            this.onDragStart.emit( this.draggedData );
            this.possibleDropZones = DM.startDrag(idPointer, this, x, y);
        }
    }
    stop() {
        this.isBeingDragged = false;
        if(this.cloneNode) {
            if(this.cloneNode.parentNode) {
                this.cloneNode.parentNode.removeChild(this.cloneNode);
            }
            this.cloneNode = null;
        }
        this.possibleDropZones.forEach( dz => {
            dz.removePointerHover           (this.idPointer);
            dz.removeDropCandidatePointer   (this.idPointer);
        } );
        this.possibleDropZones.clear();
        this.idPointer = null;
        if(this.currentDropZone) {
            this.currentDropZone.drop( this.draggedData );
        }
        this.currentDropZone = null;
        this.onDragEnd.emit( this.draggedData );
    }
    move(x: number, y: number) : this {
        let element : Element = null;
        if(this.cloneNode === null) {
            this.getClone();
        }
        if(this.cloneNode) {
            this.cloneNode.style.left = (x - this.dx) + "px";
            this.cloneNode.style.top  = (y - this.dy) + "px";
            let parent = this.cloneNode.parentElement;
            let visibility = this.cloneNode.style.visibility;
            parent.removeChild( this.cloneNode );
            this.cloneNode.style.visibility = "hidden";
            // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
            element = myDoc.elementFromPoint(x, y);

            this.cloneNode.style.visibility = visibility;
            parent.appendChild( this.cloneNode );

            let prevDropZone = this.currentDropZone;
            while(element) {
                // Check if we are on top of a dropZone
                this.currentDropZone = this.possibleDropZones.get( element );
                if(this.currentDropZone) {break;}
                element = <Element>element.parentElement;
            }
            if(prevDropZone !== this.currentDropZone) {
                if(prevDropZone) {
                    prevDropZone.removePointerHover( this.idPointer );
                }
                if(this.currentDropZone) {
                    this.currentDropZone.appendPointerHover( this.idPointer );
                }
            }
            /*this.possibleDropZones.forEach( dz => dz.removePointerHover(this.idPointer) );
            while(element) {
                // Check if we are on top of a dropZone
                this.currentDropZone = this.possibleDropZones.get( element );
                if(this.currentDropZone) {
                    this.currentDropZone.appendPointerHover( this.idPointer );
                    break;
                }
                element = <Element>element.parentElement;
            }*/
        }
        return this;
    }
    deepStyle(original: Element, clone: Element) {
        if(original instanceof HTMLElement) {
            let style = window.getComputedStyle(original);
            for (let i = 0; i < style.length; i++) {
                let att = style[i];
                (clone as HTMLElement).style[att] = style[att];
            }
            for(let i=0; i<original.children.length; i++) {
                this.deepStyle(original.children.item(i), clone.children.item(i));
            }
        }
    }
    getClone() : Node {
        if(this.cloneNode === null) {
            this.cloneNode = <HTMLElement>this.root.cloneNode(true);
            // Apply computed style :
            this.deepStyle( this.root, this.cloneNode);

            // Insert the clone on the DOM
            document.body.appendChild( this.cloneNode );
            this.cloneNode.style.position   = "absolute";
            this.cloneNode.style.zIndex     = "999";
            this.cloneNode.classList.add( "alx-cloneNode" );
        }
        return this.cloneNode;
    }
}

@Directive({ selector: "*[alx-dropzone]" })
export class AlxDropzone implements OnInit, OnDestroy {
    public root : HTMLElement;
    @Input("alx-drag-css"     ) dragCSS     : string;
    @Input("alx-drag-over-css") dragOverCSS : string;
    @Input("alx-accept-fcuntion") acceptFunction : (data: any) => boolean;
    @Output("alx-ondrop")     onDropEmitter = new EventEmitter<any>();
    @Output("alx-drag-start") onDragStart   = new EventEmitter<any>();
    @Output("alx-drag-end")   onDragEnd     = new EventEmitter<any>();
    @Output("alx-drag-enter") onDragEnter   = new EventEmitter<any>();
    @Output("alx-drag-leave") onDragLeave   = new EventEmitter<any>();

    // CSS when canDrop and startdraggable
    private dropCandidateofPointers : Array<string> = [];
    private pointersHover           : Array<string> = [];
    constructor(el: ElementRef) {
        if(!dragDropInit) {
            console.error("You should add one alx-dragdrop attribute to your code before using alx-dropzone");
        }
        this.root = el.nativeElement;
        // this.acceptFct = YES;
        DM.registerDropZone(this);
    }
    ngOnInit() {
        //
    }
    ngOnDestroy() {
        console.log( "TODO: Should implement dropzone destoy");
    }
    drop( obj ) {
        // console.log( this, "drop", obj );
        this.onDropEmitter.emit( obj );
    }
    checkAccept(drag: AlxDraggable) : boolean {
        return this.acceptFunction?( drag.draggedData ):true;
    }
    hasPointerHover(idPointer: string) {
        return this.pointersHover.indexOf(idPointer) >= 0;
    }
    appendPointerHover( idPointer: string ) {
        if( this.pointersHover.indexOf(idPointer) === -1 ) {
            this.pointersHover.push(idPointer);
            this.onDragEnter.emit( DM.draggedStructures.get(idPointer).draggedData );
            if(this.dragOverCSS) {
                this.root.classList.add( this.dragOverCSS );
            }
        }
    }
    removePointerHover( idPointer: string ) {
        let pos = this.pointersHover.indexOf(idPointer);
        if( pos >= 0 ) {
            this.pointersHover.splice(pos, 1);
            this.onDragLeave.emit( DM.draggedStructures.get(idPointer).draggedData );
            if(this.pointersHover.length === 0 && this.dragOverCSS) {
                this.root.classList.remove( this.dragOverCSS );
            }
        }
    }
    appendDropCandidatePointer( idPointer: string ) {
        //console.log( "appendDropCandidatePointer", idPointer, this );
        if( this.dropCandidateofPointers.indexOf(idPointer) === -1 ) {
            this.onDragStart.emit( DM.draggedStructures.get(idPointer).draggedData );
            this.dropCandidateofPointers.push( idPointer );
            if(this.dragCSS) {
                this.root.classList.add( this.dragCSS );
            }
        }
    }
    removeDropCandidatePointer( idPointer: string ) {
        let pos = this.dropCandidateofPointers.indexOf(idPointer);
        if( pos >= 0 ) {
            this.onDragEnd.emit( DM.draggedStructures.get(idPointer).draggedData );
            this.dropCandidateofPointers.splice(pos, 1);
            if(this.dropCandidateofPointers.length === 0 && this.dragCSS) {
                this.root.classList.remove( this.dragCSS );
            }
        }
    }
}
