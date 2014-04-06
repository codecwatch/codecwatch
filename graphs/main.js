"use strict;"

var mapEncoder = new Object();
mapEncoder["x264"] = "https://git.videolan.org/?p=x264.git;a=commit;h=";
mapEncoder["xTOTO"] = "https://www.google.ch/#q=";

function mapEncoGitToLink(encoder, gitrev) {
	return "<a href=" + mapEncoder[encoder]+gitrev + ">Git revison</a>"; 
}


$(function() {
	var input = [
	{
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:01Z",
		"type": "PSNR",
		"rate": "8001.3232",
		"value": "15",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:01Z",
		"type": "PSNR",
		"rate": "7900.3232",
		"value": "20",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:01Z",
		"type": "PSNR",
		"rate": "7945.3232",
		"value": "50",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:02Z",
		"type": "PSNR",
		"rate": "8040.3232",
		"value": "10",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:02Z",
		"type": "PSNR",
		"rate": "8070.3232",
		"value": "0",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:02Z",
		"type": "PSNR",
		"rate": "7840.3232",
		"value": "60",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:02Z",
		"type": "PSNR",
		"rate": "8704.3232",
		"value": "40",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:01Z",
		"type": "PSNR",
		"rate": "7987.3232",
		"value": "-6",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 }]

	//http://stackoverflow.com/questions/9150964/identifying-hovered-point-with-flot
	//Create a table of tuple (x,y) for each encoder type
	var xyEncoder = new Object();
	var key;
	var entry;
	var date;
	for (var i = 0; i < input.length; i++) {
		
		entry = input[i];
		date = new Date(Date.parse(entry.datetime)).toUTCString();
		key = entry.encoder + " (" + date + ") (" + mapEncoGitToLink(entry.encoder, entry.gitrev) + ")";
		
		if( !(key in xyEncoder)) {
			xyEncoder[key] = []
		}
		xyEncoder[key].push([entry.rate, entry.value , {"encoder": entry.encoder, "sample": entry.sample, "datetime": date, "type": entry.type, "gitrev": input[i].gitrev}]);
	}

	//Create the dataset for the plot
	var dataset = [];
	for(key in xyEncoder)
	{
		dataset.push({"label" : key , "data" : xyEncoder[key].sort()});
	}

	//https://github.com/flot/flot/blob/master/API.md
	//Plot
	var plot = $.plot("#placeholder1", dataset, {
		series: {
			lines: {
				show: true
			},
			points: {
				show: true
			}
		},
		grid: {
			hoverable: true,
		},
		xaxis: {
			tickFormatter: function (v) {
				return v + " kb/s";
			}
		},
		yaxis: {
			tickFormatter: function (v) {
				return v + " dB";
			}
		},
		legend: {
			margin: [-$("<div class='graph-container'>").css( "width" ).replace("px", "")/2.8, 0]
		}
	});

	//Design of the tooltip
	$("<div id='tooltip1'></div>").css({
		position: "absolute",
		display: "none",
		border: "1px solid #fdd",
		padding: "2px",
		color: "#fff",
		"background-color": "#000",
		opacity: 0.80
	}).appendTo("body");

	//Event when the mouse go over a point
	var mouseover = false;
	$("#placeholder1").bind("plothover", function (event, pos, item) {
		//Show information
		if (item) {
			var x = item.datapoint[0].toFixed(2),
			y = item.datapoint[1].toFixed(2);
			$("#tooltip1").html("<p><b>" + item.series.label + "</b></p><p>" + x + "kb/s" + " at " + y + "dB</p>")
				.css({top: item.pageY+5, left: item.pageX+5})
				.fadeIn(150);
		} else {
			if(!mouseover){
				$("#tooltip1").fadeOut(200);
			}
		}
	});
	
	$("#tooltip1").bind("mouseleave", function (event) {
		if(mouseover) {
			$("#tooltip1").fadeOut(200);
		}
		mouseover = false;
	});
	
	$("#tooltip1").bind("mouseover", function (event) {
		if(!mouseover) {
			$("#tooltip1").fadeIn(150);
		}
		mouseover = true;
	});

	/*$("#placeholder1").bind("mouseleave", function (event, pos, item) {
		if(item) {
		
		}
	});*/

});
