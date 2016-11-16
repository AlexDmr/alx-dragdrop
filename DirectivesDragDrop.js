System.register(["@angular/core", "./DragDropUtils"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, DragDropUtils_1;
    var dragPointerId, DragManager, DM, dragDropInit, AlxDragDrop, offsetElement, AlxDraggable, AlxDropzone;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (DragDropUtils_1_1) {
                DragDropUtils_1 = DragDropUtils_1_1;
            }],
        execute: function() {
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
            dragPointerId = "dragPointer";
            DragManager = class DragManager {
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
                        this.draggedStructures.delete(idPointer);
                        this.draggingPointer.delete(idPointer);
                    }
                    return dragged !== undefined;
                }
            };
            DM = new DragManager();
            dragDropInit = false;
            AlxDragDrop = class AlxDragDrop {
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
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "drop", null);
            __decorate([
                core_1.HostListener("document: dragover", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "dragover", null);
            __decorate([
                core_1.HostListener("document: dragenter", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "dragenter", null);
            __decorate([
                core_1.HostListener("document: dragleave", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "dragleave", null);
            __decorate([
                core_1.HostListener("document: dragend", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "dragend", null);
            __decorate([
                core_1.HostListener("document: mousemove", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "mousemove", null);
            __decorate([
                core_1.HostListener("document: mouseup", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "mouseup", null);
            __decorate([
                core_1.HostListener("document: touchmove", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "touchmove", null);
            __decorate([
                core_1.HostListener("document: touchend", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDragDrop.prototype, "touchend", null);
            AlxDragDrop = __decorate([
                core_1.Directive({
                    selector: "*[alx-dragdrop]"
                }), 
                __metadata('design:paramtypes', [])
            ], AlxDragDrop);
            exports_1("AlxDragDrop", AlxDragDrop);
            offsetElement = (element) => {
                let left = 0, top = 0;
                while (element) {
                    top += element.offsetTop - element.scrollTop + element.clientTop;
                    left += element.offsetLeft - element.scrollLeft + element.clientLeft;
                    element = element.offsetParent;
                }
                return { left: left, top: top }; // + element.scrollTop; //window.scrollY;
            };
            AlxDraggable = class AlxDraggable {
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
                    this.stop();
                }
                onMouseDown(event) {
                    //console.log("mousedown on", this, event);
                    event.preventDefault();
                    event.stopPropagation();
                    this.start("mouse", event.clientX, event.clientY);
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
                    DM.preStartDrag(idPointer, this, x, y, this.touchDelay || 50, this.touchDistance || 10).then(() => {
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
                        this.cloneNode.style.left = (x - this.dx + window.pageXOffset) + "px";
                        this.cloneNode.style.top = (y - this.dy + window.pageYOffset) + "px";
                        let parent = this.cloneNode.parentElement;
                        let visibility = this.cloneNode.style.visibility;
                        parent.removeChild(this.cloneNode);
                        this.cloneNode.style.visibility = "hidden";
                        // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
                        element = DragDropUtils_1.myDoc.elementFromPoint(x, y);
                        this.cloneNode.style.visibility = visibility;
                        parent.appendChild(this.cloneNode);
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
                        this.cloneNode.classList.add("alx-cloneNode");
                    }
                    return this.cloneNode;
                }
            };
            __decorate([
                core_1.Input("alx-draggable"), 
                __metadata('design:type', Object)
            ], AlxDraggable.prototype, "draggedData", void 0);
            __decorate([
                core_1.Input("alx-touch-delay"), 
                __metadata('design:type', Number)
            ], AlxDraggable.prototype, "touchDelay", void 0);
            __decorate([
                core_1.Input("alx-touch-distance"), 
                __metadata('design:type', Number)
            ], AlxDraggable.prototype, "touchDistance", void 0);
            __decorate([
                core_1.Output("alx-drag-start"), 
                __metadata('design:type', Object)
            ], AlxDraggable.prototype, "onDragStart", void 0);
            __decorate([
                core_1.Output("alx-drag-end"), 
                __metadata('design:type', Object)
            ], AlxDraggable.prototype, "onDragEnd", void 0);
            __decorate([
                core_1.HostListener("mousedown", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [MouseEvent]), 
                __metadata('design:returntype', void 0)
            ], AlxDraggable.prototype, "onMouseDown", null);
            __decorate([
                core_1.HostListener("touchstart", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [Object]), 
                __metadata('design:returntype', void 0)
            ], AlxDraggable.prototype, "onTouchStart", null);
            AlxDraggable = __decorate([
                core_1.Directive({
                    selector: "*[alx-draggable]"
                }), 
                __metadata('design:paramtypes', [core_1.ElementRef])
            ], AlxDraggable);
            exports_1("AlxDraggable", AlxDraggable);
            AlxDropzone = class AlxDropzone {
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
                    console.log("TODO: Should implement dropzone destoy");
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
                    console.log("appendDropCandidatePointer", idPointer, this);
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
                __metadata('design:type', String)
            ], AlxDropzone.prototype, "dragCSS", void 0);
            __decorate([
                core_1.Input("alx-drag-over-css"), 
                __metadata('design:type', String)
            ], AlxDropzone.prototype, "dragOverCSS", void 0);
            __decorate([
                core_1.Input("alx-drag-over-css-for-draggable"), 
                __metadata('design:type', String)
            ], AlxDropzone.prototype, "dragOverCSS_pointer", void 0);
            __decorate([
                core_1.Input("alx-accept-function"), 
                __metadata('design:type', Function)
            ], AlxDropzone.prototype, "acceptFunction", void 0);
            __decorate([
                core_1.Output("alx-ondrop"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDropEmitter", void 0);
            __decorate([
                core_1.Output("alx-drag-start"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDragStart", void 0);
            __decorate([
                core_1.Output("alx-drag-end"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDragEnd", void 0);
            __decorate([
                core_1.Output("alx-drag-enter"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDragEnter", void 0);
            __decorate([
                core_1.Output("alx-drag-leave"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDragLeave", void 0);
            __decorate([
                core_1.HostListener("dragenter", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [MouseEvent]), 
                __metadata('design:returntype', void 0)
            ], AlxDropzone.prototype, "BrowserDragEnter", null);
            __decorate([
                core_1.HostListener("dragleave", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [MouseEvent]), 
                __metadata('design:returntype', void 0)
            ], AlxDropzone.prototype, "BrowserDragLeave", null);
            __decorate([
                core_1.HostListener("drop", ["$event"]), 
                __metadata('design:type', Function), 
                __metadata('design:paramtypes', [MouseEvent]), 
                __metadata('design:returntype', void 0)
            ], AlxDropzone.prototype, "BrowserDrop", null);
            AlxDropzone = __decorate([
                core_1.Directive({ selector: "*[alx-dropzone]" }), 
                __metadata('design:paramtypes', [core_1.ElementRef])
            ], AlxDropzone);
            exports_1("AlxDropzone", AlxDropzone);
        }
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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dkM7Z0JBQUMsbUJBQVksQ0FBQyxNQUFNLEVBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7OzswREFBQTtZQTlDdEM7Z0JBQUMsZ0JBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDOzsyQkFBQTtZQUMzQyxxQ0FvSUMsQ0FBQSIsImZpbGUiOiJEaXJlY3RpdmVzRHJhZ0Ryb3AuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIEhvc3RMaXN0ZW5lciwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95fSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge215RG9jfSBmcm9tIFwiLi9EcmFnRHJvcFV0aWxzXCI7XHJcblxyXG4vKiBQb2x5ZmlsbCBUb3VjaEV2ZW50ICovXHJcbmludGVyZmFjZSBNeVRvdWNoRXZlbnQgZXh0ZW5kcyBUb3VjaEV2ZW50IHt9XHJcbi8qXHJcbmludGVyZmFjZSBTaGFkb3dSb290IGV4dGVuZHMgRG9jdW1lbnRGcmFnbWVudCB7XHJcbiAgICBzdHlsZVNoZWV0cyAgICAgOiBTdHlsZVNoZWV0TGlzdDtcclxuICAgIGlubmVySFRNTCAgICAgICA6IHN0cmluZztcclxuICAgIGhvc3QgICAgICAgICAgICA6IEVsZW1lbnQ7XHJcbiAgICBhY3RpdmVFbGVtZW50ICAgOiBFbGVtZW50O1xyXG4gICAgZWxlbWVudEZyb21Qb2ludCAgICAgICAgKHggOiBudW1iZXIsIHkgOiBudW1iZXIpIDogRWxlbWVudDtcclxuICAgIGVsZW1lbnRzRnJvbVBvaW50ICAgICAgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKSA6IEVsZW1lbnRbXTtcclxuICAgIGNhcmV0UG9zaXRpb25Gcm9tUG9pbnQgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKTsgLy8gPT4gQ2FyZXRQb3NpdGlvblxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEVsZW1lbnRXaXRoU2hhZG93Um9vdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIHNoYWRvd1Jvb3QgIDogU2hhZG93Um9vdDtcclxufTsqL1xyXG5jb25zdCBkcmFnUG9pbnRlcklkID0gXCJkcmFnUG9pbnRlclwiO1xyXG50eXBlIFBvaW50ZXIgPSB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xyXG5jbGFzcyBEcmFnTWFuYWdlciB7XHJcbiAgICBkcmFnZ2luZ1BvaW50ZXIgICAgID0gbmV3IE1hcDxzdHJpbmcsIFBvaW50ZXI+KCk7XHJcbiAgICBkcmFnZ2VkU3RydWN0dXJlcyAgID0gbmV3IE1hcDxzdHJpbmcsIEFseERyYWdnYWJsZSB8IERyYWdFdmVudD4oKTtcclxuICAgIGRyb3Bab25lcyAgICAgICAgICAgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lID4oKTtcclxuICAgIC8vY29uc3RydWN0b3IoKSB7fVxyXG4gICAgcHJlU3RhcnREcmFnKCBpZFBvaW50ZXI6IHN0cmluZywgZHJhZ2dlZDogQWx4RHJhZ2dhYmxlLCB4OiBudW1iZXIsIHk6IG51bWJlclxyXG4gICAgICAgICAgICAgICAgLCBkZWxheTogbnVtYmVyLCBkaXN0OiBudW1iZXIpIDogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInByZVN0YXJ0RHJhZ1wiLCBpZFBvaW50ZXIsIGRyYWdnZWQsIHgsIHksIGRlbGF5KTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlciAgLnNldChpZFBvaW50ZXIsIHt4OiB4LCB5OiB5fSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHB0ciAgID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ29nbyAgPSBwdHIgJiYgKE1hdGguYWJzKHggLSBwdHIueCkgKyBNYXRoLmFicyh5IC0gcHRyLnkpKSA8IGRpc3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlci5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgICAgIGlmKGdvZ28pIHtyZXNvbHZlKCk7fSBlbHNlIHtyZWplY3QoKTt9XHJcbiAgICAgICAgICAgIH0sIE1hdGgubWF4KDAsIGRlbGF5KSk7XHJcbiAgICAgICAgfSk7IC8vIEVuZCBvZiBQcm9taXNlXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc3RhcnREcmFnKGlkUG9pbnRlcjogc3RyaW5nLCBkcmFnZ2VkOiBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQsIHg6IG51bWJlciwgeTogbnVtYmVyKSA6IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnRkcmFnXCIsIGRyYWdnZWQsIHgsIHkpO1xyXG4gICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuc2V0KGlkUG9pbnRlciwgZHJhZ2dlZCk7XHJcbiAgICAgICAgbGV0IHBvc3NpYmxlRHJvcFpvbmVzID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4oKTtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGlmKCBkei5jaGVja0FjY2VwdChkcmFnZ2VkKSApIHtcclxuICAgICAgICAgICAgICAgIGR6LmFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRHJvcFpvbmVzLnNldChkei5yb290LCBkeik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRHJvcFpvbmVzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzQXNzb2NpYXRlZFRvRHJvcFpvbmUoZWxlbWVudDogRWxlbWVudCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcm9wWm9uZXMuaGFzKCBlbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0ZXJEcm9wWm9uZSggZHJvcHpvbmU6IEFseERyb3B6b25lICkge1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLnNldChkcm9wem9uZS5yb290LCBkcm9wem9uZSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdW5yZWdpc3RlckRyb3Bab25lKCBkcm9wem9uZTogQWx4RHJvcHpvbmUgKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuZGVsZXRlKGRyb3B6b25lLnJvb3QpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvaW50ZXJNb3ZlKGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcHRyID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYocHRyKSB7cHRyLnggPSB4OyBwdHIueSA9IHk7fVxyXG4gICAgICAgIGxldCBkcmFnZ2VkID0gdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihkcmFnZ2VkICYmIGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgZHJhZ2dlZC5tb3ZlKHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZHJhZ2dlZCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvaW50ZXJSZWxlYXNlKGlkUG9pbnRlcjogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBkcmFnZ2VkID0gdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihkcmFnZ2VkKSB7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnZWQuc3RvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQb2ludGVyICAuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkcmFnZ2VkICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxubGV0IERNID0gbmV3IERyYWdNYW5hZ2VyKCk7XHJcblxyXG5sZXQgZHJhZ0Ryb3BJbml0ID0gZmFsc2U7XHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6IFwiKlthbHgtZHJhZ2Ryb3BdXCJcclxufSlcclxuZXhwb3J0IGNsYXNzIEFseERyYWdEcm9wIHtcclxuICAgIG5iRHJhZ0VudGVyID0gMDtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGlmKGRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCBcIkRvIG5vdCBjcmVhdGUgbXVsdGlwbGUgaW5zdGFuY2Ugb2YgZGlyZWN0aXZlIGFseC1kcmFnZHJvcCAhXCIgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyggXCJBbHhEcmFnRHJvcCBlbmFibGVkICFcIik7XHJcbiAgICAgICAgICAgIGRyYWdEcm9wSW5pdCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpIHtcclxuICAgICAgICB0aGlzLm5iRHJhZ0VudGVyID0gMDtcclxuICAgICAgICBETS5kcm9wWm9uZXMuZm9yRWFjaCggZHogPT4ge1xyXG4gICAgICAgICAgICBkei5yZW1vdmVQb2ludGVySG92ZXIgICAgICAgICAgIChkcmFnUG9pbnRlcklkKTtcclxuICAgICAgICAgICAgZHoucmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIgICAoZHJhZ1BvaW50ZXJJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcm9wXCIsIFtcIiRldmVudFwiXSApIGRyb3AoIGUgKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiZG9jdW1lbnQgZHJvcFwiLCBlICk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGZWVkYmFja0ZvckRyYWdQb2ludGVyKCk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcmFnb3ZlclwiLCBbXCIkZXZlbnRcIl0gKSBkcmFnb3ZlciggZSApIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJkb2N1bWVudCBkcmFnb3ZlclwiLCBlICk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcmFnZW50ZXJcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ2VudGVyKCBlICkge1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXIrKztcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAxKSB7XHJcbiAgICAgICAgICAgIERNLnN0YXJ0RHJhZyhkcmFnUG9pbnRlcklkLCBlLCAtMSwgLTEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyYWdsZWF2ZVwiLCBbXCIkZXZlbnRcIl0gKSBkcmFnbGVhdmUoIGUgKSB7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlci0tO1xyXG4gICAgICAgIGlmKHRoaXMubmJEcmFnRW50ZXIgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGZWVkYmFja0ZvckRyYWdQb2ludGVyKCk7XHJcbiAgICAgICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKCBkcmFnUG9pbnRlcklkICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ2VuZFwiLCBbXCIkZXZlbnRcIl0gKSBkcmFnZW5kKCBlICkge1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKCBkcmFnUG9pbnRlcklkICk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGZWVkYmFja0ZvckRyYWdQb2ludGVyKCk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogbW91c2Vtb3ZlXCIsIFtcIiRldmVudFwiXSApIG1vdXNlbW92ZSggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyTW92ZSAgIChcIm1vdXNlXCIsIGUuY2xpZW50WCwgZS5jbGllbnRZKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IG1vdXNldXBcIiAgLCBbXCIkZXZlbnRcIl0gKSBtb3VzZXVwICAoIGUgKSB7XHJcbiAgICAgICAgRE0ucG9pbnRlclJlbGVhc2UoXCJtb3VzZVwiKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IHRvdWNobW92ZVwiLCBbXCIkZXZlbnRcIl0gKSB0b3VjaG1vdmUoIGUgKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaDpUb3VjaCA9IGUuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgaWYgKERNLnBvaW50ZXJNb3ZlKHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSkpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiB0b3VjaGVuZFwiICwgW1wiJGV2ZW50XCJdICkgdG91Y2hlbmQgKCBlICkge1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoIDogVG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmKCBETS5wb2ludGVyUmVsZWFzZSh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCkpICkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IG9mZnNldEVsZW1lbnQgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpIDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9ID0+IHtcclxuICAgIGxldCBsZWZ0ID0gMCwgdG9wID0gMDtcclxuICAgIHdoaWxlIChlbGVtZW50KSB7XHJcbiAgICAgICAgdG9wICArPSBlbGVtZW50Lm9mZnNldFRvcCAgLSBlbGVtZW50LnNjcm9sbFRvcCAgKyBlbGVtZW50LmNsaWVudFRvcDtcclxuICAgICAgICBsZWZ0ICs9IGVsZW1lbnQub2Zmc2V0TGVmdCAtIGVsZW1lbnQuc2Nyb2xsTGVmdCArIGVsZW1lbnQuY2xpZW50TGVmdDtcclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge2xlZnQ6IGxlZnQsIHRvcDogdG9wfTsgLy8gKyBlbGVtZW50LnNjcm9sbFRvcDsgLy93aW5kb3cuc2Nyb2xsWTtcclxufTtcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6IFwiKlthbHgtZHJhZ2dhYmxlXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHhEcmFnZ2FibGUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgICBASW5wdXQgKFwiYWx4LWRyYWdnYWJsZVwiICkgZHJhZ2dlZERhdGEgOiBhbnk7XHJcbiAgICBASW5wdXQgKFwiYWx4LXRvdWNoLWRlbGF5XCIpIHRvdWNoRGVsYXkgOiBudW1iZXI7XHJcbiAgICBASW5wdXQgKFwiYWx4LXRvdWNoLWRpc3RhbmNlXCIpIHRvdWNoRGlzdGFuY2U6IG51bWJlcjtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1zdGFydFwiKSBvbkRyYWdTdGFydCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVuZFwiICApIG9uRHJhZ0VuZCAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBwcml2YXRlIGlzQmVpbmdEcmFnZ2VkICAgICAgICAgICAgICAgIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBjbG9uZU5vZGUgICAgICAgICAgICAgICAgICAgICA6IEhUTUxFbGVtZW50ID0gbnVsbDtcclxuICAgIHByaXZhdGUgY3VycmVudERyb3Bab25lICAgICAgICAgICAgICAgOiBBbHhEcm9wem9uZTtcclxuICAgIHByaXZhdGUgcG9zc2libGVEcm9wWm9uZXMgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lPigpO1xyXG4gICAgcHJpdmF0ZSBkeCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZHkgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG94IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBveSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR5IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBpZFBvaW50ZXIgOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHJvb3QgOiBIVE1MRWxlbWVudDtcclxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBpZighZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgY29uc29sZS5lcnJvcihcIllvdSBzaG91bGQgYWRkIG9uZSBhbHgtZHJhZ2Ryb3AgYXR0cmlidXRlIHRvIHlvdXIgY29kZSBiZWZvcmUgdXNpbmcgYWx4LWRyYWdnYWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyggXCJuZXcgaW5zdGFuY2Ugb2YgQWx4RHJhZ2dhYmxlXCIsIHRoaXMgKTtcclxuICAgIH1cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJtb3VzZWRvd25cIiAsIFtcIiRldmVudFwiXSkgb25Nb3VzZURvd24gKGV2ZW50IDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJtb3VzZWRvd24gb25cIiwgdGhpcywgZXZlbnQpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5zdGFydChcIm1vdXNlXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgW1wiJGV2ZW50XCJdKSBvblRvdWNoU3RhcnQoZXZlbnQ6IE15VG91Y2hFdmVudCkge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ0b3VjaHN0YXJ0IG9uXCIsIHRoaXMpO1xyXG4gICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8ZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoIDogVG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICB0aGlzLnByZXN0YXJ0KHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJlc3RhcnQoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgRE0ucHJlU3RhcnREcmFnKGlkUG9pbnRlciwgdGhpcywgeCwgeSwgdGhpcy50b3VjaERlbGF5IHx8IDUwLCB0aGlzLnRvdWNoRGlzdGFuY2UgfHwgMTApLnRoZW4oXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQoaWRQb2ludGVyLCB4LCB5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihcInNraXAgdGhlIGRyYWdcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuICAgIHN0YXJ0KGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc0JlaW5nRHJhZ2dlZCApIHtcclxuICAgICAgICAgICAgdGhpcy5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaWRQb2ludGVyID0gaWRQb2ludGVyO1xyXG4gICAgICAgICAgICAvLyBsZXQgYmJveCA9IHRoaXMucm9vdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IG9mZnNldEVsZW1lbnQodGhpcy5yb290KTtcclxuICAgICAgICAgICAgdGhpcy5veCA9IHg7IHRoaXMub3kgPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmR4ID0geCAtIG9mZnNldC5sZWZ0OyAvLyBNYXRoLnJvdW5kKGJib3gubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHkgPSB5IC0gb2Zmc2V0LnRvcCA7IC8vIE1hdGgucm91bmQoYmJveC50b3AgICsgd2luZG93LnBhZ2VZT2Zmc2V0KTtcclxuICAgICAgICAgICAgLypsZXQgRCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVidWdcIik7XHJcbiAgICAgICAgICAgIEQuaW5uZXJIVE1MID0gd2luZG93LnBhZ2VYT2Zmc2V0ICsgXCIgOyBcIiArIHdpbmRvdy5wYWdlWU9mZnNldCArIFwiPGJyLz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIHdpbmRvdy5zY3JvbGxYICsgXCIgOyBcIiArIHdpbmRvdy5zY3JvbGxZICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5yb290Lm9mZnNldExlZnQgKyBcIiA7IFwiICsgdGhpcy5yb290Lm9mZnNldFRvcCArIFwiPGJyLz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyArIGJib3gubGVmdCArIFwiIDsgXCIgKyBiYm94LnRvcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA7Ki9cclxuICAgICAgICAgICAgdGhpcy50eCA9IHRoaXMucm9vdC5vZmZzZXRXaWR0aCA7IC8vIGJib3gud2lkdGggO1xyXG4gICAgICAgICAgICB0aGlzLnR5ID0gdGhpcy5yb290Lm9mZnNldEhlaWdodDsgLy8gYmJveC5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldENsb25lKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzID0gRE0uc3RhcnREcmFnKGlkUG9pbnRlciwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IHtcclxuICAgICAgICAgICAgZHoucmVtb3ZlUG9pbnRlckhvdmVyICAgICAgICAgICAodGhpcy5pZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBkei5yZW1vdmVEcm9wQ2FuZGlkYXRlUG9pbnRlciAgICh0aGlzLmlkUG9pbnRlcik7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuaXNCZWluZ0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5pZFBvaW50ZXIgPSBudWxsO1xyXG4gICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lLmRyb3AoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICB0aGlzLmRlbGV0ZUNsb25lKCk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKHg6IG51bWJlciwgeTogbnVtYmVyKSA6IHRoaXMge1xyXG4gICAgICAgIGxldCBlbGVtZW50IDogRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRDbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5sZWZ0ID0gKHggLSB0aGlzLmR4ICsgd2luZG93LnBhZ2VYT2Zmc2V0KSArIFwicHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudG9wICA9ICh5IC0gdGhpcy5keSArIHdpbmRvdy5wYWdlWU9mZnNldCkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLmNsb25lTm9kZS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICBsZXQgdmlzaWJpbGl0eSA9IHRoaXMuY2xvbmVOb2RlLnN0eWxlLnZpc2liaWxpdHk7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5jbG9uZU5vZGUgKTtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICAgICAgICAgIC8vIGxldCBMID0gPEFycmF5PEVsZW1lbnQ+Pm15RG9jLmVsZW1lbnRzRnJvbVBvaW50KHgtd2luZG93LnBhZ2VYT2Zmc2V0LCB5LXdpbmRvdy5wYWdlWU9mZnNldCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBteURvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IHZpc2liaWxpdHk7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCggdGhpcy5jbG9uZU5vZGUgKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcmV2RHJvcFpvbmUgPSB0aGlzLmN1cnJlbnREcm9wWm9uZTtcclxuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG9uIHRvcCBvZiBhIGRyb3Bab25lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IHRoaXMucG9zc2libGVEcm9wWm9uZXMuZ2V0KCBlbGVtZW50ICk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge2JyZWFrO31cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSA8RWxlbWVudD5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJldkRyb3Bab25lICE9PSB0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocHJldkRyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkRyb3Bab25lLnJlbW92ZVBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuYXBwZW5kUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qdGhpcy5wb3NzaWJsZURyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiBkei5yZW1vdmVQb2ludGVySG92ZXIodGhpcy5pZFBvaW50ZXIpICk7XHJcbiAgICAgICAgICAgIHdoaWxlKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFyZSBvbiB0b3Agb2YgYSBkcm9wWm9uZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmdldCggZWxlbWVudCApO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5hcHBlbmRQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gPEVsZW1lbnQ+ZWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9Ki9cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkZWVwU3R5bGUob3JpZ2luYWw6IEVsZW1lbnQsIGNsb25lOiBFbGVtZW50KSB7XHJcbiAgICAgICAgaWYob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvcmlnaW5hbCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHQgPSBzdHlsZVtpXTtcclxuICAgICAgICAgICAgICAgIChjbG9uZSBhcyBIVE1MRWxlbWVudCkuc3R5bGVbYXR0XSA9IHN0eWxlW2F0dF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8b3JpZ2luYWwuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKG9yaWdpbmFsLmNoaWxkcmVuLml0ZW0oaSksIChjbG9uZSBhcyBIVE1MRWxlbWVudCkuY2hpbGRyZW4uaXRlbShpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZWxldGVDbG9uZSgpIHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSkge1xyXG4gICAgICAgICAgICBpZih0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2xvbmVOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0Q2xvbmUoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IDxIVE1MRWxlbWVudD50aGlzLnJvb3QuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAvLyBBcHBseSBjb21wdXRlZCBzdHlsZSA6XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKCB0aGlzLnJvb3QsIHRoaXMuY2xvbmVOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgY2xvbmUgb24gdGhlIERPTVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5wb3NpdGlvbiAgICAgPSBcImFic29sdXRlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnpJbmRleCAgICAgICA9IFwiOTk5XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkxlZnQgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5Ub3AgICAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luUmlnaHQgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5vcGFjaXR5ICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5jdXJzb3IgICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50cmFuc2Zvcm0gICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5jbGFzc0xpc3QuYWRkKCBcImFseC1jbG9uZU5vZGVcIiApO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5jbG9uZU5vZGUuc3R5bGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmVOb2RlO1xyXG4gICAgfVxyXG59XHJcblxyXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6IFwiKlthbHgtZHJvcHpvbmVdXCIgfSlcclxuZXhwb3J0IGNsYXNzIEFseERyb3B6b25lIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgbmJEcmFnRW50ZXIgPSAwO1xyXG4gICAgcHVibGljIHJvb3QgOiBIVE1MRWxlbWVudDtcclxuICAgIEBJbnB1dChcImFseC1kcmFnLWNzc1wiICAgICApIGRyYWdDU1MgICAgIDogc3RyaW5nO1xyXG4gICAgQElucHV0KFwiYWx4LWRyYWctb3Zlci1jc3NcIikgZHJhZ092ZXJDU1MgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtZHJhZy1vdmVyLWNzcy1mb3ItZHJhZ2dhYmxlXCIpIGRyYWdPdmVyQ1NTX3BvaW50ZXIgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtYWNjZXB0LWZ1bmN0aW9uXCIpIGFjY2VwdEZ1bmN0aW9uIDogKGRhdGE6IGFueSkgPT4gYm9vbGVhbjtcclxuICAgIEBPdXRwdXQoXCJhbHgtb25kcm9wXCIpICAgICBvbkRyb3BFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctc3RhcnRcIikgb25EcmFnU3RhcnQgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVuZFwiKSAgIG9uRHJhZ0VuZCAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbnRlclwiKSBvbkRyYWdFbnRlciAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctbGVhdmVcIikgb25EcmFnTGVhdmUgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICAgIC8vIENTUyB3aGVuIGNhbkRyb3AgYW5kIHN0YXJ0ZHJhZ2dhYmxlXHJcbiAgICBwcml2YXRlIGRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzIDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyc0hvdmVyICAgICAgICAgICA6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgaWYoIWRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IHNob3VsZCBhZGQgb25lIGFseC1kcmFnZHJvcCBhdHRyaWJ1dGUgdG8geW91ciBjb2RlIGJlZm9yZSB1c2luZyBhbHgtZHJvcHpvbmVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucm9vdCA9IGVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgLy8gdGhpcy5hY2NlcHRGY3QgPSBZRVM7XHJcbiAgICAgICAgRE0ucmVnaXN0ZXJEcm9wWm9uZSh0aGlzKTtcclxuICAgIH1cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggXCJUT0RPOiBTaG91bGQgaW1wbGVtZW50IGRyb3B6b25lIGRlc3RveVwiKTtcclxuICAgICAgICBETS51bnJlZ2lzdGVyRHJvcFpvbmUoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdFbnRlciAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXIrKztcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdMZWF2ZSAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXItLTtcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcm9wXCIgLCBbXCIkZXZlbnRcIl0pIEJyb3dzZXJEcm9wIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJCcm93c2VyRHJvcFwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKCBkcmFnUG9pbnRlcklkICk7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5vbkRyb3BFbWl0dGVyLmVtaXQoIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgICBkcm9wKCBvYmogKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIHRoaXMsIFwiZHJvcFwiLCBvYmogKTtcclxuICAgICAgICB0aGlzLm9uRHJvcEVtaXR0ZXIuZW1pdCggb2JqICk7XHJcbiAgICB9XHJcbiAgICBjaGVja0FjY2VwdChkcmFnOiBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJlczogYm9vbGVhbjtcclxuICAgICAgICBpZiggZHJhZyBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSApIHtcclxuICAgICAgICAgICAgcmVzID0gdGhpcy5hY2NlcHRGdW5jdGlvbj90aGlzLmFjY2VwdEZ1bmN0aW9uKCBkcmFnLmRyYWdnZWREYXRhICk6dHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLmFjY2VwdEZ1bmN0aW9uP3RoaXMuYWNjZXB0RnVuY3Rpb24oIGRyYWcgKTp0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG4gICAgaGFzUG9pbnRlckhvdmVyKGlkUG9pbnRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPj0gMDtcclxuICAgIH1cclxuICAgIGFwcGVuZFBvaW50ZXJIb3ZlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgaWYoIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJzSG92ZXIucHVzaChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLmdldENsb25lKCkuY2xhc3NMaXN0LmFkZCggdGhpcy5kcmFnT3ZlckNTU19wb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VudGVyLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW50ZXIuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ092ZXJDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QuYWRkKCB0aGlzLmRyYWdPdmVyQ1NTICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVQb2ludGVySG92ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLnBvaW50ZXJzSG92ZXIuaW5kZXhPZihpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKCBwb3MgPj0gMCApIHtcclxuICAgICAgICAgICAgbGV0IGRyYWdnZWQgPSBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyc0hvdmVyLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLmdldENsb25lKCkuY2xhc3NMaXN0LnJlbW92ZSggdGhpcy5kcmFnT3ZlckNTU19wb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0xlYXZlLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnTGVhdmUuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9pbnRlcnNIb3Zlci5sZW5ndGggPT09IDAgJiYgdGhpcy5kcmFnT3ZlckNTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoIHRoaXMuZHJhZ092ZXJDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggXCJhcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlclwiLCBpZFBvaW50ZXIsIHRoaXMgKTtcclxuICAgICAgICBpZiggdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMucHVzaCggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmluZGV4T2YoaWRQb2ludGVyKTtcclxuICAgICAgICBpZiggcG9zID49IDAgKSB7XHJcbiAgICAgICAgICAgIGxldCBkcmFnZ2VkID0gRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9
