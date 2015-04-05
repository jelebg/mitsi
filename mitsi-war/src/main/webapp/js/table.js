var hot = null;
var hotData = null;

var nbRowToFetch = 100; // TODO : configurable dans la jsp

function displayTableCall(datasourceName, objectName, objectType, owner) {
	// page title
	document.title = datasourceName + " - " + objectName + (objectType=="" ? "" : " ("+objectType+")") + " - MITSI table page";
	
	// header
	var divHeader = gid("detailsHeader");
	divHeader.textContent = datasourceName + " - " + objectName + (objectType=="" ? "" : " ("+objectType+")");

	callGsonServlet("RawSQLBeginServlet", 
			{
				"datasourceName" : datasourceName,
				"nbRowToFetch"   : nbRowToFetch,
				"sql"            : "select * from "+owner+"."+objectName
			},
			function(response) { 
				console.log(response);
				displayTable(datasourceName, objectName, objectType, owner, response);
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);
}

function displayTable(datasourceName, objectName, objectType, owner, response) {
	var div = gid("tableContent");
	
	//var columnNames = [];
	//for(var i=0; i!=response.columns.length; i++) {
	//	var column = response.columns[i];
	//	columnNames.push(column.name);
	//}
	
	hotData = response.results;
	hot = sqlTableInit(div, response.columns, hotData, hotData.length!=nbRowToFetch, tableFetchMore);
	
	
}

function tableFetchMore() {
	callGsonServlet("RawSQLFetchServlet", 
			{
				"datasourceName" : datasourceName,
				"nbRowToFetch"   : nbRowToFetch
			},
			function(response) { 
				console.log(response);
				
				sqlTableDisplayMore(hot, hotData, response.results, (response.results.length < nbRowToFetch));
				
			}, 
			function(code, text) { 
				console.log("error code="+code+" text="+text); 
				alert("error code="+code+" text="+text); 
			}
		);

}

function bodyOnload() {
	
	displayTableCall(datasourceName, objectName, objectType, owner);
	
	
	
}