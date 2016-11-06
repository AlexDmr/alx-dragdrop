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
    var DragManager, DM, dragDropInit, AlxDragDrop, offsetElement, AlxDraggable, AlxDropzone;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (DragDropUtils_1_1) {
                DragDropUtils_1 = DragDropUtils_1_1;
            }],
        execute: function() {
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
                        this.draggingPointer.delete(idPointer);
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
                        this.cloneNode.style.left = (x - this.dx) + "px";
                        this.cloneNode.style.top = (y - this.dy) + "px";
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
                }
                drop(obj) {
                    // console.log( this, "drop", obj );
                    this.onDropEmitter.emit(obj);
                }
                checkAccept(drag) {
                    return this.acceptFunction ? (drag.draggedData) : true;
                }
                hasPointerHover(idPointer) {
                    return this.pointersHover.indexOf(idPointer) >= 0;
                }
                appendPointerHover(idPointer) {
                    if (this.pointersHover.indexOf(idPointer) === -1) {
                        this.pointersHover.push(idPointer);
                        this.onDragEnter.emit(DM.draggedStructures.get(idPointer).draggedData);
                        if (this.dragOverCSS) {
                            this.root.classList.add(this.dragOverCSS);
                        }
                    }
                }
                removePointerHover(idPointer) {
                    let pos = this.pointersHover.indexOf(idPointer);
                    if (pos >= 0) {
                        this.pointersHover.splice(pos, 1);
                        this.onDragLeave.emit(DM.draggedStructures.get(idPointer).draggedData);
                        if (this.pointersHover.length === 0 && this.dragOverCSS) {
                            this.root.classList.remove(this.dragOverCSS);
                        }
                    }
                }
                appendDropCandidatePointer(idPointer) {
                    //console.log( "appendDropCandidatePointer", idPointer, this );
                    if (this.dropCandidateofPointers.indexOf(idPointer) === -1) {
                        this.onDragStart.emit(DM.draggedStructures.get(idPointer).draggedData);
                        this.dropCandidateofPointers.push(idPointer);
                        if (this.dragCSS) {
                            this.root.classList.add(this.dragCSS);
                        }
                    }
                }
                removeDropCandidatePointer(idPointer) {
                    let pos = this.dropCandidateofPointers.indexOf(idPointer);
                    if (pos >= 0) {
                        this.onDragEnd.emit(DM.draggedStructures.get(idPointer).draggedData);
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
                core_1.Input("alx-accept-fcuntion"), 
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
            AlxDropzone = __decorate([
                core_1.Directive({ selector: "*[alx-dropzone]" }), 
                __metadata('design:paramtypes', [core_1.ElementRef])
            ], AlxDropzone);
            exports_1("AlxDropzone", AlxDropzone);
        }
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7d0JBQy9DLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztZQTNFRztnQkFBQyxZQUFLLENBQUMsY0FBYyxDQUFNOzt3REFBQTtZQUMzQjtnQkFBQyxZQUFLLENBQUMsbUJBQW1CLENBQUM7OzREQUFBO1lBQzNCO2dCQUFDLFlBQUssQ0FBQyxxQkFBcUIsQ0FBQzs7K0RBQUE7WUFDN0I7Z0JBQUMsYUFBTSxDQUFDLFlBQVksQ0FBQzs7OERBQUE7WUFDckI7Z0JBQUMsYUFBTSxDQUFDLGdCQUFnQixDQUFDOzs0REFBQTtZQUN6QjtnQkFBQyxhQUFNLENBQUMsY0FBYyxDQUFDOzswREFBQTtZQUN2QjtnQkFBQyxhQUFNLENBQUMsZ0JBQWdCLENBQUM7OzREQUFBO1lBQ3pCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NERBQUE7WUFWN0I7Z0JBQUMsZ0JBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxDQUFDOzsyQkFBQTtZQUMzQyxxQ0E2RUMsQ0FBQSIsImZpbGUiOiJEaXJlY3RpdmVzRHJhZ0Ryb3AuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIEhvc3RMaXN0ZW5lciwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIE9uSW5pdCwgT25EZXN0cm95fSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQge215RG9jfSBmcm9tIFwiLi9EcmFnRHJvcFV0aWxzXCI7XHJcblxyXG4vKiBQb2x5ZmlsbCBUb3VjaEV2ZW50ICovXHJcbmludGVyZmFjZSBNeVRvdWNoRXZlbnQgZXh0ZW5kcyBUb3VjaEV2ZW50IHt9XHJcbi8qXHJcbmludGVyZmFjZSBTaGFkb3dSb290IGV4dGVuZHMgRG9jdW1lbnRGcmFnbWVudCB7XHJcbiAgICBzdHlsZVNoZWV0cyAgICAgOiBTdHlsZVNoZWV0TGlzdDtcclxuICAgIGlubmVySFRNTCAgICAgICA6IHN0cmluZztcclxuICAgIGhvc3QgICAgICAgICAgICA6IEVsZW1lbnQ7XHJcbiAgICBhY3RpdmVFbGVtZW50ICAgOiBFbGVtZW50O1xyXG4gICAgZWxlbWVudEZyb21Qb2ludCAgICAgICAgKHggOiBudW1iZXIsIHkgOiBudW1iZXIpIDogRWxlbWVudDtcclxuICAgIGVsZW1lbnRzRnJvbVBvaW50ICAgICAgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKSA6IEVsZW1lbnRbXTtcclxuICAgIGNhcmV0UG9zaXRpb25Gcm9tUG9pbnQgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKTsgLy8gPT4gQ2FyZXRQb3NpdGlvblxyXG59O1xyXG5cclxuaW50ZXJmYWNlIEVsZW1lbnRXaXRoU2hhZG93Um9vdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIHNoYWRvd1Jvb3QgIDogU2hhZG93Um9vdDtcclxufTsqL1xyXG50eXBlIFBvaW50ZXIgPSB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xyXG5jbGFzcyBEcmFnTWFuYWdlciB7XHJcbiAgICBkcmFnZ2luZ1BvaW50ZXIgICAgID0gbmV3IE1hcDxzdHJpbmcsIFBvaW50ZXI+KCk7XHJcbiAgICBkcmFnZ2VkU3RydWN0dXJlcyAgID0gbmV3IE1hcDxzdHJpbmcsIEFseERyYWdnYWJsZT4oKTtcclxuICAgIGRyb3Bab25lcyAgICAgICAgICAgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lID4oKTtcclxuICAgIC8vY29uc3RydWN0b3IoKSB7fVxyXG4gICAgcHJlU3RhcnREcmFnKCBpZFBvaW50ZXI6IHN0cmluZywgZHJhZ2dlZDogQWx4RHJhZ2dhYmxlLCB4OiBudW1iZXIsIHk6IG51bWJlclxyXG4gICAgICAgICAgICAgICAgLCBkZWxheTogbnVtYmVyLCBkaXN0OiBudW1iZXIpIDogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInByZVN0YXJ0RHJhZ1wiLCBpZFBvaW50ZXIsIGRyYWdnZWQsIHgsIHksIGRlbGF5KTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlciAgLnNldChpZFBvaW50ZXIsIHt4OiB4LCB5OiB5fSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHB0ciAgID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZ29nbyAgPSBwdHIgJiYgKE1hdGguYWJzKHggLSBwdHIueCkgKyBNYXRoLmFicyh5IC0gcHRyLnkpKSA8IGRpc3Q7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nUG9pbnRlci5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgICAgIGlmKGdvZ28pIHtyZXNvbHZlKCk7fSBlbHNlIHtyZWplY3QoKTt9XHJcbiAgICAgICAgICAgIH0sIE1hdGgubWF4KDAsIGRlbGF5KSk7XHJcbiAgICAgICAgfSk7IC8vIEVuZCBvZiBQcm9taXNlXHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc3RhcnREcmFnKGlkUG9pbnRlcjogc3RyaW5nLCBkcmFnZ2VkOiBBbHhEcmFnZ2FibGUsIHg6IG51bWJlciwgeTogbnVtYmVyKSA6IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4ge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwic3RhcnRkcmFnXCIsIGRyYWdnZWQsIHgsIHkpO1xyXG4gICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuc2V0KGlkUG9pbnRlciwgZHJhZ2dlZCk7XHJcbiAgICAgICAgbGV0IHBvc3NpYmxlRHJvcFpvbmVzID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZT4oKTtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiB7XHJcbiAgICAgICAgICAgIGlmKCBkei5jaGVja0FjY2VwdChkcmFnZ2VkKSApIHtcclxuICAgICAgICAgICAgICAgIGR6LmFwcGVuZERyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRHJvcFpvbmVzLnNldChkei5yb290LCBkeik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRHJvcFpvbmVzO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGlzQXNzb2NpYXRlZFRvRHJvcFpvbmUoZWxlbWVudDogRWxlbWVudCkgOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kcm9wWm9uZXMuaGFzKCBlbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcmVnaXN0ZXJEcm9wWm9uZSggZHJvcHpvbmU6IEFseERyb3B6b25lICkge1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLnNldChkcm9wem9uZS5yb290LCBkcm9wem9uZSk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgdW5yZWdpc3RlckRyb3Bab25lKCBkcm9wem9uZTogQWx4RHJvcHpvbmUgKSB7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuZGVsZXRlKGRyb3B6b25lLnJvb3QpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHBvaW50ZXJNb3ZlKGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgcHRyID0gdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYocHRyKSB7cHRyLnggPSB4OyBwdHIueSA9IHk7fVxyXG4gICAgICAgIGxldCBkcmFnZ2VkID0gdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKTtcclxuICAgICAgICBpZihkcmFnZ2VkKSB7XHJcbiAgICAgICAgICAgIGRyYWdnZWQubW92ZSh4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWdnZWQgIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb2ludGVyUmVsZWFzZShpZFBvaW50ZXI6IHN0cmluZykgOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZHJhZ2dlZCA9IHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoZHJhZ2dlZCkge1xyXG4gICAgICAgICAgICBkcmFnZ2VkLnN0b3AoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2VkU3RydWN0dXJlcy5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIgIC5kZWxldGUoaWRQb2ludGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRyYWdnZWQgIT09IHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG5sZXQgRE0gPSBuZXcgRHJhZ01hbmFnZXIoKTtcclxuXHJcbmxldCBkcmFnRHJvcEluaXQgPSBmYWxzZTtcclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogXCIqW2FseC1kcmFnZHJvcF1cIlxyXG59KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJhZ0Ryb3Age1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgaWYoZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIFwiRG8gbm90IGNyZWF0ZSBtdWx0aXBsZSBpbnN0YW5jZSBvZiBkaXJlY3RpdmUgYWx4LWRyYWdkcm9wICFcIiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBcIkFseERyYWdEcm9wIGVuYWJsZWQgIVwiKTtcclxuICAgICAgICAgICAgZHJhZ0Ryb3BJbml0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiBtb3VzZW1vdmVcIiwgW1wiJGV2ZW50XCJdICkgbW91c2Vtb3ZlKCBlICkge1xyXG4gICAgICAgIERNLnBvaW50ZXJNb3ZlICAgKFwibW91c2VcIiwgZS5jbGllbnRYLCBlLmNsaWVudFkpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogbW91c2V1cFwiICAsIFtcIiRldmVudFwiXSApIG1vdXNldXAgICggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyUmVsZWFzZShcIm1vdXNlXCIpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogdG91Y2htb3ZlXCIsIFtcIiRldmVudFwiXSApIHRvdWNobW92ZSggZSApIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoOlRvdWNoID0gZS5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICBpZiAoRE0ucG9pbnRlck1vdmUodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IHRvdWNoZW5kXCIgLCBbXCIkZXZlbnRcIl0gKSB0b3VjaGVuZCAoIGUgKSB7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8ZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2ggOiBUb3VjaCA9IGUuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgaWYoIERNLnBvaW50ZXJSZWxlYXNlKHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSkgKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5sZXQgb2Zmc2V0RWxlbWVudCA9IChlbGVtZW50OiBIVE1MRWxlbWVudCkgOiB7bGVmdDogbnVtYmVyLCB0b3A6IG51bWJlcn0gPT4ge1xyXG4gICAgbGV0IGxlZnQgPSAwLCB0b3AgPSAwO1xyXG4gICAgd2hpbGUgKGVsZW1lbnQpIHtcclxuICAgICAgICB0b3AgICs9IGVsZW1lbnQub2Zmc2V0VG9wICAtIGVsZW1lbnQuc2Nyb2xsVG9wICArIGVsZW1lbnQuY2xpZW50VG9wO1xyXG4gICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IC0gZWxlbWVudC5zY3JvbGxMZWZ0ICsgZWxlbWVudC5jbGllbnRMZWZ0O1xyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCBhcyBIVE1MRWxlbWVudDtcclxuICAgIH1cclxuICAgIHJldHVybiB7bGVmdDogbGVmdCwgdG9wOiB0b3B9OyAvLyArIGVsZW1lbnQuc2Nyb2xsVG9wOyAvL3dpbmRvdy5zY3JvbGxZO1xyXG59O1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogXCIqW2FseC1kcmFnZ2FibGVdXCJcclxufSlcclxuZXhwb3J0IGNsYXNzIEFseERyYWdnYWJsZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICAgIEBJbnB1dCAoXCJhbHgtZHJhZ2dhYmxlXCIgKSBkcmFnZ2VkRGF0YSA6IGFueTtcclxuICAgIEBJbnB1dCAoXCJhbHgtdG91Y2gtZGVsYXlcIikgdG91Y2hEZWxheSA6IG51bWJlcjtcclxuICAgIEBJbnB1dCAoXCJhbHgtdG91Y2gtZGlzdGFuY2VcIikgdG91Y2hEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLXN0YXJ0XCIpIG9uRHJhZ1N0YXJ0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctZW5kXCIgICkgb25EcmFnRW5kICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIHByaXZhdGUgaXNCZWluZ0RyYWdnZWQgICAgICAgICAgICAgICAgOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGNsb25lTm9kZSAgICAgICAgICAgICAgICAgICAgIDogSFRNTEVsZW1lbnQgPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50RHJvcFpvbmUgICAgICAgICAgICAgICA6IEFseERyb3B6b25lO1xyXG4gICAgcHJpdmF0ZSBwb3NzaWJsZURyb3Bab25lcyA9IG5ldyBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+KCk7XHJcbiAgICBwcml2YXRlIGR4IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBkeSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgb3ggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG95IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB0eCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHkgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGlkUG9pbnRlciA6IHN0cmluZztcclxuICAgIHByaXZhdGUgcm9vdCA6IEhUTUxFbGVtZW50O1xyXG4gICAgY29uc3RydWN0b3IoZWw6IEVsZW1lbnRSZWYpIHtcclxuICAgICAgICB0aGlzLnJvb3QgPSBlbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGlmKCFkcmFnRHJvcEluaXQpIHtcclxuICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IHNob3VsZCBhZGQgb25lIGFseC1kcmFnZHJvcCBhdHRyaWJ1dGUgdG8geW91ciBjb2RlIGJlZm9yZSB1c2luZyBhbHgtZHJhZ2dhYmxlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCBcIm5ldyBpbnN0YW5jZSBvZiBBbHhEcmFnZ2FibGVcIiwgdGhpcyApO1xyXG4gICAgfVxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcIm1vdXNlZG93blwiICwgW1wiJGV2ZW50XCJdKSBvbk1vdXNlRG93biAoZXZlbnQgOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcIm1vdXNlZG93biBvblwiLCB0aGlzLCBldmVudCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICB0aGlzLnN0YXJ0KFwibW91c2VcIiwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBbXCIkZXZlbnRcIl0pIG9uVG91Y2hTdGFydChldmVudDogTXlUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcInRvdWNoc3RhcnQgb25cIiwgdGhpcyk7XHJcbiAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBmb3IobGV0IGk9MDsgaTxldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgdG91Y2ggOiBUb3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIHRoaXMucHJlc3RhcnQodG91Y2guaWRlbnRpZmllci50b1N0cmluZygpLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmVzdGFydChpZFBvaW50ZXI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBETS5wcmVTdGFydERyYWcoaWRQb2ludGVyLCB0aGlzLCB4LCB5LCB0aGlzLnRvdWNoRGVsYXkgfHwgNTAsIHRoaXMudG91Y2hEaXN0YW5jZSB8fCAxMCkudGhlbihcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydChpZFBvaW50ZXIsIHgsIHkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKFwic2tpcCB0aGUgZHJhZ1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzQmVpbmdEcmFnZ2VkICkge1xyXG4gICAgICAgICAgICB0aGlzLmlzQmVpbmdEcmFnZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5pZFBvaW50ZXIgPSBpZFBvaW50ZXI7XHJcbiAgICAgICAgICAgIC8vIGxldCBiYm94ID0gdGhpcy5yb290LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gb2Zmc2V0RWxlbWVudCh0aGlzLnJvb3QpO1xyXG4gICAgICAgICAgICB0aGlzLm94ID0geDsgdGhpcy5veSA9IHk7XHJcbiAgICAgICAgICAgIHRoaXMuZHggPSB4IC0gb2Zmc2V0LmxlZnQ7IC8vIE1hdGgucm91bmQoYmJveC5sZWZ0ICsgd2luZG93LnBhZ2VYT2Zmc2V0KTtcclxuICAgICAgICAgICAgdGhpcy5keSA9IHkgLSBvZmZzZXQudG9wIDsgLy8gTWF0aC5yb3VuZChiYm94LnRvcCAgKyB3aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICAvKmxldCBEID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkZWJ1Z1wiKTtcclxuICAgICAgICAgICAgRC5pbm5lckhUTUwgPSB3aW5kb3cucGFnZVhPZmZzZXQgKyBcIiA7IFwiICsgd2luZG93LnBhZ2VZT2Zmc2V0ICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgd2luZG93LnNjcm9sbFggKyBcIiA7IFwiICsgd2luZG93LnNjcm9sbFkgKyBcIjxici8+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLnJvb3Qub2Zmc2V0TGVmdCArIFwiIDsgXCIgKyB0aGlzLnJvb3Qub2Zmc2V0VG9wICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICsgYmJveC5sZWZ0ICsgXCIgOyBcIiArIGJib3gudG9wXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDsqL1xyXG4gICAgICAgICAgICB0aGlzLnR4ID0gdGhpcy5yb290Lm9mZnNldFdpZHRoIDsgLy8gYmJveC53aWR0aCA7XHJcbiAgICAgICAgICAgIHRoaXMudHkgPSB0aGlzLnJvb3Qub2Zmc2V0SGVpZ2h0OyAvLyBiYm94LmhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy5vbkRyYWdTdGFydC5lbWl0KCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMgPSBETS5zdGFydERyYWcoaWRQb2ludGVyLCB0aGlzLCB4LCB5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIHRoaXMuaXNCZWluZ0RyYWdnZWQgPSBmYWxzZTtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSkge1xyXG4gICAgICAgICAgICBpZih0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2xvbmVOb2RlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMuZm9yRWFjaCggZHogPT4ge1xyXG4gICAgICAgICAgICBkei5yZW1vdmVQb2ludGVySG92ZXIgICAgICAgICAgICh0aGlzLmlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIGR6LnJlbW92ZURyb3BDYW5kaWRhdGVQb2ludGVyICAgKHRoaXMuaWRQb2ludGVyKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGhpcy5wb3NzaWJsZURyb3Bab25lcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaWRQb2ludGVyID0gbnVsbDtcclxuICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5kcm9wKCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lID0gbnVsbDtcclxuICAgICAgICB0aGlzLm9uRHJhZ0VuZC5lbWl0KCB0aGlzLmRyYWdnZWREYXRhICk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKHg6IG51bWJlciwgeTogbnVtYmVyKSA6IHRoaXMge1xyXG4gICAgICAgIGxldCBlbGVtZW50IDogRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRDbG9uZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5sZWZ0ID0gKHggLSB0aGlzLmR4KSArIFwicHhcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudG9wICA9ICh5IC0gdGhpcy5keSkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLmNsb25lTm9kZS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICBsZXQgdmlzaWJpbGl0eSA9IHRoaXMuY2xvbmVOb2RlLnN0eWxlLnZpc2liaWxpdHk7XHJcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5jbG9uZU5vZGUgKTtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICAgICAgICAgIC8vIGxldCBMID0gPEFycmF5PEVsZW1lbnQ+Pm15RG9jLmVsZW1lbnRzRnJvbVBvaW50KHgtd2luZG93LnBhZ2VYT2Zmc2V0LCB5LXdpbmRvdy5wYWdlWU9mZnNldCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBteURvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IHZpc2liaWxpdHk7XHJcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZCggdGhpcy5jbG9uZU5vZGUgKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBwcmV2RHJvcFpvbmUgPSB0aGlzLmN1cnJlbnREcm9wWm9uZTtcclxuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIG9uIHRvcCBvZiBhIGRyb3Bab25lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IHRoaXMucG9zc2libGVEcm9wWm9uZXMuZ2V0KCBlbGVtZW50ICk7XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge2JyZWFrO31cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSA8RWxlbWVudD5lbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocHJldkRyb3Bab25lICE9PSB0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocHJldkRyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkRyb3Bab25lLnJlbW92ZVBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuYXBwZW5kUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8qdGhpcy5wb3NzaWJsZURyb3Bab25lcy5mb3JFYWNoKCBkeiA9PiBkei5yZW1vdmVQb2ludGVySG92ZXIodGhpcy5pZFBvaW50ZXIpICk7XHJcbiAgICAgICAgICAgIHdoaWxlKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFyZSBvbiB0b3Agb2YgYSBkcm9wWm9uZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmdldCggZWxlbWVudCApO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZS5hcHBlbmRQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gPEVsZW1lbnQ+ZWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9Ki9cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBkZWVwU3R5bGUob3JpZ2luYWw6IEVsZW1lbnQsIGNsb25lOiBFbGVtZW50KSB7XHJcbiAgICAgICAgaWYob3JpZ2luYWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvcmlnaW5hbCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHQgPSBzdHlsZVtpXTtcclxuICAgICAgICAgICAgICAgIChjbG9uZSBhcyBIVE1MRWxlbWVudCkuc3R5bGVbYXR0XSA9IHN0eWxlW2F0dF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yKGxldCBpPTA7IGk8b3JpZ2luYWwuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKG9yaWdpbmFsLmNoaWxkcmVuLml0ZW0oaSksIGNsb25lLmNoaWxkcmVuLml0ZW0oaSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0Q2xvbmUoKSA6IE5vZGUge1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlID0gPEhUTUxFbGVtZW50PnRoaXMucm9vdC5jbG9uZU5vZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIC8vIEFwcGx5IGNvbXB1dGVkIHN0eWxlIDpcclxuICAgICAgICAgICAgdGhpcy5kZWVwU3R5bGUoIHRoaXMucm9vdCwgdGhpcy5jbG9uZU5vZGUpO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5zZXJ0IHRoZSBjbG9uZSBvbiB0aGUgRE9NXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuY2xvbmVOb2RlICk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnBvc2l0aW9uICAgICA9IFwiYWJzb2x1dGVcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUuekluZGV4ICAgICAgID0gXCI5OTlcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luTGVmdCAgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpblRvcCAgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5SaWdodCAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luQm90dG9tID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLmNsYXNzTGlzdC5hZGQoIFwiYWx4LWNsb25lTm9kZVwiICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmNsb25lTm9kZTtcclxuICAgIH1cclxufVxyXG5cclxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiBcIipbYWx4LWRyb3B6b25lXVwiIH0pXHJcbmV4cG9ydCBjbGFzcyBBbHhEcm9wem9uZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICAgIHB1YmxpYyByb290IDogSFRNTEVsZW1lbnQ7XHJcbiAgICBASW5wdXQoXCJhbHgtZHJhZy1jc3NcIiAgICAgKSBkcmFnQ1NTICAgICA6IHN0cmluZztcclxuICAgIEBJbnB1dChcImFseC1kcmFnLW92ZXItY3NzXCIpIGRyYWdPdmVyQ1NTIDogc3RyaW5nO1xyXG4gICAgQElucHV0KFwiYWx4LWFjY2VwdC1mY3VudGlvblwiKSBhY2NlcHRGdW5jdGlvbiA6IChkYXRhOiBhbnkpID0+IGJvb2xlYW47XHJcbiAgICBAT3V0cHV0KFwiYWx4LW9uZHJvcFwiKSAgICAgb25Ecm9wRW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLXN0YXJ0XCIpIG9uRHJhZ1N0YXJ0ICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1lbmRcIikgICBvbkRyYWdFbmQgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctZW50ZXJcIikgb25EcmFnRW50ZXIgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWxlYXZlXCIpIG9uRHJhZ0xlYXZlICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgICAvLyBDU1Mgd2hlbiBjYW5Ecm9wIGFuZCBzdGFydGRyYWdnYWJsZVxyXG4gICAgcHJpdmF0ZSBkcm9wQ2FuZGlkYXRlb2ZQb2ludGVycyA6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcnNIb3ZlciAgICAgICAgICAgOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBjb25zdHJ1Y3RvcihlbDogRWxlbWVudFJlZikge1xyXG4gICAgICAgIGlmKCFkcmFnRHJvcEluaXQpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIllvdSBzaG91bGQgYWRkIG9uZSBhbHgtZHJhZ2Ryb3AgYXR0cmlidXRlIHRvIHlvdXIgY29kZSBiZWZvcmUgdXNpbmcgYWx4LWRyb3B6b25lXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJvb3QgPSBlbC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIC8vIHRoaXMuYWNjZXB0RmN0ID0gWUVTO1xyXG4gICAgICAgIERNLnJlZ2lzdGVyRHJvcFpvbmUodGhpcyk7XHJcbiAgICB9XHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICAvL1xyXG4gICAgfVxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIFwiVE9ETzogU2hvdWxkIGltcGxlbWVudCBkcm9wem9uZSBkZXN0b3lcIik7XHJcbiAgICB9XHJcbiAgICBkcm9wKCBvYmogKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coIHRoaXMsIFwiZHJvcFwiLCBvYmogKTtcclxuICAgICAgICB0aGlzLm9uRHJvcEVtaXR0ZXIuZW1pdCggb2JqICk7XHJcbiAgICB9XHJcbiAgICBjaGVja0FjY2VwdChkcmFnOiBBbHhEcmFnZ2FibGUpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYWNjZXB0RnVuY3Rpb24/KCBkcmFnLmRyYWdnZWREYXRhICk6dHJ1ZTtcclxuICAgIH1cclxuICAgIGhhc1BvaW50ZXJIb3ZlcihpZFBvaW50ZXI6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50ZXJzSG92ZXIuaW5kZXhPZihpZFBvaW50ZXIpID49IDA7XHJcbiAgICB9XHJcbiAgICBhcHBlbmRQb2ludGVySG92ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGlmKCB0aGlzLnBvaW50ZXJzSG92ZXIuaW5kZXhPZihpZFBvaW50ZXIpID09PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyc0hvdmVyLnB1c2goaWRQb2ludGVyKTtcclxuICAgICAgICAgICAgdGhpcy5vbkRyYWdFbnRlci5lbWl0KCBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKS5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyYWdPdmVyQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QuY2xhc3NMaXN0LmFkZCggdGhpcy5kcmFnT3ZlckNTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlUG9pbnRlckhvdmVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5wb2ludGVyc0hvdmVyLmluZGV4T2YoaWRQb2ludGVyKTtcclxuICAgICAgICBpZiggcG9zID49IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnNIb3Zlci5zcGxpY2UocG9zLCAxKTtcclxuICAgICAgICAgICAgdGhpcy5vbkRyYWdMZWF2ZS5lbWl0KCBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKS5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICBpZih0aGlzLnBvaW50ZXJzSG92ZXIubGVuZ3RoID09PSAwICYmIHRoaXMuZHJhZ092ZXJDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdPdmVyQ1NTICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyggXCJhcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlclwiLCBpZFBvaW50ZXIsIHRoaXMgKTtcclxuICAgICAgICBpZiggdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5pbmRleE9mKGlkUG9pbnRlcikgPT09IC0xICkge1xyXG4gICAgICAgICAgICB0aGlzLm9uRHJhZ1N0YXJ0LmVtaXQoIERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMucHVzaCggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVtb3ZlRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmluZGV4T2YoaWRQb2ludGVyKTtcclxuICAgICAgICBpZiggcG9zID49IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25EcmFnRW5kLmVtaXQoIERNLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpLmRyYWdnZWREYXRhICk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMuc3BsaWNlKHBvcywgMSk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMubGVuZ3RoID09PSAwICYmIHRoaXMuZHJhZ0NTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5yZW1vdmUoIHRoaXMuZHJhZ0NTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=
