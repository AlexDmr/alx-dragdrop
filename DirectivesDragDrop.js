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
                    }
                    this.draggedStructures.delete(idPointer);
                    this.draggingPointer.delete(idPointer);
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
                        this.cloneNode.style.left = (x - this.dx + window.pageXOffset) + "px";
                        this.cloneNode.style.top = (y - this.dy + window.pageYOffset) + "px";
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
                core_1.Input("alx-start-delay"), 
                __metadata('design:type', Number)
            ], AlxDraggable.prototype, "startDelay", void 0);
            __decorate([
                core_1.Input("alx-start-distance"), 
                __metadata('design:type', Number)
            ], AlxDraggable.prototype, "startDistance", void 0);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdGl2ZXNEcmFnRHJvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O1FBbUJNLGFBQWEsZUE4RGYsRUFBRSxFQUVGLFlBQVksZUE0RVosYUFBYTs7Ozs7Ozs7OztZQTFKakI7Ozs7Ozs7Ozs7Ozs7Z0JBYUk7WUFDRSxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBRXBDO2dCQUFBO29CQUNJLG9CQUFlLEdBQU8sSUFBSSxHQUFHLEVBQW1CLENBQUM7b0JBQ2pELHNCQUFpQixHQUFLLElBQUksR0FBRyxFQUFvQyxDQUFDO29CQUNsRSxjQUFTLEdBQWEsSUFBSSxHQUFHLEVBQXlCLENBQUM7Z0JBd0QzRCxDQUFDO2dCQXZERyxrQkFBa0I7Z0JBQ2xCLFlBQVksQ0FBRSxTQUFpQixFQUFFLE9BQXFCLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFDOUQsS0FBYSxFQUFFLElBQVk7b0JBQ3JDLGdFQUFnRTtvQkFDaEUsSUFBSSxDQUFDLGVBQWUsQ0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQztvQkFDcEQsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFRLENBQUMsT0FBTyxFQUFFLE1BQU07d0JBQ3RDLFVBQVUsQ0FBQzs0QkFDUCxJQUFJLEdBQUcsR0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDaEQsSUFBSSxJQUFJLEdBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs0QkFDdEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ3ZDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0NBQUEsT0FBTyxFQUFFLENBQUM7NEJBQUEsQ0FBQzs0QkFBQyxJQUFJLENBQUMsQ0FBQztnQ0FBQSxNQUFNLEVBQUUsQ0FBQzs0QkFBQSxDQUFDO3dCQUMxQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7Z0JBQ3pCLENBQUM7Z0JBQ00sU0FBUyxDQUFDLFNBQWlCLEVBQUUsT0FBaUMsRUFBRSxDQUFTLEVBQUUsQ0FBUztvQkFDdkYsMkNBQTJDO29CQUMzQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztvQkFDeEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUUsRUFBRTt3QkFDdEIsRUFBRSxDQUFBLENBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLEVBQUUsQ0FBQywwQkFBMEIsQ0FBRSxTQUFTLENBQUUsQ0FBQzs0QkFDM0MsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ3ZDLENBQUM7b0JBQ0wsQ0FBQyxDQUFFLENBQUM7b0JBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDO2dCQUM3QixDQUFDO2dCQUNNLHNCQUFzQixDQUFDLE9BQWdCO29CQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ00sZ0JBQWdCLENBQUUsUUFBcUI7b0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7Z0JBQ00sa0JBQWtCLENBQUUsUUFBcUI7b0JBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekMsQ0FBQztnQkFDTSxXQUFXLENBQUMsU0FBaUIsRUFBRSxDQUFTLEVBQUUsQ0FBUztvQkFDdEQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7d0JBQUEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQUEsQ0FBQztvQkFDL0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDcEQsRUFBRSxDQUFBLENBQUMsT0FBTyxJQUFJLE9BQU8sWUFBWSxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDdkIsQ0FBQztvQkFDRCxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztnQkFDakMsQ0FBQztnQkFDTSxjQUFjLENBQUMsU0FBaUI7b0JBQ25DLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3BELEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ1QsRUFBRSxDQUFBLENBQUMsT0FBTyxZQUFZLFlBQVksQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDbkIsQ0FBQztvQkFDTCxDQUFDO29CQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztnQkFDakMsQ0FBQztZQUNMLENBQUM7WUFDRyxFQUFFLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUV2QixZQUFZLEdBQUcsS0FBSyxDQUFDO1lBSXpCO2dCQUVJO29CQURBLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO29CQUVaLEVBQUUsQ0FBQSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBRSw2REFBNkQsQ0FBRSxDQUFDO29CQUNuRixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUUsdUJBQXVCLENBQUMsQ0FBQzt3QkFDdEMsWUFBWSxHQUFHLElBQUksQ0FBQztvQkFDeEIsQ0FBQztnQkFDTCxDQUFDO2dCQUNELDRCQUE0QjtvQkFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7b0JBQ3JCLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFFLEVBQUU7d0JBQ3BCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBWSxhQUFhLENBQUMsQ0FBQzt3QkFDaEQsRUFBRSxDQUFDLDBCQUEwQixDQUFJLGFBQWEsQ0FBQyxDQUFDO29CQUNwRCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUM2QyxJQUFJLENBQUUsQ0FBQztvQkFDakQscUNBQXFDO29CQUNyQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDcEIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7Z0JBQ3hDLENBQUM7Z0JBQ2lELFFBQVEsQ0FBRSxDQUFDO29CQUN6RCx5Q0FBeUM7b0JBQ3pDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUN4QixDQUFDO2dCQUNrRCxTQUFTLENBQUUsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNuQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxDQUFDO2dCQUNMLENBQUM7Z0JBQ2tELFNBQVMsQ0FBRSxDQUFDO29CQUMzRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25CLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7d0JBQ3BDLEVBQUUsQ0FBQyxjQUFjLENBQUUsYUFBYSxDQUFFLENBQUM7b0JBQ3ZDLENBQUM7Z0JBQ0wsQ0FBQztnQkFDZ0QsT0FBTyxDQUFFLENBQUM7b0JBQ3ZELEVBQUUsQ0FBQyxjQUFjLENBQUUsYUFBYSxDQUFFLENBQUM7b0JBQ25DLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO29CQUNwQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBQ2tELFNBQVMsQ0FBRSxDQUFDO29CQUMzRCxFQUFFLENBQUMsV0FBVyxDQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckQsQ0FBQztnQkFDa0QsT0FBTyxDQUFJLENBQUM7b0JBQzNELEVBQUUsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBQ2tELFNBQVMsQ0FBRSxDQUFDO29CQUMzRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQy9DLElBQUksS0FBSyxHQUFTLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM1RSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7NEJBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDeEIsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBQ2tELFFBQVEsQ0FBRyxDQUFDO29CQUMzRCxHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzFDLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUM3QyxFQUFFLENBQUEsQ0FBRSxFQUFFLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ2xELENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQzs0QkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUN4QixDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUFyREc7Z0JBQUMsbUJBQVksQ0FBRSxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFFOzs7O21EQUFBO1lBTTdDO2dCQUFDLG1CQUFZLENBQUUsb0JBQW9CLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBRTs7Ozt1REFBQTtZQUtqRDtnQkFBQyxtQkFBWSxDQUFFLHFCQUFxQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUU7Ozs7d0RBQUE7WUFNbEQ7Z0JBQUMsbUJBQVksQ0FBRSxxQkFBcUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFFOzs7O3dEQUFBO1lBT2xEO2dCQUFDLG1CQUFZLENBQUUsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBRTs7OztzREFBQTtZQUtoRDtnQkFBQyxtQkFBWSxDQUFFLHFCQUFxQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUU7Ozs7d0RBQUE7WUFHbEQ7Z0JBQUMsbUJBQVksQ0FBRSxtQkFBbUIsRUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFFOzs7O3NEQUFBO1lBR2xEO2dCQUFDLG1CQUFZLENBQUUscUJBQXFCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBRTs7Ozt3REFBQTtZQVNsRDtnQkFBQyxtQkFBWSxDQUFFLG9CQUFvQixFQUFHLENBQUMsUUFBUSxDQUFDLENBQUU7Ozs7dURBQUE7WUFoRXREO2dCQUFDLGdCQUFTLENBQUM7b0JBQ1AsUUFBUSxFQUFFLGlCQUFpQjtpQkFDOUIsQ0FBQzs7MkJBQUE7WUFDRixxQ0FzRUMsQ0FBQTtZQUVHLGFBQWEsR0FBRyxDQUFDLE9BQW9CO2dCQUNyQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsT0FBTyxPQUFPLEVBQUUsQ0FBQztvQkFDYixHQUFHLElBQUssT0FBTyxDQUFDLFNBQVMsR0FBSSxPQUFPLENBQUMsU0FBUyxHQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUM7b0JBQ3BFLElBQUksSUFBSSxPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztvQkFDckUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUEyQixDQUFDO2dCQUNsRCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUMseUNBQXlDO1lBQzVFLENBQUMsQ0FBQztZQUtGO2dCQWtCSSxZQUFZLEVBQWM7b0JBZEEsZ0JBQVcsR0FBRyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFDdEMsY0FBUyxHQUFLLElBQUksbUJBQVksRUFBTyxDQUFDO29CQUN4RCxtQkFBYyxHQUE0QixLQUFLLENBQUM7b0JBQ2hELGNBQVMsR0FBcUMsSUFBSSxDQUFDO29CQUVuRCxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztvQkFVeEQsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUM3QixFQUFFLENBQUEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUZBQW1GLENBQUMsQ0FBQztvQkFDdEcsQ0FBQztvQkFDRCxzREFBc0Q7Z0JBQzFELENBQUM7Z0JBQ0QsUUFBUTtvQkFDSixFQUFFO2dCQUNOLENBQUM7Z0JBQ0QsV0FBVztvQkFDUCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ3VDLFdBQVcsQ0FBRSxLQUFrQjtvQkFDbkUsMkNBQTJDO29CQUMzQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQ3ZCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3pELENBQUM7Z0JBQ3VDLFlBQVksQ0FBQyxLQUFtQjtvQkFDcEUscUNBQXFDO29CQUNyQywwQkFBMEI7b0JBQzFCLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDeEIsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM5QyxJQUFJLEtBQUssR0FBVyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3RSxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsUUFBUSxDQUFDLFNBQWlCLEVBQUUsQ0FBUyxFQUFFLENBQVM7b0JBQzVDLEVBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUN6Rjt3QkFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2hDLENBQUMsRUFDRDt3QkFDSSxrQ0FBa0M7b0JBQ3RDLENBQUMsQ0FDQSxDQUFDO2dCQUNWLENBQUM7Z0JBQ0QsS0FBSyxDQUFDLFNBQWlCLEVBQUUsQ0FBUyxFQUFFLENBQVM7b0JBQ3pDLEVBQUUsQ0FBQSxDQUFFLENBQUMsSUFBSSxDQUFDLGNBQWUsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO3dCQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzt3QkFDM0IsZ0RBQWdEO3dCQUNoRCxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0QyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLDhDQUE4Qzt3QkFDekUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBRSxDQUFDLDhDQUE4Qzt3QkFDekU7Ozs7O3VDQUtlO3dCQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQyxlQUFlO3dCQUNqRCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsZUFBZTt3QkFFakQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUN0RSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUN0RSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsSUFBSTtvQkFDQSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFFLEVBQUU7d0JBQzlCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBWSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ2pELEVBQUUsQ0FBQywwQkFBMEIsQ0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBRSxDQUFDO29CQUNKLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO29CQUM1QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO29CQUN0QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzt3QkFDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO29CQUNsRCxDQUFDO29CQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7b0JBQ3hDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBUyxFQUFFLENBQVM7b0JBQ3JCLElBQUksT0FBTyxHQUFhLElBQUksQ0FBQztvQkFDN0IsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3BCLENBQUM7b0JBQ0QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RFLDZDQUE2Qzt3QkFDN0MsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO3dCQUNqRCx3Q0FBd0M7d0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7d0JBQzNDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQzt3QkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQzt3QkFFekMsK0ZBQStGO3dCQUMvRixPQUFPLEdBQUcscUJBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBRXZDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7d0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7d0JBQzdDLHdDQUF3Qzt3QkFFeEMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQzt3QkFDeEMsT0FBTSxPQUFPLEVBQUUsQ0FBQzs0QkFDWix1Q0FBdUM7NEJBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQzs0QkFDN0QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0NBQUEsS0FBSyxDQUFDOzRCQUFBLENBQUM7NEJBQ2pDLE9BQU8sR0FBWSxPQUFPLENBQUMsYUFBYSxDQUFDO3dCQUM3QyxDQUFDO3dCQUNELEVBQUUsQ0FBQSxDQUFDLFlBQVksS0FBSyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzs0QkFDdkMsRUFBRSxDQUFBLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQ0FDZCxZQUFZLENBQUMsa0JBQWtCLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDOzRCQUN0RCxDQUFDOzRCQUNELEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dDQUN0QixJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFFLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQzs0QkFDOUQsQ0FBQzt3QkFDTCxDQUFDO29CQVdMLENBQUM7b0JBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFDRCxTQUFTLENBQUMsUUFBaUIsRUFBRSxLQUFjO29CQUN2QyxFQUFFLENBQUEsQ0FBQyxRQUFRLFlBQVksV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDakMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM5QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDcEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNsQixLQUFxQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ25ELENBQUM7d0JBQ0QsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDOzRCQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFHLEtBQXFCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN2RixDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxXQUFXO29CQUNQLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUNoQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7NEJBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzFELENBQUM7d0JBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQzFCLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxRQUFRO29CQUNKLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hELHlCQUF5Qjt3QkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFFM0MsOEJBQThCO3dCQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7d0JBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBVSxVQUFVLENBQUM7d0JBQ2xELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBWSxLQUFLLENBQUM7d0JBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBUSxHQUFHLENBQUM7d0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBUyxHQUFHLENBQUM7d0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBTyxHQUFHLENBQUM7d0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBTSxHQUFHLENBQUM7d0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBVyxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBWSxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBUyxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBUyxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBUSxFQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxlQUFlLENBQUUsQ0FBQztvQkFFcEQsQ0FBQztvQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsQ0FBQztZQUNMLENBQUM7WUE5TEc7Z0JBQUMsWUFBSyxDQUFFLGVBQWUsQ0FBRTs7NkRBQUE7WUFDekI7Z0JBQUMsWUFBSyxDQUFFLGlCQUFpQixDQUFDOzs0REFBQTtZQUMxQjtnQkFBQyxZQUFLLENBQUUsb0JBQW9CLENBQUM7OytEQUFBO1lBQzdCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NkRBQUE7WUFDekI7Z0JBQUMsYUFBTSxDQUFDLGNBQWMsQ0FBRzs7MkRBQUE7WUEwQnpCO2dCQUFDLG1CQUFZLENBQUMsV0FBVyxFQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7MkRBQUE7WUFNdkM7Z0JBQUMsbUJBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs0REFBQTtZQXhDM0M7Z0JBQUMsZ0JBQVMsQ0FBQztvQkFDUCxRQUFRLEVBQUUsa0JBQWtCO2lCQUMvQixDQUFDOzs0QkFBQTtZQUNGLHVDQStMQyxDQUFBO1lBR0Q7Z0JBZ0JJLFlBQVksRUFBYztvQkFmMUIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7b0JBTVUsa0JBQWEsR0FBRyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFDeEMsZ0JBQVcsR0FBSyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFDeEMsY0FBUyxHQUFPLElBQUksbUJBQVksRUFBTyxDQUFDO29CQUN4QyxnQkFBVyxHQUFLLElBQUksbUJBQVksRUFBTyxDQUFDO29CQUN4QyxnQkFBVyxHQUFLLElBQUksbUJBQVksRUFBTyxDQUFDO29CQUVsRSxzQ0FBc0M7b0JBQzlCLDRCQUF1QixHQUFtQixFQUFFLENBQUM7b0JBQzdDLGtCQUFhLEdBQTZCLEVBQUUsQ0FBQztvQkFFakQsRUFBRSxDQUFBLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztvQkFDdEcsQ0FBQztvQkFDRCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQzdCLHdCQUF3QjtvQkFDeEIsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2dCQUNELFFBQVE7b0JBQ0osRUFBRTtnQkFDTixDQUFDO2dCQUNELFdBQVc7b0JBQ1AsMERBQTBEO29CQUMxRCxFQUFFLENBQUMsa0JBQWtCLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQ2xDLENBQUM7Z0JBQ3VDLGdCQUFnQixDQUFFLEtBQWtCO29CQUN4RSxrREFBa0Q7b0JBQ2xELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDbkIsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN4QixJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzNDLENBQUM7Z0JBQ0wsQ0FBQztnQkFDdUMsZ0JBQWdCLENBQUUsS0FBa0I7b0JBQ3hFLGtEQUFrRDtvQkFDbEQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUNuQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDM0MsQ0FBQztnQkFDTCxDQUFDO2dCQUNrQyxXQUFXLENBQUUsS0FBa0I7b0JBQzlELDZDQUE2QztvQkFDN0MsRUFBRSxDQUFDLGNBQWMsQ0FBRSxhQUFhLENBQUUsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRSxDQUFDO2dCQUNyQyxDQUFDO2dCQUNELElBQUksQ0FBRSxHQUFHO29CQUNMLG9DQUFvQztvQkFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFLENBQUM7Z0JBQ25DLENBQUM7Z0JBQ0QsV0FBVyxDQUFDLElBQThCO29CQUN0QyxJQUFJLEdBQVksQ0FBQztvQkFDakIsRUFBRSxDQUFBLENBQUUsSUFBSSxZQUFZLFlBQWEsQ0FBQyxDQUFDLENBQUM7d0JBQ2hDLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFDLElBQUksQ0FBQyxjQUFjLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxHQUFDLElBQUksQ0FBQztvQkFDM0UsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBQyxJQUFJLENBQUMsY0FBYyxDQUFFLElBQUksQ0FBRSxHQUFDLElBQUksQ0FBQztvQkFDL0QsQ0FBQztvQkFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO2dCQUNmLENBQUM7Z0JBQ0QsZUFBZSxDQUFDLFNBQWlCO29CQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUNELGtCQUFrQixDQUFFLFNBQWlCO29CQUNqQyxFQUFFLENBQUEsQ0FBRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ2hELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNuQyxFQUFFLENBQUEsQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDakMsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztnQ0FDMUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFFLENBQUM7NEJBQ2pFLENBQUM7NEJBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUNqRCxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO3dCQUNyQyxDQUFDO3dCQUNELEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUNoRCxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxrQkFBa0IsQ0FBRSxTQUFpQjtvQkFDakMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2hELEVBQUUsQ0FBQSxDQUFFLEdBQUcsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNaLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDbEMsRUFBRSxDQUFBLENBQUMsT0FBTyxZQUFZLFlBQVksQ0FBQyxDQUFDLENBQUM7NEJBQ2pDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7Z0NBQzFCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBRSxDQUFDOzRCQUNwRSxDQUFDOzRCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUUsQ0FBQzt3QkFDakQsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxPQUFPLENBQUUsQ0FBQzt3QkFDckMsQ0FBQzt3QkFDRCxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7d0JBQ25ELENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUNELDBCQUEwQixDQUFFLFNBQWlCO29CQUN6QyxnRUFBZ0U7b0JBQ2hFLEVBQUUsQ0FBQSxDQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNsRCxFQUFFLENBQUEsQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUNqRCxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO3dCQUNyQyxDQUFDO3dCQUNELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUUsU0FBUyxDQUFFLENBQUM7d0JBQy9DLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7d0JBQzVDLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUNELDBCQUEwQixDQUFFLFNBQWlCO29CQUN6QyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMxRCxFQUFFLENBQUEsQ0FBRSxHQUFHLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQzt3QkFDWixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNsRCxFQUFFLENBQUEsQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQzs0QkFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUMvQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRSxDQUFDO3dCQUNuQyxDQUFDO3dCQUNELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUM1QyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQzt3QkFDL0MsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBaklHO2dCQUFDLFlBQUssQ0FBQyxjQUFjLENBQU07O3dEQUFBO1lBQzNCO2dCQUFDLFlBQUssQ0FBQyxtQkFBbUIsQ0FBQzs7NERBQUE7WUFDM0I7Z0JBQUMsWUFBSyxDQUFDLGlDQUFpQyxDQUFDOztvRUFBQTtZQUN6QztnQkFBQyxZQUFLLENBQUMscUJBQXFCLENBQUM7OytEQUFBO1lBQzdCO2dCQUFDLGFBQU0sQ0FBQyxZQUFZLENBQUM7OzhEQUFBO1lBQ3JCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NERBQUE7WUFDekI7Z0JBQUMsYUFBTSxDQUFDLGNBQWMsQ0FBQzs7MERBQUE7WUFDdkI7Z0JBQUMsYUFBTSxDQUFDLGdCQUFnQixDQUFDOzs0REFBQTtZQUN6QjtnQkFBQyxhQUFNLENBQUMsZ0JBQWdCLENBQUM7OzREQUFBO1lBb0J6QjtnQkFBQyxtQkFBWSxDQUFDLFdBQVcsRUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OytEQUFBO1lBT3ZDO2dCQUFDLG1CQUFZLENBQUMsV0FBVyxFQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7K0RBQUE7WUFPdkM7Z0JBQUMsbUJBQVksQ0FBQyxNQUFNLEVBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7OzswREFBQTtZQTlDdEM7Z0JBQUMsZ0JBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDOzsyQkFBQTtZQUMzQyxxQ0FvSUMsQ0FBQSIsImZpbGUiOiJEaXJlY3RpdmVzRHJhZ0Ryb3AuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIEhvc3RMaXN0ZW5lciwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95fSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge215RG9jfSBmcm9tIFwiLi9EcmFnRHJvcFV0aWxzXCI7XHJcblxyXG4vKiBQb2x5ZmlsbCBUb3VjaEV2ZW50ICovXHJcbmludGVyZmFjZSBNeVRvdWNoRXZlbnQgZXh0ZW5kcyBUb3VjaEV2ZW50IHt9XHJcbi8qXHJcbmludGVyZmFjZSBTaGFkb3dSb290IGV4dGVuZHMgRG9jdW1lbnRGcmFnbWVudCB7XHJcbiAgICBzdHlsZVNoZWV0cyAgICAgOiBTdHlsZVNoZWV0TGlzdDtcclxuICAgIGlubmVySFRNTCAgICAgICA6IHN0cmluZztcclxuICAgIGhvc3QgICAgICAgICAgICA6IEVsZW1lbnQ7XHJcbiAgICBhY3RpdmVFbGVtZW50ICAgOiBFbGVtZW50O1xyXG4gICAgZWxlbWVudEZyb21Qb2ludCAgICAgICAgKHggOiBudW1iZXIsIHkgOiBudW1iZXIpIDogRWxlbWVudDtcclxuICAgIGVsZW1lbnRzRnJvbVBvaW50ICAgICAgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKSA6IEVsZW1lbnRbXTtcclxuICAgIGNhcmV0UG9zaXRpb25Gcm9tUG9pbnQgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKTsgLy8gPT4gQ2FyZXRQb3NpdGlvblxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEVsZW1lbnRXaXRoU2hhZG93Um9vdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIHNoYWRvd1Jvb3QgIDogU2hhZG93Um9vdDtcclxufTsqL1xyXG5jb25zdCBkcmFnUG9pbnRlcklkID0gXCJkcmFnUG9pbnRlclwiO1xyXG50eXBlIFBvaW50ZXIgPSB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xyXG5jbGFzcyBEcmFnTWFuYWdlciB7XHJcbiAgICBkcmFnZ2luZ1BvaW50ZXIgICAgID0gbmV3IE1hcDxzdHJpbmcsIFBvaW50ZXI+KCk7XHJcbiAgICBkcmFnZ2VkU3RydWN0dXJlcyAgID0gbmV3IE1hcDxzdHJpbmcsIEFseERyYWdnYWJsZSB8IERyYWdFdmVudD4oKTtcclxuICAgIGRyb3Bab25lcyAgICAgICAgICAgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lID4oKTtcclxuICAgIC8vY29uc3RydWN0b3IoKSB7fVxyXG4gICAgcHJlU3RhcnREcmFnKCBpZFBvaW50ZXI6IHN0cmluZywgZHJhZ2dlZDogQWx4RHJhZ2dhYmxlLCB4OiBudW1iZXIsIHk6IG51bWJlclxyXG4gICAgICAgICAgICAgICAgLCBkZWxheTogbnVtYmVyLCBkaXN0OiBudW1iZXIpIDogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInByZVN0YXJ0RHJhZ1wiLCBpZFBvaW50ZXIsIGRyYWdnZWQsIHgsIHksIGRlbGF5KTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlciAgLnNldChpZFBvaW50ZXIsIHt4OiB4LCB5OiB5fSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHB0ciAgID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ29nbyAgPSBwdHIgJiYgKE1hdGguYWJzKHggLSBwdHIueCkgKyBNYXRoLmFicyh5IC0gcHRyLnkpKSA8IGRpc3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlci5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgICAgIGlmKGdvZ28pIHtyZXNvbHZlKCk7fSBlbHNlIHtyZWplY3QoKTt9XHJcbiAgICAgICAgICAgIH0sIE1hdGgubWF4KDAsIGRlbGF5KSk7XHJcbiAgICAgICAgfSk7IC8vIEVuZCBvZiBQcm9taXNlXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc3RhcnREcmFnKGlkUG9pbnRlcjogc3RyaW5nLCBkcmFnZ2VkOiBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQsIHg6IG51bWJlciwgeTogbnVtYmVyKSA6IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnRkcmFnXCIsIGRyYWdnZWQsIHgsIHkpO1xyXG4gICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuc2V0KGlkUG9pbnRlciwgZHJhZ2dlZCk7XHJcbiAgICAgICAgbGV0IHBvc3NpYmxlRHJvcFpvbmVzID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4oKTtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGlmKCBkei5jaGVja0FjY2VwdChkcmFnZ2VkKSApIHtcclxuICAgICAgICAgICAgICAgIGR6LmFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRHJvcFpvbmVzLnNldChkei5yb290LCBkeik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRHJvcFpvbmVzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzQXNzb2NpYXRlZFRvRHJvcFpvbmUoZWxlbWVudDogRWxlbWVudCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcm9wWm9uZXMuaGFzKCBlbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0ZXJEcm9wWm9uZSggZHJvcHpvbmU6IEFseERyb3B6b25lICkge1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLnNldChkcm9wem9uZS5yb290LCBkcm9wem9uZSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdW5yZWdpc3RlckRyb3Bab25lKCBkcm9wem9uZTogQWx4RHJvcHpvbmUgKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuZGVsZXRlKGRyb3B6b25lLnJvb3QpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvaW50ZXJNb3ZlKGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcHRyID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYocHRyKSB7cHRyLnggPSB4OyBwdHIueSA9IHk7fVxyXG4gICAgICAgIGxldCBkcmFnZ2VkID0gdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihkcmFnZ2VkICYmIGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgZHJhZ2dlZC5tb3ZlKHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZHJhZ2dlZCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvaW50ZXJSZWxlYXNlKGlkUG9pbnRlcjogc3RyaW5nKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBkcmFnZ2VkID0gdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihkcmFnZ2VkKSB7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnZWQuc3RvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIgIC5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICByZXR1cm4gZHJhZ2dlZCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59XHJcbmxldCBETSA9IG5ldyBEcmFnTWFuYWdlcigpO1xyXG5cclxubGV0IGRyYWdEcm9wSW5pdCA9IGZhbHNlO1xyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiBcIipbYWx4LWRyYWdkcm9wXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHhEcmFnRHJvcCB7XHJcbiAgICBuYkRyYWdFbnRlciA9IDA7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBpZihkcmFnRHJvcEluaXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvciggXCJEbyBub3QgY3JlYXRlIG11bHRpcGxlIGluc3RhbmNlIG9mIGRpcmVjdGl2ZSBhbHgtZHJhZ2Ryb3AgIVwiICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIFwiQWx4RHJhZ0Ryb3AgZW5hYmxlZCAhXCIpO1xyXG4gICAgICAgICAgICBkcmFnRHJvcEluaXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZUZlZWRiYWNrRm9yRHJhZ1BvaW50ZXIoKSB7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlciA9IDA7XHJcbiAgICAgICAgRE0uZHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IHtcclxuICAgICAgICAgICAgZHoucmVtb3ZlUG9pbnRlckhvdmVyICAgICAgICAgICAoZHJhZ1BvaW50ZXJJZCk7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZURyb3BDYW5kaWRhdGVQb2ludGVyICAgKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJvcFwiLCBbXCIkZXZlbnRcIl0gKSBkcm9wKCBlICkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCBcImRvY3VtZW50IGRyb3BcIiwgZSApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ292ZXJcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ292ZXIoIGUgKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiZG9jdW1lbnQgZHJhZ292ZXJcIiwgZSApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ2VudGVyXCIsIFtcIiRldmVudFwiXSApIGRyYWdlbnRlciggZSApIHtcclxuICAgICAgICB0aGlzLm5iRHJhZ0VudGVyKys7XHJcbiAgICAgICAgaWYodGhpcy5uYkRyYWdFbnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICBETS5zdGFydERyYWcoZHJhZ1BvaW50ZXJJZCwgZSwgLTEsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcmFnbGVhdmVcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ2xlYXZlKCBlICkge1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXItLTtcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgICAgICAgICBETS5wb2ludGVyUmVsZWFzZSggZHJhZ1BvaW50ZXJJZCApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyYWdlbmRcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ2VuZCggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyUmVsZWFzZSggZHJhZ1BvaW50ZXJJZCApO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IG1vdXNlbW92ZVwiLCBbXCIkZXZlbnRcIl0gKSBtb3VzZW1vdmUoIGUgKSB7XHJcbiAgICAgICAgRE0ucG9pbnRlck1vdmUgICAoXCJtb3VzZVwiLCBlLmNsaWVudFgsIGUuY2xpZW50WSk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBtb3VzZXVwXCIgICwgW1wiJGV2ZW50XCJdICkgbW91c2V1cCAgKCBlICkge1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKFwibW91c2VcIik7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiB0b3VjaG1vdmVcIiwgW1wiJGV2ZW50XCJdICkgdG91Y2htb3ZlKCBlICkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2g6VG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChETS5wb2ludGVyTW92ZSh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogdG91Y2hlbmRcIiAsIFtcIiRldmVudFwiXSApIHRvdWNoZW5kICggZSApIHtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaCA6IFRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiggRE0ucG9pbnRlclJlbGVhc2UodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpKSApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBvZmZzZXRFbGVtZW50ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSA9PiB7XHJcbiAgICBsZXQgbGVmdCA9IDAsIHRvcCA9IDA7XHJcbiAgICB3aGlsZSAoZWxlbWVudCkge1xyXG4gICAgICAgIHRvcCAgKz0gZWxlbWVudC5vZmZzZXRUb3AgIC0gZWxlbWVudC5zY3JvbGxUb3AgICsgZWxlbWVudC5jbGllbnRUb3A7XHJcbiAgICAgICAgbGVmdCArPSBlbGVtZW50Lm9mZnNldExlZnQgLSBlbGVtZW50LnNjcm9sbExlZnQgKyBlbGVtZW50LmNsaWVudExlZnQ7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtsZWZ0OiBsZWZ0LCB0b3A6IHRvcH07IC8vICsgZWxlbWVudC5zY3JvbGxUb3A7IC8vd2luZG93LnNjcm9sbFk7XHJcbn07XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiBcIipbYWx4LWRyYWdnYWJsZV1cIlxyXG59KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJhZ2dhYmxlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgQElucHV0IChcImFseC1kcmFnZ2FibGVcIiApIGRyYWdnZWREYXRhIDogYW55O1xyXG4gICAgQElucHV0IChcImFseC1zdGFydC1kZWxheVwiKSBzdGFydERlbGF5IDogbnVtYmVyO1xyXG4gICAgQElucHV0IChcImFseC1zdGFydC1kaXN0YW5jZVwiKSBzdGFydERpc3RhbmNlOiBudW1iZXI7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctc3RhcnRcIikgb25EcmFnU3RhcnQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbmRcIiAgKSBvbkRyYWdFbmQgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgcHJpdmF0ZSBpc0JlaW5nRHJhZ2dlZCAgICAgICAgICAgICAgICA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgY2xvbmVOb2RlICAgICAgICAgICAgICAgICAgICAgOiBIVE1MRWxlbWVudCA9IG51bGw7XHJcbiAgICBwcml2YXRlIGN1cnJlbnREcm9wWm9uZSAgICAgICAgICAgICAgIDogQWx4RHJvcHpvbmU7XHJcbiAgICBwcml2YXRlIHBvc3NpYmxlRHJvcFpvbmVzID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4oKTtcclxuICAgIHByaXZhdGUgZHggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGR5IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBveCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgb3kgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR4IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0eSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaWRQb2ludGVyIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSByb290IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbDogRWxlbWVudFJlZikge1xyXG4gICAgICAgIHRoaXMucm9vdCA9IGVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgaWYoIWRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJZb3Ugc2hvdWxkIGFkZCBvbmUgYWx4LWRyYWdkcm9wIGF0dHJpYnV0ZSB0byB5b3VyIGNvZGUgYmVmb3JlIHVzaW5nIGFseC1kcmFnZ2FibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIFwibmV3IGluc3RhbmNlIG9mIEFseERyYWdnYWJsZVwiLCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKFwibW91c2Vkb3duXCIgLCBbXCIkZXZlbnRcIl0pIG9uTW91c2VEb3duIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwibW91c2Vkb3duIG9uXCIsIHRoaXMsIGV2ZW50KTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHRoaXMucHJlc3RhcnQoXCJtb3VzZVwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIFtcIiRldmVudFwiXSkgb25Ub3VjaFN0YXJ0KGV2ZW50OiBNeVRvdWNoRXZlbnQpIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwidG91Y2hzdGFydCBvblwiLCB0aGlzKTtcclxuICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaCA6IFRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgdGhpcy5wcmVzdGFydCh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXN0YXJ0KGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIERNLnByZVN0YXJ0RHJhZyhpZFBvaW50ZXIsIHRoaXMsIHgsIHksIHRoaXMuc3RhcnREZWxheSB8fCAxMDAsIHRoaXMuc3RhcnREaXN0YW5jZSB8fCAxMCkudGhlbihcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydChpZFBvaW50ZXIsIHgsIHkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKFwic2tpcCB0aGUgZHJhZ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzQmVpbmdEcmFnZ2VkICkge1xyXG4gICAgICAgICAgICB0aGlzLmlzQmVpbmdEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5pZFBvaW50ZXIgPSBpZFBvaW50ZXI7XHJcbiAgICAgICAgICAgIC8vIGxldCBiYm94ID0gdGhpcy5yb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gb2Zmc2V0RWxlbWVudCh0aGlzLnJvb3QpO1xyXG4gICAgICAgICAgICB0aGlzLm94ID0geDsgdGhpcy5veSA9IHk7XHJcbiAgICAgICAgICAgIHRoaXMuZHggPSB4IC0gb2Zmc2V0LmxlZnQ7IC8vIE1hdGgucm91bmQoYmJveC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0KTtcclxuICAgICAgICAgICAgdGhpcy5keSA9IHkgLSBvZmZzZXQudG9wIDsgLy8gTWF0aC5yb3VuZChiYm94LnRvcCAgKyB3aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICAvKmxldCBEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWJ1Z1wiKTtcclxuICAgICAgICAgICAgRC5pbm5lckhUTUwgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyBcIiA7IFwiICsgd2luZG93LnBhZ2VZT2Zmc2V0ICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgd2luZG93LnNjcm9sbFggKyBcIiA7IFwiICsgd2luZG93LnNjcm9sbFkgKyBcIjxici8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLnJvb3Qub2Zmc2V0TGVmdCArIFwiIDsgXCIgKyB0aGlzLnJvb3Qub2Zmc2V0VG9wICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICsgYmJveC5sZWZ0ICsgXCIgOyBcIiArIGJib3gudG9wXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDsqL1xyXG4gICAgICAgICAgICB0aGlzLnR4ID0gdGhpcy5yb290Lm9mZnNldFdpZHRoIDsgLy8gYmJveC53aWR0aCA7XHJcbiAgICAgICAgICAgIHRoaXMudHkgPSB0aGlzLnJvb3Qub2Zmc2V0SGVpZ2h0OyAvLyBiYm94LmhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2xvbmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5keCArIHdpbmRvdy5wYWdlWE9mZnNldCkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRvcCAgPSAoeSAtIHRoaXMuZHkgKyB3aW5kb3cucGFnZVlPZmZzZXQpICsgXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcyA9IERNLnN0YXJ0RHJhZyhpZFBvaW50ZXIsIHRoaXMsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZVBvaW50ZXJIb3ZlciAgICAgICAgICAgKHRoaXMuaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgZHoucmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIgICAodGhpcy5pZFBvaW50ZXIpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmlzQmVpbmdEcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaWRQb2ludGVyID0gbnVsbDtcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5kcm9wKCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lID0gbnVsbDtcclxuICAgICAgICB0aGlzLm9uRHJhZ0VuZC5lbWl0KCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgdGhpcy5kZWxldGVDbG9uZSgpO1xyXG4gICAgfVxyXG4gICAgbW92ZSh4OiBudW1iZXIsIHk6IG51bWJlcikgOiB0aGlzIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA6IEVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5keCArIHdpbmRvdy5wYWdlWE9mZnNldCkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRvcCAgPSAoeSAtIHRoaXMuZHkgKyB3aW5kb3cucGFnZVlPZmZzZXQpICsgXCJweFwiO1xyXG4gICAgICAgICAgICAvLyBsZXQgcGFyZW50ID0gdGhpcy5jbG9uZU5vZGUucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgbGV0IHZpc2liaWxpdHkgPSB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5O1xyXG4gICAgICAgICAgICAvLyBwYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuY2xvbmVOb2RlICk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICBsZXQgdG9wID0gdGhpcy5jbG9uZU5vZGUuc3R5bGUudG9wO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50b3AgPSBcIjk5OTk5OTk5OXB4XCI7XHJcblxyXG4gICAgICAgICAgICAvLyBsZXQgTCA9IDxBcnJheTxFbGVtZW50Pj5teURvYy5lbGVtZW50c0Zyb21Qb2ludCh4LXdpbmRvdy5wYWdlWE9mZnNldCwgeS13aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gbXlEb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRvcCA9IHRvcDtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IHZpc2liaWxpdHk7XHJcbiAgICAgICAgICAgIC8vIHBhcmVudC5hcHBlbmRDaGlsZCggdGhpcy5jbG9uZU5vZGUgKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcmV2RHJvcFpvbmUgPSB0aGlzLmN1cnJlbnREcm9wWm9uZTtcclxuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG9uIHRvcCBvZiBhIGRyb3Bab25lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IHRoaXMucG9zc2libGVEcm9wWm9uZXMuZ2V0KCBlbGVtZW50ICk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge2JyZWFrO31cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSA8RWxlbWVudD5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJldkRyb3Bab25lICE9PSB0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocHJldkRyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkRyb3Bab25lLnJlbW92ZVBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuYXBwZW5kUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qdGhpcy5wb3NzaWJsZURyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiBkei5yZW1vdmVQb2ludGVySG92ZXIodGhpcy5pZFBvaW50ZXIpICk7XHJcbiAgICAgICAgICAgIHdoaWxlKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFyZSBvbiB0b3Agb2YgYSBkcm9wWm9uZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmdldCggZWxlbWVudCApO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5hcHBlbmRQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gPEVsZW1lbnQ+ZWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9Ki9cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkZWVwU3R5bGUob3JpZ2luYWw6IEVsZW1lbnQsIGNsb25lOiBFbGVtZW50KSB7XHJcbiAgICAgICAgaWYob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvcmlnaW5hbCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHQgPSBzdHlsZVtpXTtcclxuICAgICAgICAgICAgICAgIChjbG9uZSBhcyBIVE1MRWxlbWVudCkuc3R5bGVbYXR0XSA9IHN0eWxlW2F0dF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8b3JpZ2luYWwuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKG9yaWdpbmFsLmNoaWxkcmVuLml0ZW0oaSksIChjbG9uZSBhcyBIVE1MRWxlbWVudCkuY2hpbGRyZW4uaXRlbShpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZWxldGVDbG9uZSgpIHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSkge1xyXG4gICAgICAgICAgICBpZih0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2xvbmVOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0Q2xvbmUoKSA6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IDxIVE1MRWxlbWVudD50aGlzLnJvb3QuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAvLyBBcHBseSBjb21wdXRlZCBzdHlsZSA6XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKCB0aGlzLnJvb3QsIHRoaXMuY2xvbmVOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgY2xvbmUgb24gdGhlIERPTVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5wb3NpdGlvbiAgICAgICAgPSBcImFic29sdXRlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnpJbmRleCAgICAgICAgICA9IFwiOTk5XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkxlZnQgICAgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5Ub3AgICAgICAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luUmlnaHQgICAgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSAgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5vcGFjaXR5ICAgICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5jdXJzb3IgICAgICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50cmFuc2Zvcm0gICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5hbmltYXRpb24gICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50cmFuc2l0aW9uICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5jbGFzc0xpc3QuYWRkKCBcImFseC1jbG9uZU5vZGVcIiApO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5jbG9uZU5vZGUuc3R5bGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmVOb2RlO1xyXG4gICAgfVxyXG59XHJcblxyXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6IFwiKlthbHgtZHJvcHpvbmVdXCIgfSlcclxuZXhwb3J0IGNsYXNzIEFseERyb3B6b25lIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgbmJEcmFnRW50ZXIgPSAwO1xyXG4gICAgcHVibGljIHJvb3QgOiBIVE1MRWxlbWVudDtcclxuICAgIEBJbnB1dChcImFseC1kcmFnLWNzc1wiICAgICApIGRyYWdDU1MgICAgIDogc3RyaW5nO1xyXG4gICAgQElucHV0KFwiYWx4LWRyYWctb3Zlci1jc3NcIikgZHJhZ092ZXJDU1MgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtZHJhZy1vdmVyLWNzcy1mb3ItZHJhZ2dhYmxlXCIpIGRyYWdPdmVyQ1NTX3BvaW50ZXIgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtYWNjZXB0LWZ1bmN0aW9uXCIpIGFjY2VwdEZ1bmN0aW9uIDogKGRhdGE6IGFueSkgPT4gYm9vbGVhbjtcclxuICAgIEBPdXRwdXQoXCJhbHgtb25kcm9wXCIpICAgICBvbkRyb3BFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctc3RhcnRcIikgb25EcmFnU3RhcnQgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVuZFwiKSAgIG9uRHJhZ0VuZCAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbnRlclwiKSBvbkRyYWdFbnRlciAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctbGVhdmVcIikgb25EcmFnTGVhdmUgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICAgIC8vIENTUyB3aGVuIGNhbkRyb3AgYW5kIHN0YXJ0ZHJhZ2dhYmxlXHJcbiAgICBwcml2YXRlIGRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzIDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyc0hvdmVyICAgICAgICAgICA6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgaWYoIWRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IHNob3VsZCBhZGQgb25lIGFseC1kcmFnZHJvcCBhdHRyaWJ1dGUgdG8geW91ciBjb2RlIGJlZm9yZSB1c2luZyBhbHgtZHJvcHpvbmVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucm9vdCA9IGVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgLy8gdGhpcy5hY2NlcHRGY3QgPSBZRVM7XHJcbiAgICAgICAgRE0ucmVnaXN0ZXJEcm9wWm9uZSh0aGlzKTtcclxuICAgIH1cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJUT0RPOiBTaG91bGQgaW1wbGVtZW50IGRyb3B6b25lIGRlc3RveVwiKTtcclxuICAgICAgICBETS51bnJlZ2lzdGVyRHJvcFpvbmUoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdFbnRlciAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXIrKztcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdMZWF2ZSAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXItLTtcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcm9wXCIgLCBbXCIkZXZlbnRcIl0pIEJyb3dzZXJEcm9wIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJCcm93c2VyRHJvcFwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKCBkcmFnUG9pbnRlcklkICk7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5vbkRyb3BFbWl0dGVyLmVtaXQoIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgICBkcm9wKCBvYmogKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIHRoaXMsIFwiZHJvcFwiLCBvYmogKTtcclxuICAgICAgICB0aGlzLm9uRHJvcEVtaXR0ZXIuZW1pdCggb2JqICk7XHJcbiAgICB9XHJcbiAgICBjaGVja0FjY2VwdChkcmFnOiBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJlczogYm9vbGVhbjtcclxuICAgICAgICBpZiggZHJhZyBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSApIHtcclxuICAgICAgICAgICAgcmVzID0gdGhpcy5hY2NlcHRGdW5jdGlvbj90aGlzLmFjY2VwdEZ1bmN0aW9uKCBkcmFnLmRyYWdnZWREYXRhICk6dHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLmFjY2VwdEZ1bmN0aW9uP3RoaXMuYWNjZXB0RnVuY3Rpb24oIGRyYWcgKTp0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG4gICAgaGFzUG9pbnRlckhvdmVyKGlkUG9pbnRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPj0gMDtcclxuICAgIH1cclxuICAgIGFwcGVuZFBvaW50ZXJIb3ZlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgaWYoIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJzSG92ZXIucHVzaChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLmdldENsb25lKCkuY2xhc3NMaXN0LmFkZCggdGhpcy5kcmFnT3ZlckNTU19wb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VudGVyLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW50ZXIuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ092ZXJDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QuYWRkKCB0aGlzLmRyYWdPdmVyQ1NTICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVQb2ludGVySG92ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLnBvaW50ZXJzSG92ZXIuaW5kZXhPZihpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKCBwb3MgPj0gMCApIHtcclxuICAgICAgICAgICAgbGV0IGRyYWdnZWQgPSBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyc0hvdmVyLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmRyYWdPdmVyQ1NTX3BvaW50ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkLmdldENsb25lKCkuY2xhc3NMaXN0LnJlbW92ZSggdGhpcy5kcmFnT3ZlckNTU19wb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0xlYXZlLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnTGVhdmUuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9pbnRlcnNIb3Zlci5sZW5ndGggPT09IDAgJiYgdGhpcy5kcmFnT3ZlckNTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoIHRoaXMuZHJhZ092ZXJDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJhcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlclwiLCBpZFBvaW50ZXIsIHRoaXMgKTtcclxuICAgICAgICBpZiggdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMucHVzaCggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmluZGV4T2YoaWRQb2ludGVyKTtcclxuICAgICAgICBpZiggcG9zID49IDAgKSB7XHJcbiAgICAgICAgICAgIGxldCBkcmFnZ2VkID0gRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9
