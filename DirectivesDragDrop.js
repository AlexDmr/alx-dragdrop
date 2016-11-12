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
                        this.onDragStart.emit(this.draggedData);
                        this.possibleDropZones = DM.startDrag(idPointer, this, x, y);
                    }
                }
                stop() {
                    this.isBeingDragged = false;
                    if (this.cloneNode) {
                        if (this.cloneNode.parentNode) {
                            this.cloneNode.parentNode.removeChild(this.cloneNode);
                        }
                        this.cloneNode = null;
                    }
                    this.possibleDropZones.forEach(dz => {
                        dz.removePointerHover(this.idPointer);
                        dz.removeDropCandidatePointer(this.idPointer);
                    });
                    this.possibleDropZones.clear();
                    this.idPointer = null;
                    if (this.currentDropZone) {
                        this.currentDropZone.drop(this.draggedData);
                    }
                    this.currentDropZone = null;
                    this.onDragEnd.emit(this.draggedData);
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,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WUFDM0I7Z0JBQUMsWUFBSyxDQUFDLHFCQUFxQixDQUFDOzsrREFBQTtZQUM3QjtnQkFBQyxhQUFNLENBQUMsWUFBWSxDQUFDOzs4REFBQTtZQUNyQjtnQkFBQyxhQUFNLENBQUMsZ0JBQWdCLENBQUM7OzREQUFBO1lBQ3pCO2dCQUFDLGFBQU0sQ0FBQyxjQUFjLENBQUM7OzBEQUFBO1lBQ3ZCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NERBQUE7WUFDekI7Z0JBQUMsYUFBTSxDQUFDLGdCQUFnQixDQUFDOzs0REFBQTtZQW9CekI7Z0JBQUMsbUJBQVksQ0FBQyxXQUFXLEVBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7OzsrREFBQTtZQU92QztnQkFBQyxtQkFBWSxDQUFDLFdBQVcsRUFBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OytEQUFBO1lBT3ZDO2dCQUFDLG1CQUFZLENBQUMsTUFBTSxFQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7MERBQUE7WUE3Q3RDO2dCQUFDLGdCQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQzs7MkJBQUE7WUFDM0MscUNBNkhDLENBQUEiLCJmaWxlIjoiRGlyZWN0aXZlc0RyYWdEcm9wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0LCBIb3N0TGlzdGVuZXIsIEV2ZW50RW1pdHRlciwgT3V0cHV0LCBPbkluaXQsIE9uRGVzdHJveX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHtteURvY30gZnJvbSBcIi4vRHJhZ0Ryb3BVdGlsc1wiO1xyXG5cclxuLyogUG9seWZpbGwgVG91Y2hFdmVudCAqL1xyXG5pbnRlcmZhY2UgTXlUb3VjaEV2ZW50IGV4dGVuZHMgVG91Y2hFdmVudCB7fVxyXG4vKlxyXG5pbnRlcmZhY2UgU2hhZG93Um9vdCBleHRlbmRzIERvY3VtZW50RnJhZ21lbnQge1xyXG4gICAgc3R5bGVTaGVldHMgICAgIDogU3R5bGVTaGVldExpc3Q7XHJcbiAgICBpbm5lckhUTUwgICAgICAgOiBzdHJpbmc7XHJcbiAgICBob3N0ICAgICAgICAgICAgOiBFbGVtZW50O1xyXG4gICAgYWN0aXZlRWxlbWVudCAgIDogRWxlbWVudDtcclxuICAgIGVsZW1lbnRGcm9tUG9pbnQgICAgICAgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKSA6IEVsZW1lbnQ7XHJcbiAgICBlbGVtZW50c0Zyb21Qb2ludCAgICAgICAoeCA6IG51bWJlciwgeSA6IG51bWJlcikgOiBFbGVtZW50W107XHJcbiAgICBjYXJldFBvc2l0aW9uRnJvbVBvaW50ICAoeCA6IG51bWJlciwgeSA6IG51bWJlcik7IC8vID0+IENhcmV0UG9zaXRpb25cclxufTtcclxuXHJcbmludGVyZmFjZSBFbGVtZW50V2l0aFNoYWRvd1Jvb3QgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBzaGFkb3dSb290ICA6IFNoYWRvd1Jvb3Q7XHJcbn07Ki9cclxuY29uc3QgZHJhZ1BvaW50ZXJJZCA9IFwiZHJhZ1BvaW50ZXJcIjtcclxudHlwZSBQb2ludGVyID0ge3g6IG51bWJlciwgeTogbnVtYmVyfTtcclxuY2xhc3MgRHJhZ01hbmFnZXIge1xyXG4gICAgZHJhZ2dpbmdQb2ludGVyICAgICA9IG5ldyBNYXA8c3RyaW5nLCBQb2ludGVyPigpO1xyXG4gICAgZHJhZ2dlZFN0cnVjdHVyZXMgICA9IG5ldyBNYXA8c3RyaW5nLCBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQ+KCk7XHJcbiAgICBkcm9wWm9uZXMgICAgICAgICAgID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZSA+KCk7XHJcbiAgICAvL2NvbnN0cnVjdG9yKCkge31cclxuICAgIHByZVN0YXJ0RHJhZyggaWRQb2ludGVyOiBzdHJpbmcsIGRyYWdnZWQ6IEFseERyYWdnYWJsZSwgeDogbnVtYmVyLCB5OiBudW1iZXJcclxuICAgICAgICAgICAgICAgICwgZGVsYXk6IG51bWJlciwgZGlzdDogbnVtYmVyKSA6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJwcmVTdGFydERyYWdcIiwgaWRQb2ludGVyLCBkcmFnZ2VkLCB4LCB5LCBkZWxheSk7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIgIC5zZXQoaWRQb2ludGVyLCB7eDogeCwgeTogeX0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPiggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBwdHIgICA9IHRoaXMuZHJhZ2dpbmdQb2ludGVyLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGdvZ28gID0gcHRyICYmIChNYXRoLmFicyh4IC0gcHRyLngpICsgTWF0aC5hYnMoeSAtIHB0ci55KSkgPCBkaXN0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgICAgICBpZihnb2dvKSB7cmVzb2x2ZSgpO30gZWxzZSB7cmVqZWN0KCk7fVxyXG4gICAgICAgICAgICB9LCBNYXRoLm1heCgwLCBkZWxheSkpO1xyXG4gICAgICAgIH0pOyAvLyBFbmQgb2YgUHJvbWlzZVxyXG4gICAgfVxyXG4gICAgcHVibGljIHN0YXJ0RHJhZyhpZFBvaW50ZXI6IHN0cmluZywgZHJhZ2dlZDogQWx4RHJhZ2dhYmxlIHwgRHJhZ0V2ZW50LCB4OiBudW1iZXIsIHk6IG51bWJlcikgOiBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInN0YXJ0ZHJhZ1wiLCBkcmFnZ2VkLCB4LCB5KTtcclxuICAgICAgICB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLnNldChpZFBvaW50ZXIsIGRyYWdnZWQpO1xyXG4gICAgICAgIGxldCBwb3NzaWJsZURyb3Bab25lcyA9IG5ldyBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+KCk7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuZm9yRWFjaCggZHogPT4ge1xyXG4gICAgICAgICAgICBpZiggZHouY2hlY2tBY2NlcHQoZHJhZ2dlZCkgKSB7XHJcbiAgICAgICAgICAgICAgICBkei5hcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlciggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZURyb3Bab25lcy5zZXQoZHoucm9vdCwgZHopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHJldHVybiBwb3NzaWJsZURyb3Bab25lcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0Fzc29jaWF0ZWRUb0Ryb3Bab25lKGVsZW1lbnQ6IEVsZW1lbnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJvcFpvbmVzLmhhcyggZWxlbWVudCApO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlZ2lzdGVyRHJvcFpvbmUoIGRyb3B6b25lOiBBbHhEcm9wem9uZSApIHtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5zZXQoZHJvcHpvbmUucm9vdCwgZHJvcHpvbmUpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHVucmVnaXN0ZXJEcm9wWm9uZSggZHJvcHpvbmU6IEFseERyb3B6b25lICkge1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLmRlbGV0ZShkcm9wem9uZS5yb290KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb2ludGVyTW92ZShpZFBvaW50ZXI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHB0ciA9IHRoaXMuZHJhZ2dpbmdQb2ludGVyLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKHB0cikge3B0ci54ID0geDsgcHRyLnkgPSB5O31cclxuICAgICAgICBsZXQgZHJhZ2dlZCA9IHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoZHJhZ2dlZCAmJiBkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgIGRyYWdnZWQubW92ZSh4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWdnZWQgIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb2ludGVyUmVsZWFzZShpZFBvaW50ZXI6IHN0cmluZykgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZHJhZ2dlZCA9IHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoZHJhZ2dlZCkge1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2VkLnN0b3AoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLmRlbGV0ZShpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlciAgLmRlbGV0ZShpZFBvaW50ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZHJhZ2dlZCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59XHJcbmxldCBETSA9IG5ldyBEcmFnTWFuYWdlcigpO1xyXG5cclxubGV0IGRyYWdEcm9wSW5pdCA9IGZhbHNlO1xyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiBcIipbYWx4LWRyYWdkcm9wXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHhEcmFnRHJvcCB7XHJcbiAgICBuYkRyYWdFbnRlciA9IDA7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBpZihkcmFnRHJvcEluaXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvciggXCJEbyBub3QgY3JlYXRlIG11bHRpcGxlIGluc3RhbmNlIG9mIGRpcmVjdGl2ZSBhbHgtZHJhZ2Ryb3AgIVwiICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coIFwiQWx4RHJhZ0Ryb3AgZW5hYmxlZCAhXCIpO1xyXG4gICAgICAgICAgICBkcmFnRHJvcEluaXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZUZlZWRiYWNrRm9yRHJhZ1BvaW50ZXIoKSB7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlciA9IDA7XHJcbiAgICAgICAgRE0uZHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IHtcclxuICAgICAgICAgICAgZHoucmVtb3ZlUG9pbnRlckhvdmVyICAgICAgICAgICAoZHJhZ1BvaW50ZXJJZCk7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZURyb3BDYW5kaWRhdGVQb2ludGVyICAgKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJvcFwiLCBbXCIkZXZlbnRcIl0gKSBkcm9wKCBlICkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCBcImRvY3VtZW50IGRyb3BcIiwgZSApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ292ZXJcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ292ZXIoIGUgKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiZG9jdW1lbnQgZHJhZ292ZXJcIiwgZSApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogZHJhZ2VudGVyXCIsIFtcIiRldmVudFwiXSApIGRyYWdlbnRlciggZSApIHtcclxuICAgICAgICB0aGlzLm5iRHJhZ0VudGVyKys7XHJcbiAgICAgICAgaWYodGhpcy5uYkRyYWdFbnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICBETS5zdGFydERyYWcoZHJhZ1BvaW50ZXJJZCwgZSwgLTEsIC0xKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBkcmFnbGVhdmVcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ2xlYXZlKCBlICkge1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXItLTtcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgICAgICAgICBETS5wb2ludGVyUmVsZWFzZSggZHJhZ1BvaW50ZXJJZCApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IGRyYWdlbmRcIiwgW1wiJGV2ZW50XCJdICkgZHJhZ2VuZCggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyUmVsZWFzZSggZHJhZ1BvaW50ZXJJZCApO1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRmVlZGJhY2tGb3JEcmFnUG9pbnRlcigpO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IG1vdXNlbW92ZVwiLCBbXCIkZXZlbnRcIl0gKSBtb3VzZW1vdmUoIGUgKSB7XHJcbiAgICAgICAgRE0ucG9pbnRlck1vdmUgICAoXCJtb3VzZVwiLCBlLmNsaWVudFgsIGUuY2xpZW50WSk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBtb3VzZXVwXCIgICwgW1wiJGV2ZW50XCJdICkgbW91c2V1cCAgKCBlICkge1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKFwibW91c2VcIik7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiB0b3VjaG1vdmVcIiwgW1wiJGV2ZW50XCJdICkgdG91Y2htb3ZlKCBlICkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2g6VG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmIChETS5wb2ludGVyTW92ZSh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogdG91Y2hlbmRcIiAsIFtcIiRldmVudFwiXSApIHRvdWNoZW5kICggZSApIHtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaCA6IFRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiggRE0ucG9pbnRlclJlbGVhc2UodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpKSApIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmxldCBvZmZzZXRFbGVtZW50ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA6IHtsZWZ0OiBudW1iZXIsIHRvcDogbnVtYmVyfSA9PiB7XHJcbiAgICBsZXQgbGVmdCA9IDAsIHRvcCA9IDA7XHJcbiAgICB3aGlsZSAoZWxlbWVudCkge1xyXG4gICAgICAgIHRvcCAgKz0gZWxlbWVudC5vZmZzZXRUb3AgIC0gZWxlbWVudC5zY3JvbGxUb3AgICsgZWxlbWVudC5jbGllbnRUb3A7XHJcbiAgICAgICAgbGVmdCArPSBlbGVtZW50Lm9mZnNldExlZnQgLSBlbGVtZW50LnNjcm9sbExlZnQgKyBlbGVtZW50LmNsaWVudExlZnQ7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtsZWZ0OiBsZWZ0LCB0b3A6IHRvcH07IC8vICsgZWxlbWVudC5zY3JvbGxUb3A7IC8vd2luZG93LnNjcm9sbFk7XHJcbn07XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiBcIipbYWx4LWRyYWdnYWJsZV1cIlxyXG59KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJhZ2dhYmxlIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgQElucHV0IChcImFseC1kcmFnZ2FibGVcIiApIGRyYWdnZWREYXRhIDogYW55O1xyXG4gICAgQElucHV0IChcImFseC10b3VjaC1kZWxheVwiKSB0b3VjaERlbGF5IDogbnVtYmVyO1xyXG4gICAgQElucHV0IChcImFseC10b3VjaC1kaXN0YW5jZVwiKSB0b3VjaERpc3RhbmNlOiBudW1iZXI7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctc3RhcnRcIikgb25EcmFnU3RhcnQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbmRcIiAgKSBvbkRyYWdFbmQgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgcHJpdmF0ZSBpc0JlaW5nRHJhZ2dlZCAgICAgICAgICAgICAgICA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgY2xvbmVOb2RlICAgICAgICAgICAgICAgICAgICAgOiBIVE1MRWxlbWVudCA9IG51bGw7XHJcbiAgICBwcml2YXRlIGN1cnJlbnREcm9wWm9uZSAgICAgICAgICAgICAgIDogQWx4RHJvcHpvbmU7XHJcbiAgICBwcml2YXRlIHBvc3NpYmxlRHJvcFpvbmVzID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4oKTtcclxuICAgIHByaXZhdGUgZHggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGR5IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBveCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgb3kgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR4IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0eSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaWRQb2ludGVyIDogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSByb290IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBjb25zdHJ1Y3RvcihlbDogRWxlbWVudFJlZikge1xyXG4gICAgICAgIHRoaXMucm9vdCA9IGVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgaWYoIWRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJZb3Ugc2hvdWxkIGFkZCBvbmUgYWx4LWRyYWdkcm9wIGF0dHJpYnV0ZSB0byB5b3VyIGNvZGUgYmVmb3JlIHVzaW5nIGFseC1kcmFnZ2FibGVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIFwibmV3IGluc3RhbmNlIG9mIEFseERyYWdnYWJsZVwiLCB0aGlzICk7XHJcbiAgICB9XHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKFwibW91c2Vkb3duXCIgLCBbXCIkZXZlbnRcIl0pIG9uTW91c2VEb3duIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwibW91c2Vkb3duIG9uXCIsIHRoaXMsIGV2ZW50KTtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIHRoaXMuc3RhcnQoXCJtb3VzZVwiLCBldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIFtcIiRldmVudFwiXSkgb25Ub3VjaFN0YXJ0KGV2ZW50OiBNeVRvdWNoRXZlbnQpIHtcclxuICAgICAgICAvL2NvbnNvbGUubG9nKFwidG91Y2hzdGFydCBvblwiLCB0aGlzKTtcclxuICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaCA6IFRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgdGhpcy5wcmVzdGFydCh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXN0YXJ0KGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIERNLnByZVN0YXJ0RHJhZyhpZFBvaW50ZXIsIHRoaXMsIHgsIHksIHRoaXMudG91Y2hEZWxheSB8fCA1MCwgdGhpcy50b3VjaERpc3RhbmNlIHx8IDEwKS50aGVuKFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0KGlkUG9pbnRlciwgeCwgeSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoXCJza2lwIHRoZSBkcmFnXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBzdGFydChpZFBvaW50ZXI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBpZiggIXRoaXMuaXNCZWluZ0RyYWdnZWQgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaXNCZWluZ0RyYWdnZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmlkUG9pbnRlciA9IGlkUG9pbnRlcjtcclxuICAgICAgICAgICAgLy8gbGV0IGJib3ggPSB0aGlzLnJvb3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSBvZmZzZXRFbGVtZW50KHRoaXMucm9vdCk7XHJcbiAgICAgICAgICAgIHRoaXMub3ggPSB4OyB0aGlzLm95ID0geTtcclxuICAgICAgICAgICAgdGhpcy5keCA9IHggLSBvZmZzZXQubGVmdDsgLy8gTWF0aC5yb3VuZChiYm94LmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQpO1xyXG4gICAgICAgICAgICB0aGlzLmR5ID0geSAtIG9mZnNldC50b3AgOyAvLyBNYXRoLnJvdW5kKGJib3gudG9wICArIHdpbmRvdy5wYWdlWU9mZnNldCk7XHJcbiAgICAgICAgICAgIC8qbGV0IEQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RlYnVnXCIpO1xyXG4gICAgICAgICAgICBELmlubmVySFRNTCA9IHdpbmRvdy5wYWdlWE9mZnNldCArIFwiIDsgXCIgKyB3aW5kb3cucGFnZVlPZmZzZXQgKyBcIjxici8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB3aW5kb3cuc2Nyb2xsWCArIFwiIDsgXCIgKyB3aW5kb3cuc2Nyb2xsWSArIFwiPGJyLz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMucm9vdC5vZmZzZXRMZWZ0ICsgXCIgOyBcIiArIHRoaXMucm9vdC5vZmZzZXRUb3AgKyBcIjxici8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gKyBiYm94LmxlZnQgKyBcIiA7IFwiICsgYmJveC50b3BcclxuICAgICAgICAgICAgICAgICAgICAgICAgOyovXHJcbiAgICAgICAgICAgIHRoaXMudHggPSB0aGlzLnJvb3Qub2Zmc2V0V2lkdGggOyAvLyBiYm94LndpZHRoIDtcclxuICAgICAgICAgICAgdGhpcy50eSA9IHRoaXMucm9vdC5vZmZzZXRIZWlnaHQ7IC8vIGJib3guaGVpZ2h0O1xyXG4gICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcyA9IERNLnN0YXJ0RHJhZyhpZFBvaW50ZXIsIHRoaXMsIHgsIHkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgdGhpcy5pc0JlaW5nRHJhZ2dlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5jbG9uZU5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZVBvaW50ZXJIb3ZlciAgICAgICAgICAgKHRoaXMuaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgZHoucmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIgICAodGhpcy5pZFBvaW50ZXIpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5pZFBvaW50ZXIgPSBudWxsO1xyXG4gICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lLmRyb3AoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIHRoaXMuZHJhZ2dlZERhdGEgKTtcclxuICAgIH1cclxuICAgIG1vdmUoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogdGhpcyB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgOiBFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmdldENsb25lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLmxlZnQgPSAoeCAtIHRoaXMuZHggKyB3aW5kb3cucGFnZVhPZmZzZXQpICsgXCJweFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS50b3AgID0gKHkgLSB0aGlzLmR5ICsgd2luZG93LnBhZ2VZT2Zmc2V0KSArIFwicHhcIjtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuY2xvbmVOb2RlLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGxldCB2aXNpYmlsaXR5ID0gdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eTtcclxuICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICAgLy8gbGV0IEwgPSA8QXJyYXk8RWxlbWVudD4+bXlEb2MuZWxlbWVudHNGcm9tUG9pbnQoeC13aW5kb3cucGFnZVhPZmZzZXQsIHktd2luZG93LnBhZ2VZT2Zmc2V0KTtcclxuICAgICAgICAgICAgZWxlbWVudCA9IG15RG9jLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gdmlzaWJpbGl0eTtcclxuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG5cclxuICAgICAgICAgICAgbGV0IHByZXZEcm9wWm9uZSA9IHRoaXMuY3VycmVudERyb3Bab25lO1xyXG4gICAgICAgICAgICB3aGlsZShlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhcmUgb24gdG9wIG9mIGEgZHJvcFpvbmVcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lID0gdGhpcy5wb3NzaWJsZURyb3Bab25lcy5nZXQoIGVsZW1lbnQgKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7YnJlYWs7fVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IDxFbGVtZW50PmVsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihwcmV2RHJvcFpvbmUgIT09IHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICBpZihwcmV2RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2RHJvcFpvbmUucmVtb3ZlUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5hcHBlbmRQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLyp0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IGR6LnJlbW92ZVBvaW50ZXJIb3Zlcih0aGlzLmlkUG9pbnRlcikgKTtcclxuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG9uIHRvcCBvZiBhIGRyb3Bab25lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IHRoaXMucG9zc2libGVEcm9wWm9uZXMuZ2V0KCBlbGVtZW50ICk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lLmFwcGVuZFBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSA8RWxlbWVudD5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH0qL1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRlZXBTdHlsZShvcmlnaW5hbDogRWxlbWVudCwgY2xvbmU6IEVsZW1lbnQpIHtcclxuICAgICAgICBpZihvcmlnaW5hbCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG9yaWdpbmFsKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGF0dCA9IHN0eWxlW2ldO1xyXG4gICAgICAgICAgICAgICAgKGNsb25lIGFzIEhUTUxFbGVtZW50KS5zdHlsZVthdHRdID0gc3R5bGVbYXR0XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IobGV0IGk9MDsgaTxvcmlnaW5hbC5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWVwU3R5bGUob3JpZ2luYWwuY2hpbGRyZW4uaXRlbShpKSwgKGNsb25lIGFzIEhUTUxFbGVtZW50KS5jaGlsZHJlbi5pdGVtKGkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldENsb25lKCkgOiBOb2RlIHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IDxIVE1MRWxlbWVudD50aGlzLnJvb3QuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAvLyBBcHBseSBjb21wdXRlZCBzdHlsZSA6XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKCB0aGlzLnJvb3QsIHRoaXMuY2xvbmVOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgY2xvbmUgb24gdGhlIERPTVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5wb3NpdGlvbiAgICAgPSBcImFic29sdXRlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnpJbmRleCAgICAgICA9IFwiOTk5XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkxlZnQgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5Ub3AgICAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luUmlnaHQgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5vcGFjaXR5ICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5jdXJzb3IgICAgICAgPSBcIlwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5jbGFzc0xpc3QuYWRkKCBcImFseC1jbG9uZU5vZGVcIiApO1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5jbG9uZU5vZGUuc3R5bGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmVOb2RlO1xyXG4gICAgfVxyXG59XHJcblxyXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6IFwiKlthbHgtZHJvcHpvbmVdXCIgfSlcclxuZXhwb3J0IGNsYXNzIEFseERyb3B6b25lIGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgbmJEcmFnRW50ZXIgPSAwO1xyXG4gICAgcHVibGljIHJvb3QgOiBIVE1MRWxlbWVudDtcclxuICAgIEBJbnB1dChcImFseC1kcmFnLWNzc1wiICAgICApIGRyYWdDU1MgICAgIDogc3RyaW5nO1xyXG4gICAgQElucHV0KFwiYWx4LWRyYWctb3Zlci1jc3NcIikgZHJhZ092ZXJDU1MgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtYWNjZXB0LWZ1bmN0aW9uXCIpIGFjY2VwdEZ1bmN0aW9uIDogKGRhdGE6IGFueSkgPT4gYm9vbGVhbjtcclxuICAgIEBPdXRwdXQoXCJhbHgtb25kcm9wXCIpICAgICBvbkRyb3BFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctc3RhcnRcIikgb25EcmFnU3RhcnQgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVuZFwiKSAgIG9uRHJhZ0VuZCAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbnRlclwiKSBvbkRyYWdFbnRlciAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctbGVhdmVcIikgb25EcmFnTGVhdmUgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICAgIC8vIENTUyB3aGVuIGNhbkRyb3AgYW5kIHN0YXJ0ZHJhZ2dhYmxlXHJcbiAgICBwcml2YXRlIGRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzIDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyc0hvdmVyICAgICAgICAgICA6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgaWYoIWRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IHNob3VsZCBhZGQgb25lIGFseC1kcmFnZHJvcCBhdHRyaWJ1dGUgdG8geW91ciBjb2RlIGJlZm9yZSB1c2luZyBhbHgtZHJvcHpvbmVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucm9vdCA9IGVsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgLy8gdGhpcy5hY2NlcHRGY3QgPSBZRVM7XHJcbiAgICAgICAgRE0ucmVnaXN0ZXJEcm9wWm9uZSh0aGlzKTtcclxuICAgIH1cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggXCJUT0RPOiBTaG91bGQgaW1wbGVtZW50IGRyb3B6b25lIGRlc3RveVwiKTtcclxuICAgICAgICBETS51bnJlZ2lzdGVyRHJvcFpvbmUoIHRoaXMgKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdFbnRlciAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXIrKztcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiAsIFtcIiRldmVudFwiXSkgQnJvd3NlckRyYWdMZWF2ZSAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIFwiQnJvd3NlckRyYWdFbnRlclwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIHRoaXMubmJEcmFnRW50ZXItLTtcclxuICAgICAgICBpZih0aGlzLm5iRHJhZ0VudGVyID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUG9pbnRlckhvdmVyKGRyYWdQb2ludGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJkcm9wXCIgLCBbXCIkZXZlbnRcIl0pIEJyb3dzZXJEcm9wIChldmVudCA6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggXCJCcm93c2VyRHJvcFwiLCB0aGlzLCBldmVudCApO1xyXG4gICAgICAgIERNLnBvaW50ZXJSZWxlYXNlKCBkcmFnUG9pbnRlcklkICk7XHJcbiAgICAgICAgdGhpcy5uYkRyYWdFbnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5vbkRyb3BFbWl0dGVyLmVtaXQoIGV2ZW50ICk7XHJcbiAgICB9XHJcbiAgICBkcm9wKCBvYmogKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIHRoaXMsIFwiZHJvcFwiLCBvYmogKTtcclxuICAgICAgICB0aGlzLm9uRHJvcEVtaXR0ZXIuZW1pdCggb2JqICk7XHJcbiAgICB9XHJcbiAgICBjaGVja0FjY2VwdChkcmFnOiBBbHhEcmFnZ2FibGUgfCBEcmFnRXZlbnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHJlczogYm9vbGVhbjtcclxuICAgICAgICBpZiggZHJhZyBpbnN0YW5jZW9mIEFseERyYWdnYWJsZSApIHtcclxuICAgICAgICAgICAgcmVzID0gdGhpcy5hY2NlcHRGdW5jdGlvbj90aGlzLmFjY2VwdEZ1bmN0aW9uKCBkcmFnLmRyYWdnZWREYXRhICk6dHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXMgPSB0aGlzLmFjY2VwdEZ1bmN0aW9uP3RoaXMuYWNjZXB0RnVuY3Rpb24oIGRyYWcgKTp0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgfVxyXG4gICAgaGFzUG9pbnRlckhvdmVyKGlkUG9pbnRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPj0gMDtcclxuICAgIH1cclxuICAgIGFwcGVuZFBvaW50ZXJIb3ZlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgaWYoIHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJzSG92ZXIucHVzaChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0VudGVyLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW50ZXIuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ092ZXJDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QuYWRkKCB0aGlzLmRyYWdPdmVyQ1NTICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZW1vdmVQb2ludGVySG92ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLnBvaW50ZXJzSG92ZXIuaW5kZXhPZihpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKCBwb3MgPj0gMCApIHtcclxuICAgICAgICAgICAgbGV0IGRyYWdnZWQgPSBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyc0hvdmVyLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ0xlYXZlLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnTGVhdmUuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHRoaXMucG9pbnRlcnNIb3Zlci5sZW5ndGggPT09IDAgJiYgdGhpcy5kcmFnT3ZlckNTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoIHRoaXMuZHJhZ092ZXJDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggXCJhcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlclwiLCBpZFBvaW50ZXIsIHRoaXMgKTtcclxuICAgICAgICBpZiggdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICBsZXQgZHJhZ2dlZCA9IERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBpZihkcmFnZ2VkIGluc3RhbmNlb2YgQWx4RHJhZ2dhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggZHJhZ2dlZCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMucHVzaCggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmluZGV4T2YoaWRQb2ludGVyKTtcclxuICAgICAgICBpZiggcG9zID49IDAgKSB7XHJcbiAgICAgICAgICAgIGxldCBkcmFnZ2VkID0gRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGlmKGRyYWdnZWQgaW5zdGFuY2VvZiBBbHhEcmFnZ2FibGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIGRyYWdnZWQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9
