<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<title>Mitsi links page</title>

<!-- link rel="stylesheet" media="screen" href="handsontable-0.12.6/handsontable.full.css"-->
<link rel="stylesheet" media="screen"  href="css/mitsi.css">
<!-- script src="handsontable-0.12.6/handsontable.mitsi.js"></script-->
<script src="jsplumb-1.7.5/dom.jsPlumb-1.7.5.js"></script>
<script src="js/mitsi.common.js"></script>
<script src="js/mitsi.window.js"></script>
<script src="js/mitsi.widget.js"></script>
<script src="js/mitsi.graph.js"></script>
<!-- script src="js/mitsi.table.js"></script-->
<script src="js/links.js"></script>

<script>


var datasourceName = "${datasource}";
var objectName = "${objectName}";
var objectType = "${objectType}";
var owner = "${owner}";


</script>

</head>
<body onload="bodyOnLoad();" className="detailsBody" style="background-color:white;">


<div id="linksHeader" class="headerTitle"></div>
 <select id="depthSelect" onchange="draw();" disabled="true">
  <option value="1" selected>1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
</select> 
<!--  button onclick="prepareDisjkstra();">Dijkstra !</button -->
<select id="shortestPathToSelect" >
	<!-- option>please Dijkstra first</option -->
</select>
<button onclick="highlightShortestPath();">highlight shortest path</button>
<button onclick="showShortestPath();">display shortest path</button>
<button onclick="clearPaths();">clear</button>
<div id="infoMessage" ></div>
<div id="linksContent" style="position:absolute;width:800px;height:800px;"></div>

</body>
</html>