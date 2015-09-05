angular.module('mitsiApp')

.directive('mitsiResizableGrid', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        var elt = angular.element(element)[0];
        scope.getWindowDimensions = function () {
        	var myHeight = 0;
        	if (typeof (w.innerHeight) == 'number') {
        		myHeight = w.innerHeight;
        	} else if (document.documentElement
        			&& document.documentElement.clientHeight) {
        		myHeight = document.documentElement.clientHeight;
        	} else if (document.body && document.body.clientHeight) {
        		myHeight = document.body.clientHeight;
        	}

        	var myWidth = 0;
        	if (typeof (w.innerWidth) == 'number') {
        		myWidth = w.innerWidth;
        	} else if (document.documentElement && document.documentElement.clientWidth) {
        		myWidth = document.documentElement.clientWidth;
        	} else if (document.body && document.body.clientWidth) {
        		myWidth = document.body.clientWidth;
        	}

        	return {
        		h : myHeight,
        		w : myWidth
        	};
        };
        
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return {
                    'height': (newValue.h - 100) + 'px',
                    'width' : (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
        
        scope.getTableStyle = function() {
        	var xy = getAbsoluteXY(elt);
            return {
                height: (scope.windowHeight-xy.y-2)+"px",
                width: (scope.windowWidth-xy.x-2)+"px"
            };
         };
    }
})