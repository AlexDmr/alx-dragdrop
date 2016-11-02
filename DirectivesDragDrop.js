"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var DragDropUtils_1 = require("./DragDropUtils");
;
var DragManager = (function () {
    function DragManager() {
        this.draggingPointer = new Map();
        this.draggedStructures = new Map();
        this.dropZones = new Map();
    }
    //constructor() {}
    DragManager.prototype.preStartDrag = function (idPointer, dragged, x, y, delay) {
        var _this = this;
        // console.log("preStartDrag", idPointer, dragged, x, y, delay);
        this.draggingPointer.set(idPointer, { x: x, y: y });
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                var ptr = _this.draggingPointer.get(idPointer);
                var gogo = ptr && (Math.abs(x - ptr.x) + Math.abs(y - ptr.y)) < 20;
                _this.draggingPointer.delete(idPointer);
                if (gogo) {
                    resolve();
                }
                else {
                    reject();
                }
            }, Math.max(0, delay));
        }); // End of Promise
    };
    DragManager.prototype.startDrag = function (idPointer, dragged, x, y) {
        // console.log("startdrag", dragged, x, y);
        this.draggedStructures.set(idPointer, dragged);
        var possibleDropZones = new Map();
        this.dropZones.forEach(function (dz) {
            if (dz.checkAccept(dragged)) {
                dz.appendDropCandidatePointer(idPointer);
                possibleDropZones.set(dz.root, dz);
            }
        });
        return possibleDropZones;
    };
    DragManager.prototype.isAssociatedToDropZone = function (element) {
        return this.dropZones.has(element);
    };
    DragManager.prototype.registerDropZone = function (dropzone) {
        this.dropZones.set(dropzone.root, dropzone);
    };
    DragManager.prototype.unregisterDropZone = function (dropzone) {
        this.dropZones.delete(dropzone.root);
    };
    DragManager.prototype.pointerMove = function (idPointer, x, y) {
        var ptr = this.draggingPointer.get(idPointer);
        if (ptr) {
            ptr.x = x;
            ptr.y = y;
        }
        var dragged = this.draggedStructures.get(idPointer);
        if (dragged) {
            dragged.move(x, y);
        }
        return dragged !== undefined;
    };
    DragManager.prototype.pointerRelease = function (idPointer) {
        var dragged = this.draggedStructures.get(idPointer);
        if (dragged) {
            dragged.stop();
            this.draggedStructures.delete(idPointer);
            this.draggingPointer.delete(idPointer);
        }
        return dragged !== undefined;
    };
    return DragManager;
}());
var DM = new DragManager();
var dragDropInit = false;
var AlxDragDrop = (function () {
    function AlxDragDrop() {
        if (dragDropInit) {
            console.error("Do not create multiple instance of directive alx-dragdrop !");
        }
        else {
            console.log("AlxDragDrop enabled !");
            dragDropInit = true;
        }
    }
    AlxDragDrop.prototype.mousemove = function (e) {
        DM.pointerMove("mouse", e.clientX, e.clientY);
    };
    AlxDragDrop.prototype.mouseup = function (e) {
        DM.pointerRelease("mouse");
    };
    AlxDragDrop.prototype.touchmove = function (e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches.item(i);
            if (DM.pointerMove(touch.identifier.toString(), touch.clientX, touch.clientY)) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };
    AlxDragDrop.prototype.touchend = function (e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
            var touch = e.changedTouches.item(i);
            if (DM.pointerRelease(touch.identifier.toString())) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    };
    __decorate([
        core_1.HostListener("document: mousemove", ["$event"])
    ], AlxDragDrop.prototype, "mousemove");
    __decorate([
        core_1.HostListener("document: mouseup", ["$event"])
    ], AlxDragDrop.prototype, "mouseup");
    __decorate([
        core_1.HostListener("document: touchmove", ["$event"])
    ], AlxDragDrop.prototype, "touchmove");
    __decorate([
        core_1.HostListener("document: touchend", ["$event"])
    ], AlxDragDrop.prototype, "touchend");
    AlxDragDrop = __decorate([
        core_1.Directive({
            selector: "*[alx-dragdrop]"
        })
    ], AlxDragDrop);
    return AlxDragDrop;
}());
exports.AlxDragDrop = AlxDragDrop;
var AlxDraggable = (function () {
    function AlxDraggable(el) {
        this.isBeingDragged = false;
        this.cloneNode = null;
        this.possibleDropZones = new Map();
        this.root = el.nativeElement;
        if (!dragDropInit) {
            console.error("You should add one alx-dragdrop attribute to your code before using alx-draggable");
        }
        //console.log( "new instance of AlxDraggable", this );
    }
    AlxDraggable.prototype.ngOnDestroy = function () {
        this.stop();
    };
    AlxDraggable.prototype.onMouseDown = function (event) {
        //console.log("mousedown on", this, event);
        event.preventDefault();
        event.stopPropagation();
        this.start("mouse", event.clientX, event.clientY);
    };
    AlxDraggable.prototype.onTouchStart = function (event) {
        //console.log("touchstart on", this);
        // event.preventDefault();
        event.stopPropagation();
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches.item(i);
            this.prestart(touch.identifier.toString(), touch.clientX, touch.clientY);
        }
    };
    AlxDraggable.prototype.prestart = function (idPointer, x, y) {
        var _this = this;
        DM.preStartDrag(idPointer, this, x, y, 50).then(function () {
            _this.start(idPointer, x, y);
        }, function () {
            // console.error("skip the drag");
        });
    };
    AlxDraggable.prototype.start = function (idPointer, x, y) {
        if (!this.isBeingDragged) {
            this.isBeingDragged = true;
            this.idPointer = idPointer;
            var bbox = this.root.getBoundingClientRect();
            this.ox = x;
            this.oy = y;
            this.dx = x - Math.round(bbox.left + window.pageXOffset);
            this.dy = y - Math.round(bbox.top + window.pageYOffset);
            this.tx = bbox.width;
            this.ty = bbox.height; // console.log( "drag", this.tx, bbox.right - bbox.left );
            this.possibleDropZones = DM.startDrag(idPointer, this, x, y);
        }
    };
    AlxDraggable.prototype.stop = function () {
        var _this = this;
        this.isBeingDragged = false;
        if (this.cloneNode) {
            if (this.cloneNode.parentNode) {
                this.cloneNode.parentNode.removeChild(this.cloneNode);
            }
            this.cloneNode = null;
        }
        this.possibleDropZones.forEach(function (dz) {
            dz.removeDropCandidatePointer(_this.idPointer);
            dz.removePointerHover(_this.idPointer);
        });
        this.possibleDropZones.clear();
        this.idPointer = null;
        if (this.currentDropZone) {
            this.currentDropZone.drop(this.data);
        }
        this.currentDropZone = null;
    };
    AlxDraggable.prototype.move = function (x, y) {
        var _this = this;
        var element = null;
        if (this.cloneNode === null) {
            //if( Math.abs(x-this.ox) + Math.abs(y-this.oy) > 50 ) {
            this.getClone();
        }
        if (this.cloneNode) {
            this.cloneNode.style.left = (x - this.dx) + "px";
            this.cloneNode.style.top = (y - this.dy) + "px";
            var visibility = this.cloneNode.style.visibility;
            this.cloneNode.style.visibility = "hidden";
            // let L = <Array<Element>>myDoc.elementsFromPoint(x-window.pageXOffset, y-window.pageYOffset);
            element = DragDropUtils_1.myDoc.elementFromPoint(x, y); //(x-window.pageXOffset, y-window.pageYOffset);
            //console.log( "element", element );
            this.cloneNode.style.visibility = visibility;
            this.possibleDropZones.forEach(function (dz) { return dz.removePointerHover(_this.idPointer); });
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
    };
    AlxDraggable.prototype.deepStyle = function (original, clone) {
        if (original instanceof HTMLElement) {
            var style = window.getComputedStyle(original);
            for (var i = 0; i < style.length; i++) {
                var att = style[i];
                clone.style[att] = style[att];
            }
            for (var i = 0; i < original.children.length; i++) {
                this.deepStyle(original.children.item(i), clone.children.item(i));
            }
        }
    };
    AlxDraggable.prototype.getClone = function () {
        if (this.cloneNode === null) {
            this.cloneNode = this.root.cloneNode(true);
            // Apply computed style :
            this.deepStyle(this.root, this.cloneNode);
            // Insert the clone on the DOM
            document.body.appendChild(this.cloneNode);
            this.cloneNode.style.position = "absolute";
            this.cloneNode.style.zIndex = "999";
            this.cloneNode.classList.add("alx-cloneNode");
        }
        return this.cloneNode;
    };
    __decorate([
        core_1.Input("alx-draggable")
    ], AlxDraggable.prototype, "data");
    __decorate([
        core_1.HostListener("mousedown", ["$event"])
    ], AlxDraggable.prototype, "onMouseDown");
    __decorate([
        core_1.HostListener("touchstart", ["$event"])
    ], AlxDraggable.prototype, "onTouchStart");
    AlxDraggable = __decorate([
        core_1.Directive({
            selector: "*[alx-draggable]"
        })
    ], AlxDraggable);
    return AlxDraggable;
}());
exports.AlxDraggable = AlxDraggable;
// function noAcceptFct(draggedData) {return false;}
function YES(data) { return true; }
var AlxDropzone = (function () {
    function AlxDropzone(el) {
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
    AlxDropzone.prototype.drop = function (obj) {
        console.log(this, "drop", obj);
        this.onDropEmitter.emit(obj);
    };
    AlxDropzone.prototype.checkAccept = function (drag) {
        var res = this.acceptFct(drag.data);
        return res;
    };
    AlxDropzone.prototype.appendPointerHover = function (idPointer) {
        if (this.pointersHover.indexOf(idPointer) === -1) {
            this.pointersHover.push(idPointer);
            if (this.dragHoverCSS) {
                this.root.classList.add(this.dragHoverCSS);
            }
        }
    };
    AlxDropzone.prototype.removePointerHover = function (idPointer) {
        var pos = this.pointersHover.indexOf(idPointer);
        if (pos >= 0) {
            this.pointersHover.splice(pos, 1);
            if (this.pointersHover.length === 0 && this.dragHoverCSS) {
                this.root.classList.remove(this.dragHoverCSS);
            }
        }
    };
    AlxDropzone.prototype.appendDropCandidatePointer = function (idPointer) {
        //console.log( "appendDropCandidatePointer", idPointer, this );
        if (this.dropCandidateofPointers.indexOf(idPointer) === -1) {
            this.dropCandidateofPointers.push(idPointer);
            //console.log( "\tadd class", this.dragStartCSS );
            if (this.dragStartCSS) {
                this.root.classList.add(this.dragStartCSS);
            }
        }
    };
    AlxDropzone.prototype.removeDropCandidatePointer = function (idPointer) {
        var pos = this.dropCandidateofPointers.indexOf(idPointer);
        if (pos >= 0) {
            this.dropCandidateofPointers.splice(pos, 1);
            if (this.dropCandidateofPointers.length === 0 && this.dragStartCSS) {
                this.root.classList.remove(this.dragStartCSS);
            }
        }
    };
    AlxDropzone.prototype.ngOnInit = function () {
        //console.log( "Init dropzone", this.dragStartCSS, this );
        //this.root.style
    };
    __decorate([
        core_1.Input("alx-accept-fct")
    ], AlxDropzone.prototype, "acceptFct");
    __decorate([
        // = (data) => true;
        core_1.Input("alx-dragstart-css")
    ], AlxDropzone.prototype, "dragStartCSS");
    __decorate([
        core_1.Input("alx-draghover-css")
    ], AlxDropzone.prototype, "dragHoverCSS");
    __decorate([
        core_1.Output("alx-ondrop")
    ], AlxDropzone.prototype, "onDropEmitter");
    AlxDropzone = __decorate([
        core_1.Directive({ selector: "*[alx-dropzone]" })
    ], AlxDropzone);
    return AlxDropzone;
}());
exports.AlxDropzone = AlxDropzone;
//# sourceMappingURL=DirectivesDragDrop.js.map