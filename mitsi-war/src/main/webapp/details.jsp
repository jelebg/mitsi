<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<title>Mitsi details page</title>

<link rel="stylesheet" media="screen"  href="css/mitsi.css">
<script src="handsontable-0.12.6/handsontable.mitsi.js"></script>
<script src="js/mitsi.common.js"></script>
<script src="js/mitsi.window.js"></script>
<script src="js/mitsi.widget.js"></script>
<script src="js/details.js"></script>

<script>


var datasourceName = "${datasource}";
var objectName = "${objectName}";
var objectType = "${objectType}";
var owner = "${owner}";


</script>

</head>
<body onload="bodyOnload();" className="detailsBody" style="background-color:white;">


<div id="detailsHeader" class="headerTitle"></div>
<div id="detailsContent" ></div>

</body>
</html>