System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var myDoc;
    return {
        setters:[],
        execute: function() {
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
    }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRyYWdEcm9wVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O1FBSVcsS0FBSzs7OztZQURmLENBQUM7WUFDUyxtQkFBQSxLQUFLLEdBQWUsUUFBUSxDQUFBLENBQUM7WUFFeEMsd0ZBQXdGO1lBQ3hGLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsaUJBQWlCLElBQUksVUFBUyxDQUFRLEVBQUUsQ0FBUTtnQkFDNUUsSUFBSSxPQUFPLEVBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO2dCQUN4QixPQUFPLElBQUksRUFBRSxDQUFDO29CQUNWLE9BQU8sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7d0JBQ25ELEtBQUssQ0FBQztvQkFDVixDQUFDO29CQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3ZCLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLENBQUMsNkRBQTZEO2dCQUN0RyxDQUFDO2dCQUNELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN2QyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JELENBQUM7Z0JBQ0QsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNwQixDQUFDLENBQUMiLCJmaWxlIjoiRHJhZ0Ryb3BVdGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIFBvbHlmaWxsICovXHJcbmludGVyZmFjZSBNeURvY3VtZW50IGV4dGVuZHMgRG9jdW1lbnQge1xyXG4gICAgZWxlbWVudHNGcm9tUG9pbnQoeDpudW1iZXIsIHk6bnVtYmVyKSA6IEFycmF5PEVsZW1lbnQ+O1xyXG59O1xyXG5leHBvcnQgbGV0IG15RG9jID0gPE15RG9jdW1lbnQ+ZG9jdW1lbnQ7XHJcblxyXG4vLyg8TXlEb2N1bWVudD5kb2N1bWVudCkuZWxlbWVudHNGcm9tUG9pbnQgPSAoPE15RG9jdW1lbnQ+ZG9jdW1lbnQpLmVsZW1lbnRzRnJvbVBvaW50IHx8XHJcbm15RG9jLmVsZW1lbnRzRnJvbVBvaW50ID0gbXlEb2MuZWxlbWVudHNGcm9tUG9pbnQgfHwgZnVuY3Rpb24oeDpudW1iZXIsIHk6bnVtYmVyKSA6IEFycmF5PEVsZW1lbnQ+IHtcclxuICAgIGxldCBlbGVtZW50LCBlbGVtZW50cyA9IFtdO1xyXG4gICAgbGV0IG9sZF92aXNpYmlsaXR5ID0gW107XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xyXG4gICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50ID09PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnRzLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgb2xkX3Zpc2liaWxpdHkucHVzaChlbGVtZW50LnN0eWxlLnZpc2liaWxpdHkpO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7IC8vIFRlbXBvcmFyaWx5IGhpZGUgdGhlIGVsZW1lbnQgKHdpdGhvdXQgY2hhbmdpbmcgdGhlIGxheW91dClcclxuICAgIH1cclxuICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZWxlbWVudHMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICBlbGVtZW50c1trXS5zdHlsZS52aXNpYmlsaXR5ID0gb2xkX3Zpc2liaWxpdHlba107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZWxlbWVudHM7XHJcbn07XHJcblxyXG4iXSwic291cmNlUm9vdCI6IiJ9
