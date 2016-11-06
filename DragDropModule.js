System.register(["@angular/core", "@angular/common", "./DirectivesDragDrop"], function(exports_1, context_1) {
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
    var core_1, common_1, DirectivesDragDrop_1;
    var DragDropModule;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (DirectivesDragDrop_1_1) {
                DirectivesDragDrop_1 = DirectivesDragDrop_1_1;
            }],
        execute: function() {
            DragDropModule = class DragDropModule {
            };
            DragDropModule = __decorate([
                core_1.NgModule({
                    imports: [common_1.CommonModule],
                    exports: [DirectivesDragDrop_1.AlxDragDrop, DirectivesDragDrop_1.AlxDraggable, DirectivesDragDrop_1.AlxDropzone],
                    declarations: [DirectivesDragDrop_1.AlxDragDrop, DirectivesDragDrop_1.AlxDraggable, DirectivesDragDrop_1.AlxDropzone],
                    providers: [],
                }), 
                __metadata('design:paramtypes', [])
            ], DragDropModule);
            exports_1("DragDropModule", DragDropModule);
        }
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRyYWdEcm9wTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBWUE7WUFBOEIsQ0FBQztZQVAvQjtnQkFBQyxlQUFRLENBQUM7b0JBQ04sT0FBTyxFQUFPLENBQUUscUJBQVksQ0FBRTtvQkFDOUIsT0FBTyxFQUFPLENBQUUsZ0NBQVcsRUFBRSxpQ0FBWSxFQUFFLGdDQUFXLENBQUU7b0JBQ3hELFlBQVksRUFBRSxDQUFFLGdDQUFXLEVBQUUsaUNBQVksRUFBRSxnQ0FBVyxDQUFFO29CQUN4RCxTQUFTLEVBQUssRUFBRztpQkFFcEIsQ0FBQzs7OEJBQUE7WUFDRiwyQ0FBK0IsQ0FBQSIsImZpbGUiOiJEcmFnRHJvcE1vZHVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gICAgICAgICAgICAgICAgIGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9ICAgICAgICAgICAgIGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcclxuXHJcbmltcG9ydCB7QWx4RHJhZ2dhYmxlLCBBbHhEcm9wem9uZSwgQWx4RHJhZ0Ryb3B9ICBmcm9tIFwiLi9EaXJlY3RpdmVzRHJhZ0Ryb3BcIjtcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzICAgICA6IFsgQ29tbW9uTW9kdWxlIF0sXHJcbiAgICBleHBvcnRzICAgICA6IFsgQWx4RHJhZ0Ryb3AsIEFseERyYWdnYWJsZSwgQWx4RHJvcHpvbmUgXSxcclxuICAgIGRlY2xhcmF0aW9uczogWyBBbHhEcmFnRHJvcCwgQWx4RHJhZ2dhYmxlLCBBbHhEcm9wem9uZSBdLFxyXG4gICAgcHJvdmlkZXJzICAgOiBbIF0sXHJcblxyXG59KVxyXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3BNb2R1bGUgeyB9XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=
