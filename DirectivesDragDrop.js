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
    var DragManager, DM, dragDropInit, AlxDragDrop, AlxDraggable, AlxDropzone;
    // function noAcceptFct(draggedData) {return false;}
    function YES(data) { return true; }
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (DragDropUtils_1_1) {
                DragDropUtils_1 = DragDropUtils_1_1;
            }],
        execute: function() {
            ;
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
            DragManager = class DragManager {
                constructor() {
                    this.draggedStructures = new Map();
                    this.dropZones = new Map();
                }
                //constructor() {}
                startDrag(idPointer, dragged) {
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
                    let dragged = this.draggedStructures.get(idPointer);
                    if (dragged) {
                        dragged.move(x, y);
                    }
                    return dragged !== undefined;
                }
                pointerRelease(idPointer) {
                    let dragged = this.draggedStructures.get(idPointer);
                    if (dragged) {
                        dragged.stop();
                        this.draggedStructures.delete(idPointer);
                    }
                    return dragged !== undefined;
                }
            };
            DM = new DragManager();
            dragDropInit = false;
            AlxDragDrop = class AlxDragDrop {
                constructor() {
                    if (dragDropInit) {
                        console.error("Do not create multiple instance of directive alx-dragdrop !");
                    }
                    else {
                        console.log("AlxDragDrop enabled !");
                        dragDropInit = true;
                    }
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
            AlxDraggable = class AlxDraggable {
                constructor(el) {
                    this.isBeingDragged = false;
                    this.cloneNode = null;
                    this.possibleDropZones = new Map();
                    this.root = el.nativeElement;
                    if (!dragDropInit) {
                        console.error("You should add one alx-dragdrop attribute to your code before using alx-draggable");
                    }
                    //console.log( "new instance of AlxDraggable", this );
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
                    event.preventDefault();
                    event.stopPropagation();
                    for (let i = 0; i < event.changedTouches.length; i++) {
                        let touch = event.changedTouches.item(i);
                        this.start(touch.identifier.toString(), touch.clientX, touch.clientY);
                    }
                }
                start(idPointer, x, y) {
                    if (!this.isBeingDragged) {
                        this.isBeingDragged = true;
                        this.idPointer = idPointer;
                        let bbox = this.root.getBoundingClientRect();
                        this.ox = x;
                        this.oy = y;
                        this.dx = x - Math.round(bbox.left + window.pageXOffset);
                        this.dy = y - Math.round(bbox.top + window.pageYOffset);
                        this.tx = bbox.width;
                        this.ty = bbox.height; // console.log( "drag", this.tx, bbox.right - bbox.left );
                        this.possibleDropZones = DM.startDrag(idPointer, this);
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
                        dz.removeDropCandidatePointer(this.idPointer);
                        dz.removePointerHover(this.idPointer);
                    });
                    this.possibleDropZones.clear();
                    this.idPointer = null;
                    if (this.currentDropZone) {
                        this.currentDropZone.drop(this.data);
                    }
                    this.currentDropZone = null;
                }
                move(x, y) {
                    let element = null;
                    if (this.cloneNode === null) {
                        //if( Math.abs(x-this.ox) + Math.abs(y-this.oy) > 50 ) {
                        this.getClone();
                    }
                    if (this.cloneNode) {
                        this.cloneNode.style.left = (x - this.dx) + "px";
                        this.cloneNode.style.top = (y - this.dy) + "px";
                        let visibility = this.cloneNode.style.visibility;
                        this.cloneNode.style.visibility = "hidden";
                        // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
                        element = DragDropUtils_1.myDoc.elementFromPoint(x, y); //(x-window.pageXOffset, y-window.pageYOffset);
                        //console.log( "element", element );
                        this.cloneNode.style.visibility = visibility;
                        this.possibleDropZones.forEach(dz => dz.removePointerHover(this.idPointer));
                        while (element) {
                            // Check if we are on top of a dropZone
                            this.currentDropZone = this.possibleDropZones.get(element);
                            if (this.currentDropZone) {
                                this.currentDropZone.appendPointerHover(this.idPointer);
                                break;
                            }
                            element = element.parentElement;
                        }
                    }
                    return this;
                }
                getClone() {
                    if (this.cloneNode === null) {
                        this.cloneNode = this.root.cloneNode(true);
                        document.body.appendChild(this.cloneNode);
                        this.cloneNode.style.position = "absolute";
                        this.cloneNode.style.zIndex = "999";
                        this.cloneNode.classList.add("alx-cloneNode");
                    }
                    return this.cloneNode;
                }
            };
            __decorate([
                core_1.Input("alx-draggable"), 
                __metadata('design:type', Object)
            ], AlxDraggable.prototype, "data", void 0);
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
                __metadata('design:paramtypes', [(typeof (_a = typeof core_1.ElementRef !== 'undefined' && core_1.ElementRef) === 'function' && _a) || Object])
            ], AlxDraggable);
            exports_1("AlxDraggable", AlxDraggable);
            AlxDropzone = class AlxDropzone {
                constructor(el) {
                    this.onDropEmitter = new core_1.EventEmitter();
                    // CSS when canDrop and startdraggable
                    this.dropCandidateofPointers = [];
                    this.pointersHover = [];
                    if (!dragDropInit) {
                        console.error("You should add one alx-dragdrop attribute to your code before using alx-dropzone");
                    }
                    this.root = el.nativeElement;
                    this.acceptFct = YES;
                    DM.registerDropZone(this);
                }
                drop(obj) {
                    console.log(this, "drop", obj);
                    this.onDropEmitter.emit(obj);
                }
                checkAccept(drag) {
                    let res = this.acceptFct(drag.data);
                    return res;
                }
                appendPointerHover(idPointer) {
                    if (this.pointersHover.indexOf(idPointer) === -1) {
                        this.pointersHover.push(idPointer);
                        if (this.dragHoverCSS) {
                            this.root.classList.add(this.dragHoverCSS);
                        }
                    }
                }
                removePointerHover(idPointer) {
                    let pos = this.pointersHover.indexOf(idPointer);
                    if (pos >= 0) {
                        this.pointersHover.splice(pos, 1);
                        if (this.pointersHover.length === 0 && this.dragHoverCSS) {
                            this.root.classList.remove(this.dragHoverCSS);
                        }
                    }
                }
                appendDropCandidatePointer(idPointer) {
                    //console.log( "appendDropCandidatePointer", idPointer, this );
                    if (this.dropCandidateofPointers.indexOf(idPointer) === -1) {
                        this.dropCandidateofPointers.push(idPointer);
                        //console.log( "\tadd class", this.dragStartCSS );
                        if (this.dragStartCSS) {
                            this.root.classList.add(this.dragStartCSS);
                        }
                    }
                }
                removeDropCandidatePointer(idPointer) {
                    let pos = this.dropCandidateofPointers.indexOf(idPointer);
                    if (pos >= 0) {
                        this.dropCandidateofPointers.splice(pos, 1);
                        if (this.dropCandidateofPointers.length === 0 && this.dragStartCSS) {
                            this.root.classList.remove(this.dragStartCSS);
                        }
                    }
                }
                ngOnInit() {
                    //console.log( "Init dropzone", this.dragStartCSS, this );
                    //this.root.style
                }
            };
            __decorate([
                core_1.Input("alx-accept-fct"), 
                __metadata('design:type', Function)
            ], AlxDropzone.prototype, "acceptFct", void 0);
            __decorate([
                // = (data) => true;
                core_1.Input("alx-dragstart-css"), 
                __metadata('design:type', String)
            ], AlxDropzone.prototype, "dragStartCSS", void 0);
            __decorate([
                core_1.Input("alx-draghover-css"), 
                __metadata('design:type', String)
            ], AlxDropzone.prototype, "dragHoverCSS", void 0);
            __decorate([
                core_1.Output("alx-ondrop"), 
                __metadata('design:type', Object)
            ], AlxDropzone.prototype, "onDropEmitter", void 0);
            AlxDropzone = __decorate([
                core_1.Directive({ selector: "*[alx-dropzone]" }), 
                __metadata('design:paramtypes', [(typeof (_b = typeof core_1.ElementRef !== 'undefined' && core_1.ElementRef) === 'function' && _b) || Object])
            ], AlxDropzone);
            exports_1("AlxDropzone", AlxDropzone);
        }
    }
    var _a, _b;
});
//# sourceMappingURL=DirectivesDragDrop.js.map