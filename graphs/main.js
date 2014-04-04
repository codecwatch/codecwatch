"use strict;"

$(function() {

	var input = [
	{
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:02Z",
		"type": "PSNR",
		"rate": "8001.3232",
		"value": "15",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:03Z",
		"type": "PSNR",
		"rate": "7900.3232",
		"value": "20",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:04Z",
		"type": "PSNR",
		"rate": "7945.3232",
		"value": "50",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "x264",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:05Z",
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
		"datetime": "2014-04-04T12:42:03Z",
		"type": "PSNR",
		"rate": "7840.3232",
		"value": "60",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:04Z",
		"type": "PSNR",
		"rate": "8704.3232",
		"value": "40",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 },
	 {
		"encoder": "xTOTO",
		"sample": "fileA.mp4",
		"datetime": "2014-04-04T12:42:05Z",
		"type": "PSNR",
		"rate": "7987.3232",
		"value": "-6",
		"gitrev": "bd62cf0690a426744cebc376ba7917988245366c"
	 }]

	//http://stackoverflow.com/questions/9150964/identifying-hovered-point-with-flot
	//Create a table of tuple (x,y) for each encoder type
	var xyEncoder = new Object();
	for (var i = 0; i < input.length; i++) {
		if( !(input[i].encoder in xyEncoder)) {
			xyEncoder[input[i].encoder] = []
		}
		xyEncoder[input[i].encoder].push([input[i].rate, input[i].value , {"sample": input[i].sample, "type": input[i].type, "gitrev": input[i].gitrev, "datetime": input[i].datetime}]);
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
		}
	});

	//Design of the tooltip
	$("<div id='tooltip1'></div>").css({
		position: "absolute",
		display: "none",
		border: "1px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80
	}).appendTo("body");

	//Event when the mouse go over a point
	$("#placeholder1").bind("plothover", function (event, pos, item) {
		//Show information
		if (item) {
			var x = item.datapoint[0].toFixed(2),
				y = item.datapoint[1].toFixed(2);

			$("#tooltip1").html(item.series.label + " at " + item.series.data[item.dataIndex][2].datetime)
				.css({top: item.pageY+5, left: item.pageX+5})
				.fadeIn(200);
		} else {
			$("#tooltip1").hide();
		}
	});
});
