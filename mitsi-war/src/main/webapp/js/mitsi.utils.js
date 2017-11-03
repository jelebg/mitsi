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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function nullSavePushToArrayInCollection(collection, index, element) {
	let array = collection[index];
	if(array == null) {
		array = [];
		array.push(element);
		collection[index] = array;
	}
	else {
		array.push(element);
	}
}

function isMitsiExperimental() {
    let val = localStorage.getItem("mitsi_experimental");
    return val != null && val.toLowerCase() != "false";
}
