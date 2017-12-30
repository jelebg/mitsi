angular.module('mitsiApp')
.directive('mitsiDraggable', function() {
    return {
        restrict : "A",
       scope: {
            mitsiDraggableCondition : "=?",
            mitsiDropHandler : "&",
            mitsiDropData : "=?"
       },
       link: function(scope, element) {
            var el = element[0];

            el.addEventListener(
                'dragstart',
                function(e) {
                    e.dataTransfer.setData('mitsi-drop-data', scope.mitsiDropData);
                    this.classList.add('mitsiDragDragging');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragend',
                function(e) {
                    this.classList.remove('mitsiDragDragging');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragover',
                function(e) {
                    if (e.preventDefault) e.preventDefault();
                    this.classList.add('mitsiDragOver');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragenter',
                function(e) {
                    this.classList.add('mitsiDragOver');
                    return false;
                },
                false
            );

            el.addEventListener(
                'dragleave',
                function(e) {
                    this.classList.remove('mitsiDragOver');
                    return false;
                },
                false
            );

            el.addEventListener(
                'drop',
                function(e) {
                    if (e.stopPropagation) e.stopPropagation();

                    let droppedData = e.dataTransfer.getData('mitsi-drop-data');

                    this.classList.remove('mitsiDragOver');

                    let from = ""+droppedData;
                    let to = ""+scope.mitsiDropData;
                    if (from !== to) {
                        scope.mitsiDropHandler({"from": from, "to": to});
                        scope.$apply();
                    }

                    return false;
                },
                false
            );

            scope.$watch('mitsiDraggableCondition', function(mitsiDraggableCondition) {
                el.draggable = mitsiDraggableCondition;
            });

       }
    }
});



