var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@angular/core", "./DragDropUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const core_1 = require("@angular/core");
    const DragDropUtils_1 = require("./DragDropUtils");
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
    const dragPointerId = "dragPointer";
    class DragManager {
        constructor() {
            this.draggingPointer = new Map();
            this.draggedStructures = new Map();
            this.dropZones = new Map();
        }
        //constructor() {}
        preStartDrag(idPointer, dragged, x, y, delay, dist) {
            // console.log("preStartDrag", idPointer, dragged, x, y, delay);
            this.draggingPointer.set(idPointer, { x: x, y: y });
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let ptr = this.draggingPointer.get(idPointer);
                    let gogo = ptr && (Math.abs(x - ptr.x) + Math.abs(y - ptr.y)) < dist;
                    this.draggingPointer.delete(idPointer);
                    if (gogo) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                }, Math.max(0, delay));
            }); // End of Promise
        }
        startDrag(idPointer, dragged, x, y) {
            // console.log("startdrag", dragged, x, y);
            this.draggedStructures.set(idPointer, dragged);
            let possibleDropZones = new Map();
            this.dropZones.forEach(dz => {
                if (dz.checkAccept(dragged)) {
                    dz.appendDropCandidatePointer(idPointer);
                    possibleDropZones.set(dz.root, dz);
                }
            });
            return possibleDropZones;
        }
        isAssociatedToDropZone(element) {
            return this.dropZones.has(element);
        }
        registerDropZone(dropzone) {
            this.dropZones.set(dropzone.root, dropzone);
        }
        unregisterDropZone(dropzone) {
            this.dropZones.delete(dropzone.root);
        }
        pointerMove(idPointer, x, y) {
            let ptr = this.draggingPointer.get(idPointer);
            if (ptr) {
                ptr.x = x;
                ptr.y = y;
            }
            let dragged = this.draggedStructures.get(idPointer);
            if (dragged && dragged instanceof AlxDraggable) {
                dragged.move(x, y);
            }
            return dragged !== undefined;
        }
        pointerRelease(idPointer) {
            let dragged = this.draggedStructures.get(idPointer);
            if (dragged) {
                if (dragged instanceof AlxDraggable) {
                    dragged.stop();
                }
            }
            this.draggedStructures.delete(idPointer);
            this.draggingPointer.delete(idPointer);
            return dragged !== undefined;
        }
    }
    let DM = new DragManager();
    let dragDropInit = false;
    let AlxDragDrop = class AlxDragDrop {
        constructor() {
            this.nbDragEnter = 0;
            if (dragDropInit) {
                console.error("Do not create multiple instance of directive alx-dragdrop !");
            }
            else {
                console.log("AlxDragDrop enabled !");
                dragDropInit = true;
            }
        }
        removeFeedbackForDragPointer() {
            this.nbDragEnter = 0;
            DM.dropZones.forEach(dz => {
                dz.removePointerHover(dragPointerId);
                dz.removeDropCandidatePointer(dragPointerId);
            });
        }
        drop(e) {
            // console.log( "document drop", e );
            e.preventDefault();
            e.stopPropagation();
            this.removeFeedbackForDragPointer();
        }
        dragover(e) {
            // console.log( "document dragover", e );
            e.preventDefault();
            e.stopPropagation();
        }
        dragenter(e) {
            this.nbDragEnter++;
            if (this.nbDragEnter === 1) {
                DM.startDrag(dragPointerId, e, -1, -1);
            }
        }
        dragleave(e) {
            this.nbDragEnter--;
            if (this.nbDragEnter === 0) {
                this.removeFeedbackForDragPointer();
                DM.pointerRelease(dragPointerId);
            }
        }
        dragend(e) {
            DM.pointerRelease(dragPointerId);
            this.removeFeedbackForDragPointer();
            e.preventDefault();
        }
        mousemove(e) {
            DM.pointerMove("mouse", e.clientX, e.clientY);
        }
        mouseup(e) {
            DM.pointerRelease("mouse");
        }
        touchmove(e) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                let touch = e.changedTouches.item(i);
                if (DM.pointerMove(touch.identifier.toString(), touch.clientX, touch.clientY)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
        touchend(e) {
            for (let i = 0; i < e.changedTouches.length; i++) {
                let touch = e.changedTouches.item(i);
                if (DM.pointerRelease(touch.identifier.toString())) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
    };
    __decorate([
        core_1.HostListener("document: drop", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "drop", null);
    __decorate([
        core_1.HostListener("document: dragover", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "dragover", null);
    __decorate([
        core_1.HostListener("document: dragenter", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "dragenter", null);
    __decorate([
        core_1.HostListener("document: dragleave", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "dragleave", null);
    __decorate([
        core_1.HostListener("document: dragend", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "dragend", null);
    __decorate([
        core_1.HostListener("document: mousemove", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "mousemove", null);
    __decorate([
        core_1.HostListener("document: mouseup", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "mouseup", null);
    __decorate([
        core_1.HostListener("document: touchmove", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "touchmove", null);
    __decorate([
        core_1.HostListener("document: touchend", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDragDrop.prototype, "touchend", null);
    AlxDragDrop = __decorate([
        core_1.Directive({
            selector: "*[alx-dragdrop]"
        }),
        __metadata("design:paramtypes", [])
    ], AlxDragDrop);
    exports.AlxDragDrop = AlxDragDrop;
    let offsetElement = (element) => {
        let left = 0, top = 0;
        while (element) {
            top += element.offsetTop - element.scrollTop + element.clientTop;
            left += element.offsetLeft - element.scrollLeft + element.clientLeft;
            element = element.offsetParent;
        }
        return { left: left, top: top }; // + element.scrollTop; //window.scrollY;
    };
    let AlxDraggable = class AlxDraggable {
        constructor(el) {
            this.onDragStart = new core_1.EventEmitter();
            this.onDragEnd = new core_1.EventEmitter();
            this.isBeingDragged = false;
            this.cloneNode = null;
            this.possibleDropZones = new Map();
            this.root = el.nativeElement;
            if (!dragDropInit) {
                console.error("You should add one alx-dragdrop attribute to your code before using alx-draggable");
            }
            //console.log( "new instance of AlxDraggable", this );
        }
        ngOnInit() {
            //
        }
        ngOnDestroy() {
            // XXX No stop in case of unplug while dragging... : // this.stop();
        }
        onMouseDown(event) {
            //console.log("mousedown on", this, event);
            event.preventDefault();
            event.stopPropagation();
            this.prestart("mouse", event.clientX, event.clientY);
        }
        onTouchStart(event) {
            //console.log("touchstart on", this);
            // event.preventDefault();
            event.stopPropagation();
            for (let i = 0; i < event.changedTouches.length; i++) {
                let touch = event.changedTouches.item(i);
                this.prestart(touch.identifier.toString(), touch.clientX, touch.clientY);
            }
        }
        prestart(idPointer, x, y) {
            DM.preStartDrag(idPointer, this, x, y, this.startDelay || 100, this.startDistance || 10).then(() => {
                this.start(idPointer, x, y);
            }, () => {
                // console.error("skip the drag");
            });
        }
        start(idPointer, x, y) {
            if (!this.isBeingDragged) {
                this.isBeingDragged = true;
                this.idPointer = idPointer;
                // let bbox = this.root.getBoundingClientRect();
                let offset = offsetElement(this.root);
                this.ox = x;
                this.oy = y;
                this.dx = x - offset.left; // Math.round(bbox.left + window.pageXOffset);
                this.dy = y - offset.top; // Math.round(bbox.top  + window.pageYOffset);
                /*let D = document.querySelector("#debug");
                D.innerHTML = window.pageXOffset + " ; " + window.pageYOffset + "<br/>"
                            + window.scrollX + " ; " + window.scrollY + "<br/>"
                            + this.root.offsetLeft + " ; " + this.root.offsetTop + "<br/>"
                            // + bbox.left + " ; " + bbox.top
                            ;*/
                this.tx = this.root.offsetWidth; // bbox.width ;
                this.ty = this.root.offsetHeight; // bbox.height;
                this.getClone();
                this.cloneNode.style.left = (x - this.dx /* + window.pageXOffset */) + "px";
                this.cloneNode.style.top = (y - this.dy /* + window.pageYOffset */) + "px";
                this.onDragStart.emit(this.draggedData);
                this.possibleDropZones = DM.startDrag(idPointer, this, x, y);
            }
        }
        stop() {
            this.possibleDropZones.forEach(dz => {
                dz.removePointerHover(this.idPointer);
                dz.removeDropCandidatePointer(this.idPointer);
            });
            this.isBeingDragged = false;
            this.possibleDropZones.clear();
            this.idPointer = null;
            if (this.currentDropZone) {
                this.currentDropZone.drop(this.draggedData);
            }
            this.currentDropZone = null;
            this.onDragEnd.emit(this.draggedData);
            this.deleteClone();
        }
        move(x, y) {
            let element = null;
            if (this.cloneNode === null) {
                this.getClone();
            }
            if (this.cloneNode) {
                this.cloneNode.style.left = (x - this.dx /* + window.pageXOffset */) + "px";
                this.cloneNode.style.top = (y - this.dy /* + window.pageYOffset */) + "px";
                // let parent = this.cloneNode.parentElement;
                let visibility = this.cloneNode.style.visibility;
                // parent.removeChild( this.cloneNode );
                this.cloneNode.style.visibility = "hidden";
                let top = this.cloneNode.style.top;
                this.cloneNode.style.top = "999999999px";
                // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
                element = DragDropUtils_1.myDoc.elementFromPoint(x, y);
                this.cloneNode.style.top = top;
                this.cloneNode.style.visibility = visibility;
                // parent.appendChild( this.cloneNode );
                let prevDropZone = this.currentDropZone;
                while (element) {
                    // Check if we are on top of a dropZone
                    this.currentDropZone = this.possibleDropZones.get(element);
                    if (this.currentDropZone) {
                        break;
                    }
                    element = element.parentElement;
                }
                if (prevDropZone !== this.currentDropZone) {
                    if (prevDropZone) {
                        prevDropZone.removePointerHover(this.idPointer);
                    }
                    if (this.currentDropZone) {
                        this.currentDropZone.appendPointerHover(this.idPointer);
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
        deepStyle(original, clone) {
            if (original instanceof HTMLElement) {
                let style = window.getComputedStyle(original);
                for (let i = 0; i < style.length; i++) {
                    let att = style[i];
                    clone.style[att] = style[att];
                }
                for (let i = 0; i < original.children.length; i++) {
                    this.deepStyle(original.children.item(i), clone.children.item(i));
                }
            }
        }
        deleteClone() {
            if (this.cloneNode) {
                if (this.cloneNode.parentNode) {
                    this.cloneNode.parentNode.removeChild(this.cloneNode);
                }
                this.cloneNode = null;
            }
        }
        getClone() {
            if (this.cloneNode === null) {
                this.cloneNode = this.root.cloneNode(true);
                // Apply computed style :
                this.deepStyle(this.root, this.cloneNode);
                // Insert the clone on the DOM
                document.body.appendChild(this.cloneNode);
                this.cloneNode.style.position = "absolute";
                this.cloneNode.style.zIndex = "999";
                this.cloneNode.style.marginLeft = "0";
                this.cloneNode.style.marginTop = "0";
                this.cloneNode.style.marginRight = "0";
                this.cloneNode.style.marginBottom = "0";
                this.cloneNode.style.opacity = "";
                this.cloneNode.style.cursor = "";
                this.cloneNode.style.transform = "";
                this.cloneNode.style.transformOrigin = "";
                this.cloneNode.style.animation = "";
                this.cloneNode.style.transition = "";
                this.cloneNode.classList.add("alx-cloneNode");
                // console.log( this.cloneNode.style );
            }
            return this.cloneNode;
        }
    };
    __decorate([
        core_1.Input("alx-draggable"),
        __metadata("design:type", Object)
    ], AlxDraggable.prototype, "draggedData", void 0);
    __decorate([
        core_1.Input("alx-start-delay"),
        __metadata("design:type", Number)
    ], AlxDraggable.prototype, "startDelay", void 0);
    __decorate([
        core_1.Input("alx-start-distance"),
        __metadata("design:type", Number)
    ], AlxDraggable.prototype, "startDistance", void 0);
    __decorate([
        core_1.Output("alx-drag-start"),
        __metadata("design:type", Object)
    ], AlxDraggable.prototype, "onDragStart", void 0);
    __decorate([
        core_1.Output("alx-drag-end"),
        __metadata("design:type", Object)
    ], AlxDraggable.prototype, "onDragEnd", void 0);
    __decorate([
        core_1.HostListener("mousedown", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AlxDraggable.prototype, "onMouseDown", null);
    __decorate([
        core_1.HostListener("touchstart", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], AlxDraggable.prototype, "onTouchStart", null);
    AlxDraggable = __decorate([
        core_1.Directive({
            selector: "*[alx-draggable]"
        }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], AlxDraggable);
    exports.AlxDraggable = AlxDraggable;
    let AlxDropzone = class AlxDropzone {
        constructor(el) {
            this.nbDragEnter = 0;
            this.onDropEmitter = new core_1.EventEmitter();
            this.onDragStart = new core_1.EventEmitter();
            this.onDragEnd = new core_1.EventEmitter();
            this.onDragEnter = new core_1.EventEmitter();
            this.onDragLeave = new core_1.EventEmitter();
            // CSS when canDrop and startdraggable
            this.dropCandidateofPointers = [];
            this.pointersHover = [];
            if (!dragDropInit) {
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
            // console.log( "TODO: Should implement dropzone destoy");
            DM.unregisterDropZone(this);
        }
        BrowserDragEnter(event) {
            // console.log( "BrowserDragEnter", this, event );
            this.nbDragEnter++;
            if (this.nbDragEnter === 1) {
                this.appendPointerHover(dragPointerId);
            }
        }
        BrowserDragLeave(event) {
            // console.log( "BrowserDragEnter", this, event );
            this.nbDragEnter--;
            if (this.nbDragEnter === 0) {
                this.removePointerHover(dragPointerId);
            }
        }
        BrowserDrop(event) {
            // console.log( "BrowserDrop", this, event );
            DM.pointerRelease(dragPointerId);
            this.nbDragEnter = 0;
            this.onDropEmitter.emit(event);
        }
        drop(obj) {
            // console.log( this, "drop", obj );
            this.onDropEmitter.emit(obj);
        }
        checkAccept(drag) {
            let res;
            if (drag instanceof AlxDraggable) {
                res = this.acceptFunction ? this.acceptFunction(drag.draggedData) : true;
            }
            else {
                res = this.acceptFunction ? this.acceptFunction(drag) : true;
            }
            return res;
        }
        hasPointerHover(idPointer) {
            return this.pointersHover.indexOf(idPointer) >= 0;
        }
        appendPointerHover(idPointer) {
            if (this.pointersHover.indexOf(idPointer) === -1) {
                let dragged = DM.draggedStructures.get(idPointer);
                this.pointersHover.push(idPointer);
                if (dragged instanceof AlxDraggable) {
                    if (this.dragOverCSS_pointer) {
                        dragged.getClone().classList.add(this.dragOverCSS_pointer);
                    }
                    this.onDragEnter.emit(dragged.draggedData);
                }
                else {
                    this.onDragEnter.emit(dragged);
                }
                if (this.dragOverCSS) {
                    this.root.classList.add(this.dragOverCSS);
                }
            }
        }
        removePointerHover(idPointer) {
            let pos = this.pointersHover.indexOf(idPointer);
            if (pos >= 0) {
                let dragged = DM.draggedStructures.get(idPointer);
                this.pointersHover.splice(pos, 1);
                if (dragged instanceof AlxDraggable) {
                    if (this.dragOverCSS_pointer) {
                        dragged.getClone().classList.remove(this.dragOverCSS_pointer);
                    }
                    this.onDragLeave.emit(dragged.draggedData);
                }
                else {
                    this.onDragLeave.emit(dragged);
                }
                if (this.pointersHover.length === 0 && this.dragOverCSS) {
                    this.root.classList.remove(this.dragOverCSS);
                }
            }
        }
        appendDropCandidatePointer(idPointer) {
            // console.log( "appendDropCandidatePointer", idPointer, this );
            if (this.dropCandidateofPointers.indexOf(idPointer) === -1) {
                let dragged = DM.draggedStructures.get(idPointer);
                if (dragged instanceof AlxDraggable) {
                    this.onDragStart.emit(dragged.draggedData);
                }
                else {
                    this.onDragStart.emit(dragged);
                }
                this.dropCandidateofPointers.push(idPointer);
                if (this.dragCSS) {
                    this.root.classList.add(this.dragCSS);
                }
            }
        }
        removeDropCandidatePointer(idPointer) {
            let pos = this.dropCandidateofPointers.indexOf(idPointer);
            if (pos >= 0) {
                let dragged = DM.draggedStructures.get(idPointer);
                if (dragged instanceof AlxDraggable) {
                    this.onDragEnd.emit(dragged.draggedData);
                }
                else {
                    this.onDragEnd.emit(dragged);
                }
                this.dropCandidateofPointers.splice(pos, 1);
                if (this.dropCandidateofPointers.length === 0 && this.dragCSS) {
                    this.root.classList.remove(this.dragCSS);
                }
            }
        }
    };
    __decorate([
        core_1.Input("alx-drag-css"),
        __metadata("design:type", String)
    ], AlxDropzone.prototype, "dragCSS", void 0);
    __decorate([
        core_1.Input("alx-drag-over-css"),
        __metadata("design:type", String)
    ], AlxDropzone.prototype, "dragOverCSS", void 0);
    __decorate([
        core_1.Input("alx-drag-over-css-for-draggable"),
        __metadata("design:type", String)
    ], AlxDropzone.prototype, "dragOverCSS_pointer", void 0);
    __decorate([
        core_1.Input("alx-accept-function"),
        __metadata("design:type", Function)
    ], AlxDropzone.prototype, "acceptFunction", void 0);
    __decorate([
        core_1.Output("alx-ondrop"),
        __metadata("design:type", Object)
    ], AlxDropzone.prototype, "onDropEmitter", void 0);
    __decorate([
        core_1.Output("alx-drag-start"),
        __metadata("design:type", Object)
    ], AlxDropzone.prototype, "onDragStart", void 0);
    __decorate([
        core_1.Output("alx-drag-end"),
        __metadata("design:type", Object)
    ], AlxDropzone.prototype, "onDragEnd", void 0);
    __decorate([
        core_1.Output("alx-drag-enter"),
        __metadata("design:type", Object)
    ], AlxDropzone.prototype, "onDragEnter", void 0);
    __decorate([
        core_1.Output("alx-drag-leave"),
        __metadata("design:type", Object)
    ], AlxDropzone.prototype, "onDragLeave", void 0);
    __decorate([
        core_1.HostListener("dragenter", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AlxDropzone.prototype, "BrowserDragEnter", null);
    __decorate([
        core_1.HostListener("dragleave", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AlxDropzone.prototype, "BrowserDragLeave", null);
    __decorate([
        core_1.HostListener("drop", ["$event"]),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], AlxDropzone.prototype, "BrowserDrop", null);
    AlxDropzone = __decorate([
        core_1.Directive({ selector: "*[alx-dropzone]" }),
        __metadata("design:paramtypes", [core_1.ElementRef])
    ], AlxDropzone);
    exports.AlxDropzone = AlxDropzone;
});
//# sourceMappingURL=DirectivesDragDrop.js.map