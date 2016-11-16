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
                        // parent.removeChild( this.cloneNode );
                        this.cloneNode.style.visibility = "hidden";
                        // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
                        element = DragDropUtils_1.myDoc.elementFromPoint(x, y);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LEVBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7OzsrREFBQTtZQU92QztnQkFBQyxtQkFBWSxDQUFDLE1BQU0sRUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OzBEQUFBO1lBOUN0QztnQkFBQyxnQkFBUyxDQUFDLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLENBQUM7OzJCQUFBO1lBQzNDLHFDQW9JQyxDQUFBIiwiZmlsZSI6IkRpcmVjdGl2ZXNEcmFnRHJvcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbnB1dCwgSG9zdExpc3RlbmVyLCBFdmVudEVtaXR0ZXIsIE91dHB1dCwgT25Jbml0LCBPbkRlc3Ryb3l9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7bXlEb2N9IGZyb20gXCIuL0RyYWdEcm9wVXRpbHNcIjtcclxuXHJcbi8qIFBvbHlmaWxsIFRvdWNoRXZlbnQgKi9cclxuaW50ZXJmYWNlIE15VG91Y2hFdmVudCBleHRlbmRzIFRvdWNoRXZlbnQge31cclxuLypcclxuaW50ZXJmYWNlIFNoYWRvd1Jvb3QgZXh0ZW5kcyBEb2N1bWVudEZyYWdtZW50IHtcclxuICAgIHN0eWxlU2hlZXRzICAgICA6IFN0eWxlU2hlZXRMaXN0O1xyXG4gICAgaW5uZXJIVE1MICAgICAgIDogc3RyaW5nO1xyXG4gICAgaG9zdCAgICAgICAgICAgIDogRWxlbWVudDtcclxuICAgIGFjdGl2ZUVsZW1lbnQgICA6IEVsZW1lbnQ7XHJcbiAgICBlbGVtZW50RnJvbVBvaW50ICAgICAgICAoeCA6IG51bWJlciwgeSA6IG51bWJlcikgOiBFbGVtZW50O1xyXG4gICAgZWxlbWVudHNGcm9tUG9pbnQgICAgICAgKHggOiBudW1iZXIsIHkgOiBudW1iZXIpIDogRWxlbWVudFtdO1xyXG4gICAgY2FyZXRQb3NpdGlvbkZyb21Qb2ludCAgKHggOiBudW1iZXIsIHkgOiBudW1iZXIpOyAvLyA9PiBDYXJldFBvc2l0aW9uXHJcbn07XHJcblxyXG5pbnRlcmZhY2UgRWxlbWVudFdpdGhTaGFkb3dSb290IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgc2hhZG93Um9vdCAgOiBTaGFkb3dSb290O1xyXG59OyovXHJcbmNvbnN0IGRyYWdQb2ludGVySWQgPSBcImRyYWdQb2ludGVyXCI7XHJcbnR5cGUgUG9pbnRlciA9IHt4OiBudW1iZXIsIHk6IG51bWJlcn07XHJcbmNsYXNzIERyYWdNYW5hZ2VyIHtcclxuICAgIGRyYWdnaW5nUG9pbnRlciAgICAgPSBuZXcgTWFwPHN0cmluZywgUG9pbnRlcj4oKTtcclxuICAgIGRyYWdnZWRTdHJ1Y3R1cmVzICAgPSBuZXcgTWFwPHN0cmluZywgQWx4RHJhZ2dhYmxlIHwgRHJhZ0V2ZW50PigpO1xyXG4gICAgZHJvcFpvbmVzICAgICAgICAgICA9IG5ldyBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmUgPigpO1xyXG4gICAgLy9jb25zdHJ1Y3RvcigpIHt9XHJcbiAgICBwcmVTdGFydERyYWcoIGlkUG9pbnRlcjogc3RyaW5nLCBkcmFnZ2VkOiBBbHhEcmFnZ2FibGUsIHg6IG51bWJlciwgeTogbnVtYmVyXHJcbiAgICAgICAgICAgICAgICAsIGRlbGF5OiBudW1iZXIsIGRpc3Q6IG51bWJlcikgOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwicHJlU3RhcnREcmFnXCIsIGlkUG9pbnRlciwgZHJhZ2dlZCwgeCwgeSwgZGVsYXkpO1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmdQb2ludGVyICAuc2V0KGlkUG9pbnRlciwge3g6IHgsIHk6IHl9KTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oIChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHRyICAgPSB0aGlzLmRyYWdnaW5nUG9pbnRlci5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgICAgIGxldCBnb2dvICA9IHB0ciAmJiAoTWF0aC5hYnMoeCAtIHB0ci54KSArIE1hdGguYWJzKHkgLSBwdHIueSkpIDwgZGlzdDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQb2ludGVyLmRlbGV0ZShpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgaWYoZ29nbykge3Jlc29sdmUoKTt9IGVsc2Uge3JlamVjdCgpO31cclxuICAgICAgICAgICAgfSwgTWF0aC5tYXgoMCwgZGVsYXkpKTtcclxuICAgICAgICB9KTsgLy8gRW5kIG9mIFByb21pc2VcclxuICAgIH1cclxuICAgIHB1YmxpYyBzdGFydERyYWcoaWRQb2ludGVyOiBzdHJpbmcsIGRyYWdnZWQ6IEFseERyYWdnYWJsZSB8IERyYWdFdmVudCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIDogTWFwPEVsZW1lbnQsIEFseERyb3B6b25lPiB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJzdGFydGRyYWdcIiwgZHJhZ2dlZCwgeCwgeSk7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5zZXQoaWRQb2ludGVyLCBkcmFnZ2VkKTtcclxuICAgICAgICBsZXQgcG9zc2libGVEcm9wWm9uZXMgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lPigpO1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IHtcclxuICAgICAgICAgICAgaWYoIGR6LmNoZWNrQWNjZXB0KGRyYWdnZWQpICkge1xyXG4gICAgICAgICAgICAgICAgZHouYXBwZW5kRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgcG9zc2libGVEcm9wWm9uZXMuc2V0KGR6LnJvb3QsIGR6KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZXR1cm4gcG9zc2libGVEcm9wWm9uZXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgaXNBc3NvY2lhdGVkVG9Ecm9wWm9uZShlbGVtZW50OiBFbGVtZW50KSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRyb3Bab25lcy5oYXMoIGVsZW1lbnQgKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyByZWdpc3RlckRyb3Bab25lKCBkcm9wem9uZTogQWx4RHJvcHpvbmUgKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuc2V0KGRyb3B6b25lLnJvb3QsIGRyb3B6b25lKTtcclxuICAgIH1cclxuICAgIHB1YmxpYyB1bnJlZ2lzdGVyRHJvcFpvbmUoIGRyb3B6b25lOiBBbHhEcm9wem9uZSApIHtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5kZWxldGUoZHJvcHpvbmUucm9vdCk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcG9pbnRlck1vdmUoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBwdHIgPSB0aGlzLmRyYWdnaW5nUG9pbnRlci5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihwdHIpIHtwdHIueCA9IHg7IHB0ci55ID0geTt9XHJcbiAgICAgICAgbGV0IGRyYWdnZWQgPSB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKGRyYWdnZWQgJiYgZHJhZ2dlZCBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSkge1xyXG4gICAgICAgICAgICBkcmFnZ2VkLm1vdmUoeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkcmFnZ2VkICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcG9pbnRlclJlbGVhc2UoaWRQb2ludGVyOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGRyYWdnZWQgPSB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKGRyYWdnZWQpIHtcclxuICAgICAgICAgICAgaWYoZHJhZ2dlZCBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dlZC5zdG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIgIC5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWdnZWQgIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG5sZXQgRE0gPSBuZXcgRHJhZ01hbmFnZXIoKTtcclxuXHJcbmxldCBkcmFnRHJvcEluaXQgPSBmYWxzZTtcclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogXCIqW2FseC1kcmFnZHJvcF1cIlxyXG59KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJhZ0Ryb3Age1xyXG4gICAgbmJEcmFnRW50ZXIgPSAwO1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgaWYoZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIFwiRG8gbm90IGNyZWF0ZSBtdWx0aXBsZSBpbnN0YW5jZSBvZiBkaXJlY3RpdmUgYWx4LWRyYWdkcm9wICFcIiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcIkFseERyYWdEcm9wIGVuYWJsZWQgIVwiKTtcclxuICAgICAgICAgICAgZHJhZ0Ryb3BJbml0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVGZWVkYmFja0ZvckRyYWdQb2ludGVyKCkge1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXIgPSAwO1xyXG4gICAgICAgIERNLmRyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZVBvaW50ZXJIb3ZlciAgICAgICAgICAgKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgICAgICBkei5yZW1vdmVEcm9wQ2FuZGlkYXRlUG9pbnRlciAgIChkcmFnUG9pbnRlcklkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyb3BcIiwgW1wiJGV2ZW50XCJdICkgZHJvcCggZSApIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJkb2N1bWVudCBkcm9wXCIsIGUgKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUZlZWRiYWNrRm9yRHJhZ1BvaW50ZXIoKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyYWdvdmVyXCIsIFtcIiRldmVudFwiXSApIGRyYWdvdmVyKCBlICkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCBcImRvY3VtZW50IGRyYWdvdmVyXCIsIGUgKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyYWdlbnRlclwiLCBbXCIkZXZlbnRcIl0gKSBkcmFnZW50ZXIoIGUgKSB7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlcisrO1xyXG4gICAgICAgIGlmKHRoaXMubmJEcmFnRW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgRE0uc3RhcnREcmFnKGRyYWdQb2ludGVySWQsIGUsIC0xLCAtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ2xlYXZlXCIsIFtcIiRldmVudFwiXSApIGRyYWdsZWF2ZSggZSApIHtcclxuICAgICAgICB0aGlzLm5iRHJhZ0VudGVyLS07XHJcbiAgICAgICAgaWYodGhpcy5uYkRyYWdFbnRlciA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUZlZWRiYWNrRm9yRHJhZ1BvaW50ZXIoKTtcclxuICAgICAgICAgICAgRE0ucG9pbnRlclJlbGVhc2UoIGRyYWdQb2ludGVySWQgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcmFnZW5kXCIsIFtcIiRldmVudFwiXSApIGRyYWdlbmQoIGUgKSB7XHJcbiAgICAgICAgRE0ucG9pbnRlclJlbGVhc2UoIGRyYWdQb2ludGVySWQgKTtcclxuICAgICAgICB0aGlzLnJlbW92ZUZlZWRiYWNrRm9yRHJhZ1BvaW50ZXIoKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBtb3VzZW1vdmVcIiwgW1wiJGV2ZW50XCJdICkgbW91c2Vtb3ZlKCBlICkge1xyXG4gICAgICAgIERNLnBvaW50ZXJNb3ZlICAgKFwibW91c2VcIiwgZS5jbGllbnRYLCBlLmNsaWVudFkpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogbW91c2V1cFwiICAsIFtcIiRldmVudFwiXSApIG1vdXNldXAgICggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyUmVsZWFzZShcIm1vdXNlXCIpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogdG91Y2htb3ZlXCIsIFtcIiRldmVudFwiXSApIHRvdWNobW92ZSggZSApIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoOlRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiAoRE0ucG9pbnRlck1vdmUodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IHRvdWNoZW5kXCIgLCBbXCIkZXZlbnRcIl0gKSB0b3VjaGVuZCAoIGUgKSB7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8ZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2ggOiBUb3VjaCA9IGUuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgaWYoIERNLnBvaW50ZXJSZWxlYXNlKHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSkgKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgb2Zmc2V0RWxlbWVudCA9IChlbGVtZW50OiBIVE1MRWxlbWVudCkgOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn0gPT4ge1xyXG4gICAgbGV0IGxlZnQgPSAwLCB0b3AgPSAwO1xyXG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcclxuICAgICAgICB0b3AgICs9IGVsZW1lbnQub2Zmc2V0VG9wICAtIGVsZW1lbnQuc2Nyb2xsVG9wICArIGVsZW1lbnQuY2xpZW50VG9wO1xyXG4gICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IC0gZWxlbWVudC5zY3JvbGxMZWZ0ICsgZWxlbWVudC5jbGllbnRMZWZ0O1xyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCBhcyBIVE1MRWxlbWVudDtcclxuICAgIH1cclxuICAgIHJldHVybiB7bGVmdDogbGVmdCwgdG9wOiB0b3B9OyAvLyArIGVsZW1lbnQuc2Nyb2xsVG9wOyAvL3dpbmRvdy5zY3JvbGxZO1xyXG59O1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogXCIqW2FseC1kcmFnZ2FibGVdXCJcclxufSlcclxuZXhwb3J0IGNsYXNzIEFseERyYWdnYWJsZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICAgIEBJbnB1dCAoXCJhbHgtZHJhZ2dhYmxlXCIgKSBkcmFnZ2VkRGF0YSA6IGFueTtcclxuICAgIEBJbnB1dCAoXCJhbHgtdG91Y2gtZGVsYXlcIikgdG91Y2hEZWxheSA6IG51bWJlcjtcclxuICAgIEBJbnB1dCAoXCJhbHgtdG91Y2gtZGlzdGFuY2VcIikgdG91Y2hEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLXN0YXJ0XCIpIG9uRHJhZ1N0YXJ0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctZW5kXCIgICkgb25EcmFnRW5kICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIHByaXZhdGUgaXNCZWluZ0RyYWdnZWQgICAgICAgICAgICAgICAgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGNsb25lTm9kZSAgICAgICAgICAgICAgICAgICAgIDogSFRNTEVsZW1lbnQgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RHJvcFpvbmUgICAgICAgICAgICAgICA6IEFseERyb3B6b25lO1xyXG4gICAgcHJpdmF0ZSBwb3NzaWJsZURyb3Bab25lcyA9IG5ldyBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+KCk7XHJcbiAgICBwcml2YXRlIGR4IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBkeSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgb3ggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG95IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0eCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHkgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGlkUG9pbnRlciA6IHN0cmluZztcclxuICAgIHByaXZhdGUgcm9vdCA6IEhUTUxFbGVtZW50O1xyXG4gICAgY29uc3RydWN0b3IoZWw6IEVsZW1lbnRSZWYpIHtcclxuICAgICAgICB0aGlzLnJvb3QgPSBlbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGlmKCFkcmFnRHJvcEluaXQpIHtcclxuICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IHNob3VsZCBhZGQgb25lIGFseC1kcmFnZHJvcCBhdHRyaWJ1dGUgdG8geW91ciBjb2RlIGJlZm9yZSB1c2luZyBhbHgtZHJhZ2dhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCBcIm5ldyBpbnN0YW5jZSBvZiBBbHhEcmFnZ2FibGVcIiwgdGhpcyApO1xyXG4gICAgfVxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcIm1vdXNlZG93blwiICwgW1wiJGV2ZW50XCJdKSBvbk1vdXNlRG93biAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIm1vdXNlZG93biBvblwiLCB0aGlzLCBldmVudCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB0aGlzLnN0YXJ0KFwibW91c2VcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBbXCIkZXZlbnRcIl0pIG9uVG91Y2hTdGFydChldmVudDogTXlUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInRvdWNoc3RhcnQgb25cIiwgdGhpcyk7XHJcbiAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2ggOiBUb3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJlc3RhcnQodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmVzdGFydChpZFBvaW50ZXI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBETS5wcmVTdGFydERyYWcoaWRQb2ludGVyLCB0aGlzLCB4LCB5LCB0aGlzLnRvdWNoRGVsYXkgfHwgNTAsIHRoaXMudG91Y2hEaXN0YW5jZSB8fCAxMCkudGhlbihcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydChpZFBvaW50ZXIsIHgsIHkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKFwic2tpcCB0aGUgZHJhZ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzQmVpbmdEcmFnZ2VkICkge1xyXG4gICAgICAgICAgICB0aGlzLmlzQmVpbmdEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5pZFBvaW50ZXIgPSBpZFBvaW50ZXI7XHJcbiAgICAgICAgICAgIC8vIGxldCBiYm94ID0gdGhpcy5yb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gb2Zmc2V0RWxlbWVudCh0aGlzLnJvb3QpO1xyXG4gICAgICAgICAgICB0aGlzLm94ID0geDsgdGhpcy5veSA9IHk7XHJcbiAgICAgICAgICAgIHRoaXMuZHggPSB4IC0gb2Zmc2V0LmxlZnQ7IC8vIE1hdGgucm91bmQoYmJveC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0KTtcclxuICAgICAgICAgICAgdGhpcy5keSA9IHkgLSBvZmZzZXQudG9wIDsgLy8gTWF0aC5yb3VuZChiYm94LnRvcCAgKyB3aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICAvKmxldCBEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWJ1Z1wiKTtcclxuICAgICAgICAgICAgRC5pbm5lckhUTUwgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyBcIiA7IFwiICsgd2luZG93LnBhZ2VZT2Zmc2V0ICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgd2luZG93LnNjcm9sbFggKyBcIiA7IFwiICsgd2luZG93LnNjcm9sbFkgKyBcIjxici8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLnJvb3Qub2Zmc2V0TGVmdCArIFwiIDsgXCIgKyB0aGlzLnJvb3Qub2Zmc2V0VG9wICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICsgYmJveC5sZWZ0ICsgXCIgOyBcIiArIGJib3gudG9wXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDsqL1xyXG4gICAgICAgICAgICB0aGlzLnR4ID0gdGhpcy5yb290Lm9mZnNldFdpZHRoIDsgLy8gYmJveC53aWR0aCA7XHJcbiAgICAgICAgICAgIHRoaXMudHkgPSB0aGlzLnJvb3Qub2Zmc2V0SGVpZ2h0OyAvLyBiYm94LmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2xvbmUoKTtcclxuICAgICAgICAgICAgdGhpcy5vbkRyYWdTdGFydC5lbWl0KCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMgPSBETS5zdGFydERyYWcoaWRQb2ludGVyLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMuZm9yRWFjaCggZHogPT4ge1xyXG4gICAgICAgICAgICBkei5yZW1vdmVQb2ludGVySG92ZXIgICAgICAgICAgICh0aGlzLmlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZURyb3BDYW5kaWRhdGVQb2ludGVyICAgKHRoaXMuaWRQb2ludGVyKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGhpcy5pc0JlaW5nRHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmlkUG9pbnRlciA9IG51bGw7XHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuZHJvcCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdFbmQuZW1pdCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgIHRoaXMuZGVsZXRlQ2xvbmUoKTtcclxuICAgIH1cclxuICAgIG1vdmUoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogdGhpcyB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgOiBFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmdldENsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLmxlZnQgPSAoeCAtIHRoaXMuZHggKyB3aW5kb3cucGFnZVhPZmZzZXQpICsgXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50b3AgID0gKHkgLSB0aGlzLmR5ICsgd2luZG93LnBhZ2VZT2Zmc2V0KSArIFwicHhcIjtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuY2xvbmVOb2RlLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGxldCB2aXNpYmlsaXR5ID0gdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eTtcclxuICAgICAgICAgICAgLy8gcGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICAgLy8gbGV0IEwgPSA8QXJyYXk8RWxlbWVudD4+bXlEb2MuZWxlbWVudHNGcm9tUG9pbnQoeC13aW5kb3cucGFnZVhPZmZzZXQsIHktd2luZG93LnBhZ2VZT2Zmc2V0KTtcclxuICAgICAgICAgICAgZWxlbWVudCA9IG15RG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gdmlzaWJpbGl0eTtcclxuICAgICAgICAgICAgLy8gcGFyZW50LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG5cclxuICAgICAgICAgICAgbGV0IHByZXZEcm9wWm9uZSA9IHRoaXMuY3VycmVudERyb3Bab25lO1xyXG4gICAgICAgICAgICB3aGlsZShlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhcmUgb24gdG9wIG9mIGEgZHJvcFpvbmVcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lID0gdGhpcy5wb3NzaWJsZURyb3Bab25lcy5nZXQoIGVsZW1lbnQgKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7YnJlYWs7fVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IDxFbGVtZW50PmVsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihwcmV2RHJvcFpvbmUgIT09IHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICBpZihwcmV2RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2RHJvcFpvbmUucmVtb3ZlUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5hcHBlbmRQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyp0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IGR6LnJlbW92ZVBvaW50ZXJIb3Zlcih0aGlzLmlkUG9pbnRlcikgKTtcclxuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG9uIHRvcCBvZiBhIGRyb3Bab25lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IHRoaXMucG9zc2libGVEcm9wWm9uZXMuZ2V0KCBlbGVtZW50ICk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lLmFwcGVuZFBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSA8RWxlbWVudD5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH0qL1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRlZXBTdHlsZShvcmlnaW5hbDogRWxlbWVudCwgY2xvbmU6IEVsZW1lbnQpIHtcclxuICAgICAgICBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG9yaWdpbmFsKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGF0dCA9IHN0eWxlW2ldO1xyXG4gICAgICAgICAgICAgICAgKGNsb25lIGFzIEhUTUxFbGVtZW50KS5zdHlsZVthdHRdID0gc3R5bGVbYXR0XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IobGV0IGk9MDsgaTxvcmlnaW5hbC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWVwU3R5bGUob3JpZ2luYWwuY2hpbGRyZW4uaXRlbShpKSwgKGNsb25lIGFzIEhUTUxFbGVtZW50KS5jaGlsZHJlbi5pdGVtKGkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRlbGV0ZUNsb25lKCkge1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jbG9uZU5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRDbG9uZSgpIDogSFRNTEVsZW1lbnQge1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlID0gPEhUTUxFbGVtZW50PnRoaXMucm9vdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIC8vIEFwcGx5IGNvbXB1dGVkIHN0eWxlIDpcclxuICAgICAgICAgICAgdGhpcy5kZWVwU3R5bGUoIHRoaXMucm9vdCwgdGhpcy5jbG9uZU5vZGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBjbG9uZSBvbiB0aGUgRE9NXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuY2xvbmVOb2RlICk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnBvc2l0aW9uICAgICAgICA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUuekluZGV4ICAgICAgICAgID0gXCI5OTlcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luTGVmdCAgICAgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpblRvcCAgICAgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5SaWdodCAgICAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luQm90dG9tICAgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm9wYWNpdHkgICAgICAgICA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLmN1cnNvciAgICAgICAgICA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRyYW5zZm9ybSAgICAgICA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLmFuaW1hdGlvbiAgICAgICA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRyYW5zaXRpb24gICAgICA9IFwiXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLmNsYXNzTGlzdC5hZGQoIFwiYWx4LWNsb25lTm9kZVwiICk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCB0aGlzLmNsb25lTm9kZS5zdHlsZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZU5vZGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogXCIqW2FseC1kcm9wem9uZV1cIiB9KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJvcHpvbmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgICBuYkRyYWdFbnRlciA9IDA7XHJcbiAgICBwdWJsaWMgcm9vdCA6IEhUTUxFbGVtZW50O1xyXG4gICAgQElucHV0KFwiYWx4LWRyYWctY3NzXCIgICAgICkgZHJhZ0NTUyAgICAgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtZHJhZy1vdmVyLWNzc1wiKSBkcmFnT3ZlckNTUyA6IHN0cmluZztcclxuICAgIEBJbnB1dChcImFseC1kcmFnLW92ZXItY3NzLWZvci1kcmFnZ2FibGVcIikgZHJhZ092ZXJDU1NfcG9pbnRlciA6IHN0cmluZztcclxuICAgIEBJbnB1dChcImFseC1hY2NlcHQtZnVuY3Rpb25cIikgYWNjZXB0RnVuY3Rpb24gOiAoZGF0YTogYW55KSA9PiBib29sZWFuO1xyXG4gICAgQE91dHB1dChcImFseC1vbmRyb3BcIikgICAgIG9uRHJvcEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1zdGFydFwiKSBvbkRyYWdTdGFydCAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctZW5kXCIpICAgb25EcmFnRW5kICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVudGVyXCIpIG9uRHJhZ0VudGVyICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1sZWF2ZVwiKSBvbkRyYWdMZWF2ZSAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gICAgLy8gQ1NTIHdoZW4gY2FuRHJvcCBhbmQgc3RhcnRkcmFnZ2FibGVcclxuICAgIHByaXZhdGUgZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMgOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBwcml2YXRlIHBvaW50ZXJzSG92ZXIgICAgICAgICAgIDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgY29uc3RydWN0b3IoZWw6IEVsZW1lbnRSZWYpIHtcclxuICAgICAgICBpZighZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJZb3Ugc2hvdWxkIGFkZCBvbmUgYWx4LWRyYWdkcm9wIGF0dHJpYnV0ZSB0byB5b3VyIGNvZGUgYmVmb3JlIHVzaW5nIGFseC1kcm9wem9uZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yb290ID0gZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICAvLyB0aGlzLmFjY2VwdEZjdCA9IFlFUztcclxuICAgICAgICBETS5yZWdpc3RlckRyb3Bab25lKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBcIlRPRE86IFNob3VsZCBpbXBsZW1lbnQgZHJvcHpvbmUgZGVzdG95XCIpO1xyXG4gICAgICAgIERNLnVucmVnaXN0ZXJEcm9wWm9uZSggdGhpcyApO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcImRyYWdlbnRlclwiICwgW1wiJGV2ZW50XCJdKSBCcm93c2VyRHJhZ0VudGVyIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJCcm93c2VyRHJhZ0VudGVyXCIsIHRoaXMsIGV2ZW50ICk7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlcisrO1xyXG4gICAgICAgIGlmKHRoaXMubmJEcmFnRW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmRQb2ludGVySG92ZXIoZHJhZ1BvaW50ZXJJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcImRyYWdsZWF2ZVwiICwgW1wiJGV2ZW50XCJdKSBCcm93c2VyRHJhZ0xlYXZlIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJCcm93c2VyRHJhZ0VudGVyXCIsIHRoaXMsIGV2ZW50ICk7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlci0tO1xyXG4gICAgICAgIGlmKHRoaXMubmJEcmFnRW50ZXIgPT09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVQb2ludGVySG92ZXIoZHJhZ1BvaW50ZXJJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcImRyb3BcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyb3AgKGV2ZW50IDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCBcIkJyb3dzZXJEcm9wXCIsIHRoaXMsIGV2ZW50ICk7XHJcbiAgICAgICAgRE0ucG9pbnRlclJlbGVhc2UoIGRyYWdQb2ludGVySWQgKTtcclxuICAgICAgICB0aGlzLm5iRHJhZ0VudGVyID0gMDtcclxuICAgICAgICB0aGlzLm9uRHJvcEVtaXR0ZXIuZW1pdCggZXZlbnQgKTtcclxuICAgIH1cclxuICAgIGRyb3AoIG9iaiApIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcywgXCJkcm9wXCIsIG9iaiApO1xyXG4gICAgICAgIHRoaXMub25Ecm9wRW1pdHRlci5lbWl0KCBvYmogKTtcclxuICAgIH1cclxuICAgIGNoZWNrQWNjZXB0KGRyYWc6IEFseERyYWdnYWJsZSB8IERyYWdFdmVudCkgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcmVzOiBib29sZWFuO1xyXG4gICAgICAgIGlmKCBkcmFnIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlICkge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLmFjY2VwdEZ1bmN0aW9uP3RoaXMuYWNjZXB0RnVuY3Rpb24oIGRyYWcuZHJhZ2dlZERhdGEgKTp0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlcyA9IHRoaXMuYWNjZXB0RnVuY3Rpb24/dGhpcy5hY2NlcHRGdW5jdGlvbiggZHJhZyApOnRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9XHJcbiAgICBoYXNQb2ludGVySG92ZXIoaWRQb2ludGVyOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyc0hvdmVyLmluZGV4T2YoaWRQb2ludGVyKSA+PSAwO1xyXG4gICAgfVxyXG4gICAgYXBwZW5kUG9pbnRlckhvdmVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBpZiggdGhpcy5wb2ludGVyc0hvdmVyLmluZGV4T2YoaWRQb2ludGVyKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAgIGxldCBkcmFnZ2VkID0gRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnNIb3Zlci5wdXNoKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuZHJhZ092ZXJDU1NfcG9pbnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQuZ2V0Q2xvbmUoKS5jbGFzc0xpc3QuYWRkKCB0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW50ZXIuZW1pdCggZHJhZ2dlZC5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWdFbnRlci5lbWl0KCBkcmFnZ2VkICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5kcmFnT3ZlckNTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ092ZXJDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZVBvaW50ZXJIb3ZlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoIHBvcyA+PSAwICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJzSG92ZXIuc3BsaWNlKHBvcywgMSk7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuZHJhZ092ZXJDU1NfcG9pbnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWQuZ2V0Q2xvbmUoKS5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnTGVhdmUuZW1pdCggZHJhZ2dlZC5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWdMZWF2ZS5lbWl0KCBkcmFnZ2VkICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodGhpcy5wb2ludGVyc0hvdmVyLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdPdmVyQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZSggdGhpcy5kcmFnT3ZlckNTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXBwZW5kRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBcImFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyXCIsIGlkUG9pbnRlciwgdGhpcyApO1xyXG4gICAgICAgIGlmKCB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmluZGV4T2YoaWRQb2ludGVyKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAgIGxldCBkcmFnZ2VkID0gRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggZHJhZ2dlZC5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWdTdGFydC5lbWl0KCBkcmFnZ2VkICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5wdXNoKCBpZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5kcmFnQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QuY2xhc3NMaXN0LmFkZCggdGhpcy5kcmFnQ1NTICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVEcm9wQ2FuZGlkYXRlUG9pbnRlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMuaW5kZXhPZihpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKCBwb3MgPj0gMCApIHtcclxuICAgICAgICAgICAgbGV0IGRyYWdnZWQgPSBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgaWYoZHJhZ2dlZCBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWdFbmQuZW1pdCggZHJhZ2dlZC5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyYWdFbmQuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMuc3BsaWNlKHBvcywgMSk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMubGVuZ3RoID09PSAwICYmIHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=
