System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var myDoc;
    return {
        setters: [],
        execute: function () {
            ;
            exports_1("myDoc", myDoc = document);
            //(<MyDocument>document).elementsFromPoint = (<MyDocument>document).elementsFromPoint ||
            myDoc.elementsFromPoint = myDoc.elementsFromPoint || function (x, y) {
                let element, elements = [];
                let old_visibility = [];
                while (true) {
                    element = document.elementFromPoint(x, y);
                    if (!element || element === document.documentElement) {
                        break;
                    }
                    elements.push(element);
                    old_visibility.push(element.style.visibility);
                    element.style.visibility = "hidden"; // Temporarily hide the element (without changing the layout)
                }
                for (let k = 0; k < elements.length; k++) {
                    elements[k].style.visibility = old_visibility[k];
                }
                return elements;
            };
        }
    };
});
//# sourceMappingURL=DragDropUtils.js.map