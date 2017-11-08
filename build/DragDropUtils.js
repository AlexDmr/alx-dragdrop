"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myDoc = document;
//(<MyDocument>document).elementsFromPoint = (<MyDocument>document).elementsFromPoint ||
exports.myDoc.elementsFromPoint = exports.myDoc.elementsFromPoint || function (x, y) {
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
//# sourceMappingURL=DragDropUtils.js.map