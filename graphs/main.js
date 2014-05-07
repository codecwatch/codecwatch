"use strict;"
$(function() {

    /**
     * Handling link between Encoder and Git Revision
     */
    // Specify your encoder with the git revision base link
    var mapEncoder = new Object();
    mapEncoder["x264"] = "https://git.videolan.org/?p=x264.git;a=commit;h=";
    mapEncoder["xTOTO"] = "https://www.google.ch/#q=";

    // Combine a git revision with his base link
    function mapEncoGitToLink(encoder, gitrev) {
        return "<a href=" + mapEncoder[encoder]+gitrev + ">Git revison</a>"; 
    }


    /**
     * Activate the chosen selector (Sample and Encoders)
     */
    $(".my_select_box").chosen({
        no_results_text: "Oops, nothing found!",
        search_contains: true,
        width: "100%"
    });

    /**
     * Configure the DateTime input adding a new system to chose the minutes and seconds
     * and activate it (dateInputFrom and dateInputTo)
     * From the example : http://trentrichardson.com/examples/timepicker/
     */
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
        timeFormat: 'HH:mm:ss',
    });
    $('#dateInputFrom').datetimepicker('setDate', (new Date()) );

    $('#dateInputTo').datetimepicker({
        controlType: myControl,
        timeFormat: 'HH:mm:ss'
    });
    $('#dateInputTo').datetimepicker('setDate', (new Date()) );

    /**
     * Dummy values
     */
    var input = [{"encoder":"https:\/\/github.com\/videolan\/x265","sample":"out12.webm","datetime":"2014-05-07 17:50:30","type":"PSNR","rate":"595","value":"7.81451","gitrev":"d2051f9544434612a105d2f5267db23018cb3454"}];

   /* var input = [
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
*/
    /**
     * Generate the graph in function of the selected options
     */
    function generateGraph(options) {
        //http://stackoverflow.com/questions/9150964/identifying-hovered-point-with-flot
        //Create a table of tuple (x,y) for each encoder type
        var xyEncoder = new Object();
        var key;
        var entry;
        var date;
        for (var i = 0; i < input.length; i++) {

            entry = input[i];
            date = entry.datetime;//new Date(Date.parse(entry.datetime)).toUTCString();
            //Key will represent the legend name also
            //key = entry.sample + " : " + entry.encoder + " (" + date + ") (" + mapEncoGitToLink(entry.encoder, entry.gitrev) + ")";
            key = "<td class=legendTitle>" + entry.sample + " : </td><td class=legendInfo>" + entry.encoder + " (" + date + ") (" + mapEncoGitToLink(entry.encoder, entry.gitrev) + ")</td>";

            if( !(key in xyEncoder)) {
                xyEncoder[key] = []
            }
            xyEncoder[key].push([entry.rate, entry.value , {"encoder": entry.encoder, "sample": entry.sample, "datetime": date, "type": entry.type, "gitrev": input[i].gitrev}]);
        }

        //Create the dataset for the plot
        var dataset = [];
        for(key in xyEncoder) {
            dataset.push({"label" : key , "data" : xyEncoder[key].sort()});
        }

        var precisionAxis = 3;
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
                    return v.toFixed(precisionAxis) + " kb/s";
                }
            },
            yaxis: {
                tickFormatter: function (v) {
                    return v.toFixed(precisionAxis) + " dB";
                }
            },
            legend: {
                container: "#legend"
                //margin: [-$(".legend").css("width")., 0]//[-$("<div class='graph-container'>").css( "width" ).replace("px", "")/2.8, 0]
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

        // Modify position of the legend
        $('#legend').css('position','relative');
        $('#legend').css('top',-$('#placeholder1').height());
        $('#legend').css('right',-$('#placeholder1').width()*1.03);
        $('#legend').css('background-color','rgb(255, 255, 255, 0.85)');

        $('#graph1').hide();
        $('#graph1').toggle( "explode" );
        //$( "#toggle" ).toggle( "explode" );
        //$('#placeholder1 > div.legend > div, #placeholder1 > div.legend > table').css("right", -parseInt($('#placeholder1 > div.legend > div').css("width"))); 
        //$('#placeholder1 > div.legend > table').css("background-image", "url(getPhoto.jpg)").css("background-size", "contain");
    };

    /**
     * Ajax Query for Execute ! button (MAIN)
     *
     * Reyssor: crochets, c'est dictionnaire et brackets listes je crois
     */
    $( "#fetch" ).click(function() {

        //Create options and fill it with the different field
        var options = {
            "dateInputFrom": "",
            "dateInputTo": "",
            "samples": [],
            "metric": "",
            "encoders": []
        };
       // alert($("#dateInputFrom").datetimepicker('getdate'));
        options.dateInputFrom = $("#dateInputFrom").datetimepicker('getDate').toISOString();
        options.dateInputTo = $("#dateInputTo").datetimepicker('getDate').toISOString();

        $('#encoderSelector option:selected').each(function(i, selected){
            options.encoders.push(selected.label);
        });

        options.metric = "metric";

        $('#sampleSelector option:selected').each(function(i, selected){
            options.samples.push(selected.label);
        });

        jQuery.ajax({
          type: 'GET',
          url: 'http://lukinos.github.io/WebSize',
          data: options,
          success: function(data, textStatus, jqXHR) {
            // La reponse du serveur est contenu dans data
            // On peut faire ce qu'on veut avec ici
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // Une erreur s'est produite lors de la requete
          }
        });

        generateGraph(null);
    });

});
