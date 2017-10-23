var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@angular/core", "@angular/common", "./DirectivesDragDrop"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const core_1 = require("@angular/core");
    const common_1 = require("@angular/common");
    const DirectivesDragDrop_1 = require("./DirectivesDragDrop");
    let DragDropModule = class DragDropModule {
    };
    DragDropModule = __decorate([
        core_1.NgModule({
            imports: [common_1.CommonModule],
            exports: [DirectivesDragDrop_1.AlxDragDrop, DirectivesDragDrop_1.AlxDraggable, DirectivesDragDrop_1.AlxDropzone],
            declarations: [DirectivesDragDrop_1.AlxDragDrop, DirectivesDragDrop_1.AlxDraggable, DirectivesDragDrop_1.AlxDropzone],
            providers: [],
        })
    ], DragDropModule);
    exports.DragDropModule = DragDropModule;
});
//# sourceMappingURL=DragDropModule.js.map