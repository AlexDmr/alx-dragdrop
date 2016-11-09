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
            AlxDropzone = __decorate([
                core_1.Directive({ selector: "*[alx-dropzone]" }), 
                __metadata('design:paramtypes', [core_1.ElementRef])
            ], AlxDropzone);
            exports_1("AlxDropzone", AlxDropzone);
        }
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRpcmVjdGl2ZXNEcmFnRHJvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O3FCQThFSSxFQUFFLEVBRUYsWUFBWSxlQXVDWixhQUFhOzs7Ozs7Ozs7O1lBbkdqQjtnQkFBQTtvQkFDSSxvQkFBZSxHQUFPLElBQUksR0FBRyxFQUFtQixDQUFDO29CQUNqRCxzQkFBaUIsR0FBSyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztvQkFDdEQsY0FBUyxHQUFhLElBQUksR0FBRyxFQUF5QixDQUFDO2dCQXNEM0QsQ0FBQztnQkFyREcsa0JBQWtCO2dCQUNsQixZQUFZLENBQUUsU0FBaUIsRUFBRSxPQUFxQixFQUFFLENBQVMsRUFBRSxDQUFTLEVBQzlELEtBQWEsRUFBRSxJQUFZO29CQUNyQyxnRUFBZ0U7b0JBQ2hFLElBQUksQ0FBQyxlQUFlLENBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7b0JBQ3BELE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBUSxDQUFDLE9BQU8sRUFBRSxNQUFNO3dCQUN0QyxVQUFVLENBQUM7NEJBQ1AsSUFBSSxHQUFHLEdBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2hELElBQUksSUFBSSxHQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7NEJBQ3RFLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUN2QyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dDQUFBLE9BQU8sRUFBRSxDQUFDOzRCQUFBLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQUEsTUFBTSxFQUFFLENBQUM7NEJBQUEsQ0FBQzt3QkFDMUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCO2dCQUN6QixDQUFDO2dCQUNNLFNBQVMsQ0FBQyxTQUFpQixFQUFFLE9BQXFCLEVBQUUsQ0FBUyxFQUFFLENBQVM7b0JBQzNFLDJDQUEyQztvQkFDM0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQy9DLElBQUksaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7b0JBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFFLEVBQUU7d0JBQ3RCLEVBQUUsQ0FBQSxDQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUMzQixFQUFFLENBQUMsMEJBQTBCLENBQUUsU0FBUyxDQUFFLENBQUM7NEJBQzNDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN2QyxDQUFDO29CQUNMLENBQUMsQ0FBRSxDQUFDO29CQUNKLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztnQkFDN0IsQ0FBQztnQkFDTSxzQkFBc0IsQ0FBQyxPQUFnQjtvQkFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFFLE9BQU8sQ0FBRSxDQUFDO2dCQUN6QyxDQUFDO2dCQUNNLGdCQUFnQixDQUFFLFFBQXFCO29CQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDO2dCQUNNLGtCQUFrQixDQUFFLFFBQXFCO29CQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ00sV0FBVyxDQUFDLFNBQWlCLEVBQUUsQ0FBUyxFQUFFLENBQVM7b0JBQ3RELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM5QyxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUFBLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUFBLENBQUM7b0JBQy9CLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3BELEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7d0JBQ1QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLENBQUM7b0JBQ0QsTUFBTSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUM7Z0JBQ2pDLENBQUM7Z0JBQ00sY0FBYyxDQUFDLFNBQWlCO29CQUNuQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNwRCxFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUNULE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDZixJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDN0MsQ0FBQztvQkFDRCxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztnQkFDakMsQ0FBQztZQUNMLENBQUM7WUFDRyxFQUFFLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUV2QixZQUFZLEdBQUcsS0FBSyxDQUFDO1lBSXpCO2dCQUNJO29CQUNJLEVBQUUsQ0FBQSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBRSw2REFBNkQsQ0FBRSxDQUFDO29CQUNuRixDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUUsdUJBQXVCLENBQUMsQ0FBQzt3QkFDdEMsWUFBWSxHQUFHLElBQUksQ0FBQztvQkFDeEIsQ0FBQztnQkFDTCxDQUFDO2dCQUNrRCxTQUFTLENBQUUsQ0FBQztvQkFDM0QsRUFBRSxDQUFDLFdBQVcsQ0FBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ2tELE9BQU8sQ0FBSSxDQUFDO29CQUMzRCxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2dCQUNrRCxTQUFTLENBQUUsQ0FBQztvQkFDM0QsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMvQyxJQUFJLEtBQUssR0FBUyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0MsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDNUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDOzRCQUNuQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQ3hCLENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUNrRCxRQUFRLENBQUcsQ0FBQztvQkFDM0QsR0FBRyxDQUFBLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUMxQyxJQUFJLEtBQUssR0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0MsRUFBRSxDQUFBLENBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDOzRCQUNsRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7NEJBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDeEIsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBeEJHO2dCQUFDLG1CQUFZLENBQUUscUJBQXFCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBRTs7Ozt3REFBQTtZQUdsRDtnQkFBQyxtQkFBWSxDQUFFLG1CQUFtQixFQUFJLENBQUMsUUFBUSxDQUFDLENBQUU7Ozs7c0RBQUE7WUFHbEQ7Z0JBQUMsbUJBQVksQ0FBRSxxQkFBcUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFFOzs7O3dEQUFBO1lBU2xEO2dCQUFDLG1CQUFZLENBQUUsb0JBQW9CLEVBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBRTs7Ozt1REFBQTtZQTNCdEQ7Z0JBQUMsZ0JBQVMsQ0FBQztvQkFDUCxRQUFRLEVBQUUsaUJBQWlCO2lCQUM5QixDQUFDOzsyQkFBQTtZQUNGLHFDQWlDQyxDQUFBO1lBRUcsYUFBYSxHQUFHLENBQUMsT0FBb0I7Z0JBQ3JDLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixPQUFPLE9BQU8sRUFBRSxDQUFDO29CQUNiLEdBQUcsSUFBSyxPQUFPLENBQUMsU0FBUyxHQUFJLE9BQU8sQ0FBQyxTQUFTLEdBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQztvQkFDcEUsSUFBSSxJQUFJLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO29CQUNyRSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQTJCLENBQUM7Z0JBQ2xELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyx5Q0FBeUM7WUFDNUUsQ0FBQyxDQUFDO1lBS0Y7Z0JBa0JJLFlBQVksRUFBYztvQkFkQSxnQkFBVyxHQUFHLElBQUksbUJBQVksRUFBTyxDQUFDO29CQUN0QyxjQUFTLEdBQUssSUFBSSxtQkFBWSxFQUFPLENBQUM7b0JBQ3hELG1CQUFjLEdBQTRCLEtBQUssQ0FBQztvQkFDaEQsY0FBUyxHQUFxQyxJQUFJLENBQUM7b0JBRW5ELHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO29CQVV4RCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUM7b0JBQzdCLEVBQUUsQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO29CQUN0RyxDQUFDO29CQUNELHNEQUFzRDtnQkFDMUQsQ0FBQztnQkFDRCxRQUFRO29CQUNKLEVBQUU7Z0JBQ04sQ0FBQztnQkFDRCxXQUFXO29CQUNQLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEIsQ0FBQztnQkFDdUMsV0FBVyxDQUFFLEtBQWtCO29CQUNuRSwyQ0FBMkM7b0JBQzNDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFDdUMsWUFBWSxDQUFDLEtBQW1CO29CQUNwRSxxQ0FBcUM7b0JBQ3JDLDBCQUEwQjtvQkFDMUIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUN4QixHQUFHLENBQUEsQ0FBQyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzlDLElBQUksS0FBSyxHQUFXLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdFLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxRQUFRLENBQUMsU0FBaUIsRUFBRSxDQUFTLEVBQUUsQ0FBUztvQkFDNUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQ3hGO3dCQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsQ0FBQyxFQUNEO3dCQUNJLGtDQUFrQztvQkFDdEMsQ0FBQyxDQUNBLENBQUM7Z0JBQ1YsQ0FBQztnQkFDRCxLQUFLLENBQUMsU0FBaUIsRUFBRSxDQUFTLEVBQUUsQ0FBUztvQkFDekMsRUFBRSxDQUFBLENBQUUsQ0FBQyxJQUFJLENBQUMsY0FBZSxDQUFDLENBQUMsQ0FBQzt3QkFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7d0JBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO3dCQUMzQixnREFBZ0Q7d0JBQ2hELElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN6QixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsOENBQThDO3dCQUN6RSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFFLENBQUMsOENBQThDO3dCQUN6RTs7Ozs7dUNBS2U7d0JBQ2YsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDLGVBQWU7d0JBQ2pELElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxlQUFlO3dCQUNqRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7d0JBQzFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsSUFBSTtvQkFDQSxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztvQkFDNUIsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzs0QkFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDMUQsQ0FBQzt3QkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztvQkFDMUIsQ0FBQztvQkFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFFLEVBQUU7d0JBQzlCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBWSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ2pELEVBQUUsQ0FBQywwQkFBMEIsQ0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBRSxDQUFDO29CQUNKLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQ3RCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUN0QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7b0JBQ2xELENBQUM7b0JBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztnQkFDNUMsQ0FBQztnQkFDRCxJQUFJLENBQUMsQ0FBUyxFQUFFLENBQVM7b0JBQ3JCLElBQUksT0FBTyxHQUFhLElBQUksQ0FBQztvQkFDN0IsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3BCLENBQUM7b0JBQ0QsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDO3dCQUMxQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7d0JBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO3dCQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO3dCQUMzQywrRkFBK0Y7d0JBQy9GLE9BQU8sR0FBRyxxQkFBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFFdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQzt3QkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7d0JBRXJDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7d0JBQ3hDLE9BQU0sT0FBTyxFQUFFLENBQUM7NEJBQ1osdUNBQXVDOzRCQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLENBQUM7NEJBQzdELEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2dDQUFBLEtBQUssQ0FBQzs0QkFBQSxDQUFDOzRCQUNqQyxPQUFPLEdBQVksT0FBTyxDQUFDLGFBQWEsQ0FBQzt3QkFDN0MsQ0FBQzt3QkFDRCxFQUFFLENBQUEsQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZDLEVBQUUsQ0FBQSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0NBQ2QsWUFBWSxDQUFDLGtCQUFrQixDQUFFLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQzs0QkFDdEQsQ0FBQzs0QkFDRCxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQ0FDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7NEJBQzlELENBQUM7d0JBQ0wsQ0FBQztvQkFXTCxDQUFDO29CQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0QsU0FBUyxDQUFDLFFBQWlCLEVBQUUsS0FBYztvQkFDdkMsRUFBRSxDQUFBLENBQUMsUUFBUSxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pDLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDOUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQ3BDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbEIsS0FBcUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuRCxDQUFDO3dCQUNELEdBQUcsQ0FBQSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs0QkFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN0RSxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxRQUFRO29CQUNKLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLFNBQVMsR0FBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hELHlCQUF5Qjt3QkFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFFM0MsOEJBQThCO3dCQUM5QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7d0JBQzVDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBTyxVQUFVLENBQUM7d0JBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBUyxLQUFLLENBQUM7d0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBSyxHQUFHLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBTSxHQUFHLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBSSxHQUFHLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxlQUFlLENBQUUsQ0FBQztvQkFDcEQsQ0FBQztvQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDMUIsQ0FBQztZQUNMLENBQUM7WUE1S0c7Z0JBQUMsWUFBSyxDQUFFLGVBQWUsQ0FBRTs7NkRBQUE7WUFDekI7Z0JBQUMsWUFBSyxDQUFFLGlCQUFpQixDQUFDOzs0REFBQTtZQUMxQjtnQkFBQyxZQUFLLENBQUUsb0JBQW9CLENBQUM7OytEQUFBO1lBQzdCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NkRBQUE7WUFDekI7Z0JBQUMsYUFBTSxDQUFDLGNBQWMsQ0FBRzs7MkRBQUE7WUEwQnpCO2dCQUFDLG1CQUFZLENBQUMsV0FBVyxFQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7MkRBQUE7WUFNdkM7Z0JBQUMsbUJBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs0REFBQTtZQXhDM0M7Z0JBQUMsZ0JBQVMsQ0FBQztvQkFDUCxRQUFRLEVBQUUsa0JBQWtCO2lCQUMvQixDQUFDOzs0QkFBQTtZQUNGLHVDQTZLQyxDQUFBO1lBR0Q7Z0JBY0ksWUFBWSxFQUFjO29CQVRBLGtCQUFhLEdBQUcsSUFBSSxtQkFBWSxFQUFPLENBQUM7b0JBQ3hDLGdCQUFXLEdBQUssSUFBSSxtQkFBWSxFQUFPLENBQUM7b0JBQ3hDLGNBQVMsR0FBTyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFDeEMsZ0JBQVcsR0FBSyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFDeEMsZ0JBQVcsR0FBSyxJQUFJLG1CQUFZLEVBQU8sQ0FBQztvQkFFbEUsc0NBQXNDO29CQUM5Qiw0QkFBdUIsR0FBbUIsRUFBRSxDQUFDO29CQUM3QyxrQkFBYSxHQUE2QixFQUFFLENBQUM7b0JBRWpELEVBQUUsQ0FBQSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGtGQUFrRixDQUFDLENBQUM7b0JBQ3RHLENBQUM7b0JBQ0QsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO29CQUM3Qix3QkFBd0I7b0JBQ3hCLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxRQUFRO29CQUNKLEVBQUU7Z0JBQ04sQ0FBQztnQkFDRCxXQUFXO29CQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUUsd0NBQXdDLENBQUMsQ0FBQztnQkFDM0QsQ0FBQztnQkFDRCxJQUFJLENBQUUsR0FBRztvQkFDTCxvQ0FBb0M7b0JBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO2dCQUNuQyxDQUFDO2dCQUNELFdBQVcsQ0FBQyxJQUFrQjtvQkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUMsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLEdBQUMsSUFBSSxDQUFDO2dCQUN6RCxDQUFDO2dCQUNELGVBQWUsQ0FBQyxTQUFpQjtvQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFDRCxrQkFBa0IsQ0FBRSxTQUFpQjtvQkFDakMsRUFBRSxDQUFBLENBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUUsQ0FBQzt3QkFDekUsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7d0JBQ2hELENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUNELGtCQUFrQixDQUFFLFNBQWlCO29CQUNqQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDaEQsRUFBRSxDQUFBLENBQUUsR0FBRyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ1osSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUN6RSxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7d0JBQ25ELENBQUM7b0JBQ0wsQ0FBQztnQkFDTCxDQUFDO2dCQUNELDBCQUEwQixDQUFFLFNBQWlCO29CQUN6QywrREFBK0Q7b0JBQy9ELEVBQUUsQ0FBQSxDQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3dCQUN6RSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBRSxDQUFDO3dCQUMvQyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFDO3dCQUM1QyxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCwwQkFBMEIsQ0FBRSxTQUFpQjtvQkFDekMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDMUQsRUFBRSxDQUFBLENBQUUsR0FBRyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUUsQ0FBQzt3QkFDdkUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7d0JBQzVDLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFDO3dCQUMvQyxDQUFDO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7WUEzRUc7Z0JBQUMsWUFBSyxDQUFDLGNBQWMsQ0FBTTs7d0RBQUE7WUFDM0I7Z0JBQUMsWUFBSyxDQUFDLG1CQUFtQixDQUFDOzs0REFBQTtZQUMzQjtnQkFBQyxZQUFLLENBQUMscUJBQXFCLENBQUM7OytEQUFBO1lBQzdCO2dCQUFDLGFBQU0sQ0FBQyxZQUFZLENBQUM7OzhEQUFBO1lBQ3JCO2dCQUFDLGFBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7NERBQUE7WUFDekI7Z0JBQUMsYUFBTSxDQUFDLGNBQWMsQ0FBQzs7MERBQUE7WUFDdkI7Z0JBQUMsYUFBTSxDQUFDLGdCQUFnQixDQUFDOzs0REFBQTtZQUN6QjtnQkFBQyxhQUFNLENBQUMsZ0JBQWdCLENBQUM7OzREQUFBO1lBVjdCO2dCQUFDLGdCQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQzs7MkJBQUE7WUFDM0MscUNBNkVDLENBQUEiLCJmaWxlIjoiRGlyZWN0aXZlc0RyYWdEcm9wLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0LCBIb3N0TGlzdGVuZXIsIEV2ZW50RW1pdHRlciwgT3V0cHV0LCBPbkluaXQsIE9uRGVzdHJveX0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHtteURvY30gZnJvbSBcIi4vRHJhZ0Ryb3BVdGlsc1wiO1xyXG5cclxuLyogUG9seWZpbGwgVG91Y2hFdmVudCAqL1xyXG5pbnRlcmZhY2UgTXlUb3VjaEV2ZW50IGV4dGVuZHMgVG91Y2hFdmVudCB7fVxyXG4vKlxyXG5pbnRlcmZhY2UgU2hhZG93Um9vdCBleHRlbmRzIERvY3VtZW50RnJhZ21lbnQge1xyXG4gICAgc3R5bGVTaGVldHMgICAgIDogU3R5bGVTaGVldExpc3Q7XHJcbiAgICBpbm5lckhUTUwgICAgICAgOiBzdHJpbmc7XHJcbiAgICBob3N0ICAgICAgICAgICAgOiBFbGVtZW50O1xyXG4gICAgYWN0aXZlRWxlbWVudCAgIDogRWxlbWVudDtcclxuICAgIGVsZW1lbnRGcm9tUG9pbnQgICAgICAgICh4IDogbnVtYmVyLCB5IDogbnVtYmVyKSA6IEVsZW1lbnQ7XHJcbiAgICBlbGVtZW50c0Zyb21Qb2ludCAgICAgICAoeCA6IG51bWJlciwgeSA6IG51bWJlcikgOiBFbGVtZW50W107XHJcbiAgICBjYXJldFBvc2l0aW9uRnJvbVBvaW50ICAoeCA6IG51bWJlciwgeSA6IG51bWJlcik7IC8vID0+IENhcmV0UG9zaXRpb25cclxufTtcclxuXHJcbmludGVyZmFjZSBFbGVtZW50V2l0aFNoYWRvd1Jvb3QgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICBzaGFkb3dSb290ICA6IFNoYWRvd1Jvb3Q7XHJcbn07Ki9cclxudHlwZSBQb2ludGVyID0ge3g6IG51bWJlciwgeTogbnVtYmVyfTtcclxuY2xhc3MgRHJhZ01hbmFnZXIge1xyXG4gICAgZHJhZ2dpbmdQb2ludGVyICAgICA9IG5ldyBNYXA8c3RyaW5nLCBQb2ludGVyPigpO1xyXG4gICAgZHJhZ2dlZFN0cnVjdHVyZXMgICA9IG5ldyBNYXA8c3RyaW5nLCBBbHhEcmFnZ2FibGU+KCk7XHJcbiAgICBkcm9wWm9uZXMgICAgICAgICAgID0gbmV3IE1hcDxFbGVtZW50LCBBbHhEcm9wem9uZSA+KCk7XHJcbiAgICAvL2NvbnN0cnVjdG9yKCkge31cclxuICAgIHByZVN0YXJ0RHJhZyggaWRQb2ludGVyOiBzdHJpbmcsIGRyYWdnZWQ6IEFseERyYWdnYWJsZSwgeDogbnVtYmVyLCB5OiBudW1iZXJcclxuICAgICAgICAgICAgICAgICwgZGVsYXk6IG51bWJlciwgZGlzdDogbnVtYmVyKSA6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJwcmVTdGFydERyYWdcIiwgaWRQb2ludGVyLCBkcmFnZ2VkLCB4LCB5LCBkZWxheSk7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIgIC5zZXQoaWRQb2ludGVyLCB7eDogeCwgeTogeX0pO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPiggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBwdHIgICA9IHRoaXMuZHJhZ2dpbmdQb2ludGVyLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGdvZ28gID0gcHRyICYmIChNYXRoLmFicyh4IC0gcHRyLngpICsgTWF0aC5hYnMoeSAtIHB0ci55KSkgPCBkaXN0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1BvaW50ZXIuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgICAgICBpZihnb2dvKSB7cmVzb2x2ZSgpO30gZWxzZSB7cmVqZWN0KCk7fVxyXG4gICAgICAgICAgICB9LCBNYXRoLm1heCgwLCBkZWxheSkpO1xyXG4gICAgICAgIH0pOyAvLyBFbmQgb2YgUHJvbWlzZVxyXG4gICAgfVxyXG4gICAgcHVibGljIHN0YXJ0RHJhZyhpZFBvaW50ZXI6IHN0cmluZywgZHJhZ2dlZDogQWx4RHJhZ2dhYmxlLCB4OiBudW1iZXIsIHk6IG51bWJlcikgOiBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+IHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInN0YXJ0ZHJhZ1wiLCBkcmFnZ2VkLCB4LCB5KTtcclxuICAgICAgICB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLnNldChpZFBvaW50ZXIsIGRyYWdnZWQpO1xyXG4gICAgICAgIGxldCBwb3NzaWJsZURyb3Bab25lcyA9IG5ldyBNYXA8RWxlbWVudCwgQWx4RHJvcHpvbmU+KCk7XHJcbiAgICAgICAgdGhpcy5kcm9wWm9uZXMuZm9yRWFjaCggZHogPT4ge1xyXG4gICAgICAgICAgICBpZiggZHouY2hlY2tBY2NlcHQoZHJhZ2dlZCkgKSB7XHJcbiAgICAgICAgICAgICAgICBkei5hcHBlbmREcm9wQ2FuZGlkYXRlUG9pbnRlciggaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZURyb3Bab25lcy5zZXQoZHoucm9vdCwgZHopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHJldHVybiBwb3NzaWJsZURyb3Bab25lcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBpc0Fzc29jaWF0ZWRUb0Ryb3Bab25lKGVsZW1lbnQ6IEVsZW1lbnQpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJvcFpvbmVzLmhhcyggZWxlbWVudCApO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHJlZ2lzdGVyRHJvcFpvbmUoIGRyb3B6b25lOiBBbHhEcm9wem9uZSApIHtcclxuICAgICAgICB0aGlzLmRyb3Bab25lcy5zZXQoZHJvcHpvbmUucm9vdCwgZHJvcHpvbmUpO1xyXG4gICAgfVxyXG4gICAgcHVibGljIHVucmVnaXN0ZXJEcm9wWm9uZSggZHJvcHpvbmU6IEFseERyb3B6b25lICkge1xyXG4gICAgICAgIHRoaXMuZHJvcFpvbmVzLmRlbGV0ZShkcm9wem9uZS5yb290KTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBwb2ludGVyTW92ZShpZFBvaW50ZXI6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHB0ciA9IHRoaXMuZHJhZ2dpbmdQb2ludGVyLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKHB0cikge3B0ci54ID0geDsgcHRyLnkgPSB5O31cclxuICAgICAgICBsZXQgZHJhZ2dlZCA9IHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoZHJhZ2dlZCkge1xyXG4gICAgICAgICAgICBkcmFnZ2VkLm1vdmUoeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkcmFnZ2VkICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgcG9pbnRlclJlbGVhc2UoaWRQb2ludGVyOiBzdHJpbmcpIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGRyYWdnZWQgPSB0aGlzLmRyYWdnZWRTdHJ1Y3R1cmVzLmdldChpZFBvaW50ZXIpO1xyXG4gICAgICAgIGlmKGRyYWdnZWQpIHtcclxuICAgICAgICAgICAgZHJhZ2dlZC5zdG9wKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dlZFN0cnVjdHVyZXMuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQb2ludGVyICAuZGVsZXRlKGlkUG9pbnRlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkcmFnZ2VkICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxubGV0IERNID0gbmV3IERyYWdNYW5hZ2VyKCk7XHJcblxyXG5sZXQgZHJhZ0Ryb3BJbml0ID0gZmFsc2U7XHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6IFwiKlthbHgtZHJhZ2Ryb3BdXCJcclxufSlcclxuZXhwb3J0IGNsYXNzIEFseERyYWdEcm9wIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGlmKGRyYWdEcm9wSW5pdCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCBcIkRvIG5vdCBjcmVhdGUgbXVsdGlwbGUgaW5zdGFuY2Ugb2YgZGlyZWN0aXZlIGFseC1kcmFnZHJvcCAhXCIgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyggXCJBbHhEcmFnRHJvcCBlbmFibGVkICFcIik7XHJcbiAgICAgICAgICAgIGRyYWdEcm9wSW5pdCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lciggXCJkb2N1bWVudDogbW91c2Vtb3ZlXCIsIFtcIiRldmVudFwiXSApIG1vdXNlbW92ZSggZSApIHtcclxuICAgICAgICBETS5wb2ludGVyTW92ZSAgIChcIm1vdXNlXCIsIGUuY2xpZW50WCwgZS5jbGllbnRZKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IG1vdXNldXBcIiAgLCBbXCIkZXZlbnRcIl0gKSBtb3VzZXVwICAoIGUgKSB7XHJcbiAgICAgICAgRE0ucG9pbnRlclJlbGVhc2UoXCJtb3VzZVwiKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoIFwiZG9jdW1lbnQ6IHRvdWNobW92ZVwiLCBbXCIkZXZlbnRcIl0gKSB0b3VjaG1vdmUoIGUgKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlLmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3VjaDpUb3VjaCA9IGUuY2hhbmdlZFRvdWNoZXMuaXRlbShpKTtcclxuICAgICAgICAgICAgaWYgKERNLnBvaW50ZXJNb3ZlKHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSkpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBASG9zdExpc3RlbmVyKCBcImRvY3VtZW50OiB0b3VjaGVuZFwiICwgW1wiJGV2ZW50XCJdICkgdG91Y2hlbmQgKCBlICkge1xyXG4gICAgICAgIGZvcihsZXQgaT0wOyBpPGUuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoIDogVG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzLml0ZW0oaSk7XHJcbiAgICAgICAgICAgIGlmKCBETS5wb2ludGVyUmVsZWFzZSh0b3VjaC5pZGVudGlmaWVyLnRvU3RyaW5nKCkpICkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubGV0IG9mZnNldEVsZW1lbnQgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpIDoge2xlZnQ6IG51bWJlciwgdG9wOiBudW1iZXJ9ID0+IHtcclxuICAgIGxldCBsZWZ0ID0gMCwgdG9wID0gMDtcclxuICAgIHdoaWxlIChlbGVtZW50KSB7XHJcbiAgICAgICAgdG9wICArPSBlbGVtZW50Lm9mZnNldFRvcCAgLSBlbGVtZW50LnNjcm9sbFRvcCAgKyBlbGVtZW50LmNsaWVudFRvcDtcclxuICAgICAgICBsZWZ0ICs9IGVsZW1lbnQub2Zmc2V0TGVmdCAtIGVsZW1lbnQuc2Nyb2xsTGVmdCArIGVsZW1lbnQuY2xpZW50TGVmdDtcclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge2xlZnQ6IGxlZnQsIHRvcDogdG9wfTsgLy8gKyBlbGVtZW50LnNjcm9sbFRvcDsgLy93aW5kb3cuc2Nyb2xsWTtcclxufTtcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6IFwiKlthbHgtZHJhZ2dhYmxlXVwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBbHhEcmFnZ2FibGUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgICBASW5wdXQgKFwiYWx4LWRyYWdnYWJsZVwiICkgZHJhZ2dlZERhdGEgOiBhbnk7XHJcbiAgICBASW5wdXQgKFwiYWx4LXRvdWNoLWRlbGF5XCIpIHRvdWNoRGVsYXkgOiBudW1iZXI7XHJcbiAgICBASW5wdXQgKFwiYWx4LXRvdWNoLWRpc3RhbmNlXCIpIHRvdWNoRGlzdGFuY2U6IG51bWJlcjtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1zdGFydFwiKSBvbkRyYWdTdGFydCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVuZFwiICApIG9uRHJhZ0VuZCAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBwcml2YXRlIGlzQmVpbmdEcmFnZ2VkICAgICAgICAgICAgICAgIDogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBjbG9uZU5vZGUgICAgICAgICAgICAgICAgICAgICA6IEhUTUxFbGVtZW50ID0gbnVsbDtcclxuICAgIHByaXZhdGUgY3VycmVudERyb3Bab25lICAgICAgICAgICAgICAgOiBBbHhEcm9wem9uZTtcclxuICAgIHByaXZhdGUgcG9zc2libGVEcm9wWm9uZXMgPSBuZXcgTWFwPEVsZW1lbnQsIEFseERyb3B6b25lPigpO1xyXG4gICAgcHJpdmF0ZSBkeCA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZHkgOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG94IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBveSA6IG51bWJlcjtcclxuICAgIHByaXZhdGUgdHggOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHR5IDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBpZFBvaW50ZXIgOiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIHJvb3QgOiBIVE1MRWxlbWVudDtcclxuICAgIGNvbnN0cnVjdG9yKGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5yb290ID0gZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBpZighZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgY29uc29sZS5lcnJvcihcIllvdSBzaG91bGQgYWRkIG9uZSBhbHgtZHJhZ2Ryb3AgYXR0cmlidXRlIHRvIHlvdXIgY29kZSBiZWZvcmUgdXNpbmcgYWx4LWRyYWdnYWJsZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyggXCJuZXcgaW5zdGFuY2Ugb2YgQWx4RHJhZ2dhYmxlXCIsIHRoaXMgKTtcclxuICAgIH1cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIC8vXHJcbiAgICB9XHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxuICAgIEBIb3N0TGlzdGVuZXIoXCJtb3VzZWRvd25cIiAsIFtcIiRldmVudFwiXSkgb25Nb3VzZURvd24gKGV2ZW50IDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJtb3VzZWRvd24gb25cIiwgdGhpcywgZXZlbnQpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5zdGFydChcIm1vdXNlXCIsIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgfVxyXG4gICAgQEhvc3RMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgW1wiJGV2ZW50XCJdKSBvblRvdWNoU3RhcnQoZXZlbnQ6IE15VG91Y2hFdmVudCkge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ0b3VjaHN0YXJ0IG9uXCIsIHRoaXMpO1xyXG4gICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZm9yKGxldCBpPTA7IGk8ZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHRvdWNoIDogVG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlcy5pdGVtKGkpO1xyXG4gICAgICAgICAgICB0aGlzLnByZXN0YXJ0KHRvdWNoLmlkZW50aWZpZXIudG9TdHJpbmcoKSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJlc3RhcnQoaWRQb2ludGVyOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgRE0ucHJlU3RhcnREcmFnKGlkUG9pbnRlciwgdGhpcywgeCwgeSwgdGhpcy50b3VjaERlbGF5IHx8IDUwLCB0aGlzLnRvdWNoRGlzdGFuY2UgfHwgMTApLnRoZW4oXHJcbiAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQoaWRQb2ludGVyLCB4LCB5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5lcnJvcihcInNraXAgdGhlIGRyYWdcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgIH1cclxuICAgIHN0YXJ0KGlkUG9pbnRlcjogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc0JlaW5nRHJhZ2dlZCApIHtcclxuICAgICAgICAgICAgdGhpcy5pc0JlaW5nRHJhZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuaWRQb2ludGVyID0gaWRQb2ludGVyO1xyXG4gICAgICAgICAgICAvLyBsZXQgYmJveCA9IHRoaXMucm9vdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldCA9IG9mZnNldEVsZW1lbnQodGhpcy5yb290KTtcclxuICAgICAgICAgICAgdGhpcy5veCA9IHg7IHRoaXMub3kgPSB5O1xyXG4gICAgICAgICAgICB0aGlzLmR4ID0geCAtIG9mZnNldC5sZWZ0OyAvLyBNYXRoLnJvdW5kKGJib3gubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCk7XHJcbiAgICAgICAgICAgIHRoaXMuZHkgPSB5IC0gb2Zmc2V0LnRvcCA7IC8vIE1hdGgucm91bmQoYmJveC50b3AgICsgd2luZG93LnBhZ2VZT2Zmc2V0KTtcclxuICAgICAgICAgICAgLypsZXQgRCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZGVidWdcIik7XHJcbiAgICAgICAgICAgIEQuaW5uZXJIVE1MID0gd2luZG93LnBhZ2VYT2Zmc2V0ICsgXCIgOyBcIiArIHdpbmRvdy5wYWdlWU9mZnNldCArIFwiPGJyLz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICArIHdpbmRvdy5zY3JvbGxYICsgXCIgOyBcIiArIHdpbmRvdy5zY3JvbGxZICsgXCI8YnIvPlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5yb290Lm9mZnNldExlZnQgKyBcIiA7IFwiICsgdGhpcy5yb290Lm9mZnNldFRvcCArIFwiPGJyLz5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyArIGJib3gubGVmdCArIFwiIDsgXCIgKyBiYm94LnRvcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA7Ki9cclxuICAgICAgICAgICAgdGhpcy50eCA9IHRoaXMucm9vdC5vZmZzZXRXaWR0aCA7IC8vIGJib3gud2lkdGggO1xyXG4gICAgICAgICAgICB0aGlzLnR5ID0gdGhpcy5yb290Lm9mZnNldEhlaWdodDsgLy8gYmJveC5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMub25EcmFnU3RhcnQuZW1pdCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzID0gRE0uc3RhcnREcmFnKGlkUG9pbnRlciwgdGhpcywgeCwgeSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICB0aGlzLmlzQmVpbmdEcmFnZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUpIHtcclxuICAgICAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUucGFyZW50Tm9kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmNsb25lTm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmZvckVhY2goIGR6ID0+IHtcclxuICAgICAgICAgICAgZHoucmVtb3ZlUG9pbnRlckhvdmVyICAgICAgICAgICAodGhpcy5pZFBvaW50ZXIpO1xyXG4gICAgICAgICAgICBkei5yZW1vdmVEcm9wQ2FuZGlkYXRlUG9pbnRlciAgICh0aGlzLmlkUG9pbnRlcik7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMucG9zc2libGVEcm9wWm9uZXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmlkUG9pbnRlciA9IG51bGw7XHJcbiAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuZHJvcCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmN1cnJlbnREcm9wWm9uZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5vbkRyYWdFbmQuZW1pdCggdGhpcy5kcmFnZ2VkRGF0YSApO1xyXG4gICAgfVxyXG4gICAgbW92ZSh4OiBudW1iZXIsIHk6IG51bWJlcikgOiB0aGlzIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA6IEVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIGlmKHRoaXMuY2xvbmVOb2RlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0Q2xvbmUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5jbG9uZU5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubGVmdCA9ICh4IC0gdGhpcy5keCArIHdpbmRvdy5wYWdlWE9mZnNldCkgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnRvcCAgPSAoeSAtIHRoaXMuZHkgKyB3aW5kb3cucGFnZVlPZmZzZXQpICsgXCJweFwiO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5jbG9uZU5vZGUucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgbGV0IHZpc2liaWxpdHkgPSB0aGlzLmNsb25lTm9kZS5zdHlsZS52aXNpYmlsaXR5O1xyXG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuY2xvbmVOb2RlICk7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICAvLyBsZXQgTCA9IDxBcnJheTxFbGVtZW50Pj5teURvYy5lbGVtZW50c0Zyb21Qb2ludCh4LXdpbmRvdy5wYWdlWE9mZnNldCwgeS13aW5kb3cucGFnZVlPZmZzZXQpO1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gbXlEb2MuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnZpc2liaWxpdHkgPSB2aXNpYmlsaXR5O1xyXG4gICAgICAgICAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuY2xvbmVOb2RlICk7XHJcblxyXG4gICAgICAgICAgICBsZXQgcHJldkRyb3Bab25lID0gdGhpcy5jdXJyZW50RHJvcFpvbmU7XHJcbiAgICAgICAgICAgIHdoaWxlKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHdlIGFyZSBvbiB0b3Agb2YgYSBkcm9wWm9uZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUgPSB0aGlzLnBvc3NpYmxlRHJvcFpvbmVzLmdldCggZWxlbWVudCApO1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5jdXJyZW50RHJvcFpvbmUpIHticmVhazt9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gPEVsZW1lbnQ+ZWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHByZXZEcm9wWm9uZSAhPT0gdGhpcy5jdXJyZW50RHJvcFpvbmUpIHtcclxuICAgICAgICAgICAgICAgIGlmKHByZXZEcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZEcm9wWm9uZS5yZW1vdmVQb2ludGVySG92ZXIoIHRoaXMuaWRQb2ludGVyICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLmN1cnJlbnREcm9wWm9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lLmFwcGVuZFBvaW50ZXJIb3ZlciggdGhpcy5pZFBvaW50ZXIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvKnRoaXMucG9zc2libGVEcm9wWm9uZXMuZm9yRWFjaCggZHogPT4gZHoucmVtb3ZlUG9pbnRlckhvdmVyKHRoaXMuaWRQb2ludGVyKSApO1xyXG4gICAgICAgICAgICB3aGlsZShlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhcmUgb24gdG9wIG9mIGEgZHJvcFpvbmVcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERyb3Bab25lID0gdGhpcy5wb3NzaWJsZURyb3Bab25lcy5nZXQoIGVsZW1lbnQgKTtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMuY3VycmVudERyb3Bab25lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJvcFpvbmUuYXBwZW5kUG9pbnRlckhvdmVyKCB0aGlzLmlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IDxFbGVtZW50PmVsZW1lbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgfSovXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgZGVlcFN0eWxlKG9yaWdpbmFsOiBFbGVtZW50LCBjbG9uZTogRWxlbWVudCkge1xyXG4gICAgICAgIGlmKG9yaWdpbmFsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUob3JpZ2luYWwpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0eWxlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXR0ID0gc3R5bGVbaV07XHJcbiAgICAgICAgICAgICAgICAoY2xvbmUgYXMgSFRNTEVsZW1lbnQpLnN0eWxlW2F0dF0gPSBzdHlsZVthdHRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvcihsZXQgaT0wOyBpPG9yaWdpbmFsLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZXBTdHlsZShvcmlnaW5hbC5jaGlsZHJlbi5pdGVtKGkpLCBjbG9uZS5jaGlsZHJlbi5pdGVtKGkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldENsb25lKCkgOiBOb2RlIHtcclxuICAgICAgICBpZih0aGlzLmNsb25lTm9kZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZSA9IDxIVE1MRWxlbWVudD50aGlzLnJvb3QuY2xvbmVOb2RlKHRydWUpO1xyXG4gICAgICAgICAgICAvLyBBcHBseSBjb21wdXRlZCBzdHlsZSA6XHJcbiAgICAgICAgICAgIHRoaXMuZGVlcFN0eWxlKCB0aGlzLnJvb3QsIHRoaXMuY2xvbmVOb2RlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluc2VydCB0aGUgY2xvbmUgb24gdGhlIERPTVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmNsb25lTm9kZSApO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5wb3NpdGlvbiAgICAgPSBcImFic29sdXRlXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLnpJbmRleCAgICAgICA9IFwiOTk5XCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkxlZnQgICA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5zdHlsZS5tYXJnaW5Ub3AgICAgPSBcIjBcIjtcclxuICAgICAgICAgICAgdGhpcy5jbG9uZU5vZGUuc3R5bGUubWFyZ2luUmlnaHQgID0gXCIwXCI7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvbmVOb2RlLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMFwiO1xyXG4gICAgICAgICAgICB0aGlzLmNsb25lTm9kZS5jbGFzc0xpc3QuYWRkKCBcImFseC1jbG9uZU5vZGVcIiApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5jbG9uZU5vZGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoeyBzZWxlY3RvcjogXCIqW2FseC1kcm9wem9uZV1cIiB9KVxyXG5leHBvcnQgY2xhc3MgQWx4RHJvcHpvbmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcbiAgICBwdWJsaWMgcm9vdCA6IEhUTUxFbGVtZW50O1xyXG4gICAgQElucHV0KFwiYWx4LWRyYWctY3NzXCIgICAgICkgZHJhZ0NTUyAgICAgOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoXCJhbHgtZHJhZy1vdmVyLWNzc1wiKSBkcmFnT3ZlckNTUyA6IHN0cmluZztcclxuICAgIEBJbnB1dChcImFseC1hY2NlcHQtZnVuY3Rpb25cIikgYWNjZXB0RnVuY3Rpb24gOiAoZGF0YTogYW55KSA9PiBib29sZWFuO1xyXG4gICAgQE91dHB1dChcImFseC1vbmRyb3BcIikgICAgIG9uRHJvcEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1zdGFydFwiKSBvbkRyYWdTdGFydCAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgICBAT3V0cHV0KFwiYWx4LWRyYWctZW5kXCIpICAgb25EcmFnRW5kICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gICAgQE91dHB1dChcImFseC1kcmFnLWVudGVyXCIpIG9uRHJhZ0VudGVyICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAgIEBPdXRwdXQoXCJhbHgtZHJhZy1sZWF2ZVwiKSBvbkRyYWdMZWF2ZSAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gICAgLy8gQ1NTIHdoZW4gY2FuRHJvcCBhbmQgc3RhcnRkcmFnZ2FibGVcclxuICAgIHByaXZhdGUgZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMgOiBBcnJheTxzdHJpbmc+ID0gW107XHJcbiAgICBwcml2YXRlIHBvaW50ZXJzSG92ZXIgICAgICAgICAgIDogQXJyYXk8c3RyaW5nPiA9IFtdO1xyXG4gICAgY29uc3RydWN0b3IoZWw6IEVsZW1lbnRSZWYpIHtcclxuICAgICAgICBpZighZHJhZ0Ryb3BJbml0KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJZb3Ugc2hvdWxkIGFkZCBvbmUgYWx4LWRyYWdkcm9wIGF0dHJpYnV0ZSB0byB5b3VyIGNvZGUgYmVmb3JlIHVzaW5nIGFseC1kcm9wem9uZVwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yb290ID0gZWwubmF0aXZlRWxlbWVudDtcclxuICAgICAgICAvLyB0aGlzLmFjY2VwdEZjdCA9IFlFUztcclxuICAgICAgICBETS5yZWdpc3RlckRyb3Bab25lKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgLy9cclxuICAgIH1cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBcIlRPRE86IFNob3VsZCBpbXBsZW1lbnQgZHJvcHpvbmUgZGVzdG95XCIpO1xyXG4gICAgfVxyXG4gICAgZHJvcCggb2JqICkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCB0aGlzLCBcImRyb3BcIiwgb2JqICk7XHJcbiAgICAgICAgdGhpcy5vbkRyb3BFbWl0dGVyLmVtaXQoIG9iaiApO1xyXG4gICAgfVxyXG4gICAgY2hlY2tBY2NlcHQoZHJhZzogQWx4RHJhZ2dhYmxlKSA6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFjY2VwdEZ1bmN0aW9uPyggZHJhZy5kcmFnZ2VkRGF0YSApOnRydWU7XHJcbiAgICB9XHJcbiAgICBoYXNQb2ludGVySG92ZXIoaWRQb2ludGVyOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb2ludGVyc0hvdmVyLmluZGV4T2YoaWRQb2ludGVyKSA+PSAwO1xyXG4gICAgfVxyXG4gICAgYXBwZW5kUG9pbnRlckhvdmVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBpZiggdGhpcy5wb2ludGVyc0hvdmVyLmluZGV4T2YoaWRQb2ludGVyKSA9PT0gLTEgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcnNIb3Zlci5wdXNoKGlkUG9pbnRlcik7XHJcbiAgICAgICAgICAgIHRoaXMub25EcmFnRW50ZXIuZW1pdCggRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcikuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5kcmFnT3ZlckNTUykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yb290LmNsYXNzTGlzdC5hZGQoIHRoaXMuZHJhZ092ZXJDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZVBvaW50ZXJIb3ZlciggaWRQb2ludGVyOiBzdHJpbmcgKSB7XHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMucG9pbnRlcnNIb3Zlci5pbmRleE9mKGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoIHBvcyA+PSAwICkge1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJzSG92ZXIuc3BsaWNlKHBvcywgMSk7XHJcbiAgICAgICAgICAgIHRoaXMub25EcmFnTGVhdmUuZW1pdCggRE0uZHJhZ2dlZFN0cnVjdHVyZXMuZ2V0KGlkUG9pbnRlcikuZHJhZ2dlZERhdGEgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5wb2ludGVyc0hvdmVyLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdPdmVyQ1NTKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZSggdGhpcy5kcmFnT3ZlckNTUyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYXBwZW5kRHJvcENhbmRpZGF0ZVBvaW50ZXIoIGlkUG9pbnRlcjogc3RyaW5nICkge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coIFwiYXBwZW5kRHJvcENhbmRpZGF0ZVBvaW50ZXJcIiwgaWRQb2ludGVyLCB0aGlzICk7XHJcbiAgICAgICAgaWYoIHRoaXMuZHJvcENhbmRpZGF0ZW9mUG9pbnRlcnMuaW5kZXhPZihpZFBvaW50ZXIpID09PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5vbkRyYWdTdGFydC5lbWl0KCBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKS5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLnB1c2goIGlkUG9pbnRlciApO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyYWdDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QuYWRkKCB0aGlzLmRyYWdDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbW92ZURyb3BDYW5kaWRhdGVQb2ludGVyKCBpZFBvaW50ZXI6IHN0cmluZyApIHtcclxuICAgICAgICBsZXQgcG9zID0gdGhpcy5kcm9wQ2FuZGlkYXRlb2ZQb2ludGVycy5pbmRleE9mKGlkUG9pbnRlcik7XHJcbiAgICAgICAgaWYoIHBvcyA+PSAwICkge1xyXG4gICAgICAgICAgICB0aGlzLm9uRHJhZ0VuZC5lbWl0KCBETS5kcmFnZ2VkU3RydWN0dXJlcy5nZXQoaWRQb2ludGVyKS5kcmFnZ2VkRGF0YSApO1xyXG4gICAgICAgICAgICB0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLnNwbGljZShwb3MsIDEpO1xyXG4gICAgICAgICAgICBpZih0aGlzLmRyb3BDYW5kaWRhdGVvZlBvaW50ZXJzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLmRyYWdDU1MpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCB0aGlzLmRyYWdDU1MgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9
