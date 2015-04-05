function sqlTableInit(div, columns, results, noMoreRows, fetchMore) {
	var columnNames = [];
	for(var i=0; i!=columns.length; i++) {
		columnNames.push(columns[i].name);
	}
	
	//var div = gid("sqlresulttable");
	div.innerHTML = "";
	
	//CONTEXT.handsontableData = results;
	//CONTEXT.handsontable = 
	var hot = new Handsontable(div, {
		
		data : results, //CONTEXT.handsontableData,
		minSpareRows : 0,
		colHeaders : true,
		contextMenu : true,
		//afterChange : function() {
		//	console.log(JSON.stringify(data));
		//},
		manualColumnResize : true,
		manualColumnMove : true,
		colHeaders : columnNames

	});
	var div2 = document.createElement("DIV");
	div2.id = "fetchMore";
	if(noMoreRows) {
		div2.textContent = "no more rows";
	}
	else {
		var a = document.createElement("A");
		a.text = "fetch more ...";
		a.href = "";
		a.onclick = function(event) {
			fetchMore();
			return false;
		}
		div2.appendChild(a);
	}
	div.appendChild(div2);
	
	return hot;
}

function sqlTableDisplayMore(hot, hotdata, results, noMoreRows) {
	for(var i=0; i!=results.length; i++) {
		//CONTEXT.handsontableData.push(results[i]);
		hotdata.push(results[i]);
	}
	//CONTEXT.handsontable.render();
	hot.render();
	
	
	if(noMoreRows) {
		var div2 = gid("fetchMore");
		div2.innerHTML = "";
		div2.textContent = "no more rows";
	}


}