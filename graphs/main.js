"use strict;"

var mapEncoder = new Object();
mapEncoder["x264"] = "https://git.videolan.org/?p=x264.git;a=commit;h=";
mapEncoder["xTOTO"] = "https://www.google.ch/#q=";

function mapEncoGitToLink(encoder, gitrev) {
	return "<a href=" + mapEncoder[encoder]+gitrev + ">Git revison</a>"; 
}

$(function() {

	var myControl=  {
		create: function(tp_inst, obj, unit, val, min, max, step){
			$('<input class="ui-timepicker-input" value="'+val+'" style="width:50%">')
				.appendTo(obj)
				.spinner({
					min: min,
					max: max,
					step: step,
					change: function(e,ui){ // key events
							// don't call if api was used and not key press
							if(e.originalEvent !== undefined)
								tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						},
					spin: function(e,ui){ // spin events
							tp_inst.control.value(tp_inst, obj, unit, ui.value);
							tp_inst._onTimeChange();
							tp_inst._onSelectHandler();
						}
				});
			return obj;
		},
		options: function(tp_inst, obj, unit, opts, val){
			if(typeof(opts) == 'string' && val !== undefined)
				return obj.find('.ui-timepicker-input').spinner(opts, val);
			return obj.find('.ui-timepicker-input').spinner(opts);
		},
		value: function(tp_inst, obj, unit, val){
			if(val !== undefined)
				return obj.find('.ui-timepicker-input').spinner('value', val);
			return obj.find('.ui-timepicker-input').spinner('value');
	}};
	

	$('#dateInputFrom').datetimepicker({
		controlType: myControl,
		timeFormat: 'HH:mm:ss'
	});

	$('#dateInputTo').datetimepicker({
		controlType: myControl,
		timeFormat: 'HH:mm:ss'
	});


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


	 //AjaxQuery
	$( "#fetch" ).click(function() {
		jQuery.ajax({
		  type: 'GET',
		  url: 'http://lukinos.github.io/WebSize',
		  data: {
			date: $( "#dateInput" ).val(),
			sample: $( "#sampleSelector option:selected" ).text(),
			metric: $( "#metricSelector option:selected" ).text()
		  },
		  success: function(data, textStatus, jqXHR) {
			// La reponse du serveur est contenu dans data
			// On peut faire ce qu'on veut avec ici
		  },
		  error: function(jqXHR, textStatus, errorThrown) {
			// Une erreur s'est produite lors de la requete
		  }
		});
	});


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
		border: "4px solid #fdd",
		padding: "2px",
		color: "#fff",
		"background-color": "#000",
		opacity: 0.80
	}).appendTo("body");

	//Event when the mouse go over a point
	var mouseover = false;
	var timeout;
	
	$("#placeholder1").bind("plothover", function (event, pos, item) {
		//Show information
		if (item) {
			clearTimeout(timeout);
			var x = item.datapoint[0].toFixed(2),
			y = item.datapoint[1].toFixed(2);
			$("#tooltip1").html("<p><b>" + item.series.label + "</b></p><p>" + x + "kb/s" + " at " + y + "dB</p>")
				.css({top: item.pageY+5, left: item.pageX+5, "border-color": item.series.color})
				.fadeIn(200);
		} else {
			clearTimeout(timeout);
			timeout = setTimeout(function(){
					$('#tooltip1').fadeOut(200);
				},750);
		}
	});
	
	$("#tooltip1").bind("mouseenter", function (event) {
		clearTimeout(timeout);
	});
});
