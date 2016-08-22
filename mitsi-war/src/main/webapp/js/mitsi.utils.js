// recupérer la position absolue d'un div 
function getAbsoluteXY(element) {
	var lx = 0, ly = 0;
	for (; element != null; lx += element.offsetLeft, ly += element.offsetTop, element = element.offsetParent) {
	}
	return {
		x : lx,
		y : ly
	};
}