angular.module('mitsiApp')

.directive('draggable', function() {
    return function(scope, element) {
        var el = element[0];

        el.draggable = true;

        el.addEventListener(
            'dragstart',
            function(e) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text', this.id);
                //console.log("e.clientX="+e.clientX);
                //console.log("e.clientY="+e.clientY);
            	//e.dataTransfer.setData("startX", e.clientX);
            	//e.dataTransfer.setData("startY", e.clientY);
            	e.dataTransfer.setData("startX", e.screenX);
            	e.dataTransfer.setData("startY", e.screenY);
                this.classList.add('drag');
                return false;
            },
            false
        );

        el.addEventListener(
            'dragend',
            function(e) {
                //this.classList.remove('drag');
            	e.preventDefault();

            	var c = document.getElementById(e.dataTransfer.getData("text"));
            	var startX = parseInt(e.dataTransfer.getData("startX"));
            	var startY = parseInt(e.dataTransfer.getData("startY"));

                //ev.dataTransfer.setData("text", ev.target.id);
            	//c.style.left = ev.clientX+"px";

            	c.style.left = (c.offsetLeft-startX+e.screenX)+"px";
            	c.style.top = (c.offsetTop-startY+e.screenY)+"px";

            	
            	return false;
            },
            false
        );
    }
});