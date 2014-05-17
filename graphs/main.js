"use strict;"

var dateFromInput = document.getElementById("dateFromInput");
var dateToInput = document.getElementById("dateToInput");
var placeholderDiv = document.getElementById("placeholder1");
var tooltip = "tooltip1";
var tooltipDiv = "#" + tooltip;
var legendDiv = document.getElementById("legend");
var graphDiv = document.getElementById("graph1");
var sampleSelector = document.getElementById("sampleSelector");
var metricSelector = document.getElementById("metricSelector");
var encoderSelector = document.getElementById("encoderSelector");
var executeButton = document.getElementById("fetch");

var thousand = 1000;

var legendTitleClass = "legendTitle";
var legendInfoClass = "legendInfo";


/**
 * Handling link between Encoder and Git Revision
 */
// Specify your encoder with the git revision base link
var mapEncoder = new Object();
mapEncoder["https://github.com/videolan/x265"] = "x265";
mapEncoder["https://www.google.ch/#q="] = "xTOTO";

function gitUrlToEncoder(gitUrl) {
    return mapEncoder[gitUrl];
}

// Combine a git revision with his base link
function mapEncoGitToLink(encoder, git_commit) {
    return "<a href=" + encoder + git_commit + ">Git revison</a>";
}

/* source:
* http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery */
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

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
var myControl = {
    create: function (tp_inst, obj, unit, val, min, max, step) {
        $('<input class="ui-timepicker-input" value="' + val + '" style="width:50%">')
            .appendTo(obj)
            .spinner({
                min: min,
                max: max,
                step: step,
                change: function (e, ui) { // key events
                    // don't call if api was used and not key press
                    if (e.originalEvent !== undefined)
                        tp_inst._onTimeChange();
                    tp_inst._onSelectHandler();
                },
                spin: function (e, ui) { // spin events
                    tp_inst.control.value(tp_inst, obj, unit, ui.value);
                    tp_inst._onTimeChange();
                    tp_inst._onSelectHandler();
                }
            });
        return obj;
    },
    options: function (tp_inst, obj, unit, opts, val) {
        if (typeof (opts) == 'string' && val !== undefined)
            return obj.find('.ui-timepicker-input').spinner(opts, val);
        return obj.find('.ui-timepicker-input').spinner(opts);
    },
    value: function (tp_inst, obj, unit, val) {
        if (val !== undefined)
            return obj.find('.ui-timepicker-input').spinner('value', val);
        return obj.find('.ui-timepicker-input').spinner('value');
    }
};

$(dateFromInput).datetimepicker({
    controlType: myControl,
    timeFormat: 'HH:mm:ss',
});
$(dateFromInput).datetimepicker('setDate', (new Date()));

$(dateToInput).datetimepicker({
    controlType: myControl,
    timeFormat: 'HH:mm:ss'
});
$(dateToInput).datetimepicker('setDate', (new Date()));


/**
 * Generate the graph in function of the data
 */
function generateGraph(data) {
    //http://stackoverflow.com/questions/9150964/identifying-hovered-point-with-flot
    //Create a table of tuple (x,y) for each encoder metric


    /* Axel non-working code
    var xyEncoder = new Object();
    var key;
    var entry;
    var date;
    for (var i = 0; i < data.length; i++) {

        entry = data[i];
        date = new Date(entry.date*thousand); //Unix format To standard one;
        key = entry.git_url;

        if (!(key in xyEncoder)) {
            xyEncoder[key] = [];
        }
        xyEncoder[key].push([entry.bitrate, entry.value, {
            "git_url": entry.git_url,
            "source": entry.source,
            "date": date,
            "metric": entry.metric,
            "git_commit": data[i].git_commit
        }]);
    }

    //Create the dataset for the plot
    var dataset = [];
    for (key in xyEncoder) {
        var entry = xyEncoder[key];
        hTitle = $('<td/>', {'class': legendTitleClass})
            .text(entry.file);
        hInfo = $('<td/>', {'class': legendInfoClass})
            .text('{0} ({1}) ({2})'
            .format(gitUrlToEncoder(entry.git_url), entry.date
                , mapEncoGitToLink(entry.git_url, entry.git_commit)));
        dataset.push({
            "label": hTitle.html() + hInfo.html(),
            "data": entry.sort(),
        });
    }*/

    var xyEncoder = new Object();
    var key;
    var entry;
    var date;
    for (var i = 0; i < data.length; i++) {

        entry = data[i];
        date = new Date(entry.date*thousand); //Unix format To standard one;
        //Key will represent the legend name also
        //key = entry.file + " : " + entry.git_url + " (" + date + ") (" + mapEncoGitToLink(entry.git_url, entry.git_commit) + ")";
        key = "<td class='" + legendTitleClass + "'>" + entry.source + " : </td><td class='" + legendInfoClass + "'>" + gitUrlToEncoder(entry.git_url) + " (" + date + ") (" + mapEncoGitToLink(entry.git_url, entry.git_commit) + ")</td>";

        if (!(key in xyEncoder)) {
            xyEncoder[key] = []
        }
        xyEncoder[key].push([entry.bitrate, entry.value, {
            "git_url": entry.git_url,
            "source": entry.source,
            "date": date,
            "metric": entry.metric,
            "git_commit": data[i].git_commit
        }]);
    }

    //Create the dataset for the plot
    var dataset = [];
    for (key in xyEncoder) {
        dataset.push({
            "label": key,
            "data": xyEncoder[key].sort()
        });
    }



    var precisionAxis = 3;
    //https://github.com/flot/flot/blob/master/API.md
    //Plot
    var plot = $.plot(placeholderDiv, dataset, {
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
            container: legendDiv
        }
    });

    //Design of the tooltip
    $("<div id=" + tooltip + "></div>").css({
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

    $(placeholderDiv).bind("plothover", function (event, pos, item) {
        //Show information
        if (item) {
            clearTimeout(timeout);
            var x = item.datapoint[0].toFixed(2),
                y = item.datapoint[1].toFixed(2);
            $(tooltipDiv).html("<p><b>" + item.series.label + "</b></p><p>" + x + "kb/s" + " at " + y + "dB</p>")
                .css({
                    top: item.pageY + 5,
                    left: item.pageX + 5,
                    "border-color": item.series.color
                })
                .fadeIn(200);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                $(tooltipDiv).fadeOut(200);
            }, 750);
        }
    });

    $(tooltipDiv).bind("mouseenter", function (event) {
        clearTimeout(timeout);
    });

    // Modify position of the legend
    $(legendDiv).css("position", "relative");
    $(legendDiv).css("top", -$(placeholderDiv).height());
    $(legendDiv).css("right", -$(placeholderDiv).width() * 1.03);
    $(legendDiv).css("background-color", "rgb(255, 255, 255, 0.85)");

    $(graphDiv).hide();
    $(graphDiv).toggle("explode");
    //$( "#toggle" ).toggle( "explode" );
    //$('#placeholder1 > div.legend > div, #placeholder1 > div.legend > table').css("right", -parseInt($('#placeholder1 > div.legend > div').css("width"))); 
    //$('#placeholder1 > div.legend > table').css("background-image", "url(getPhoto.jpg)").css("background-size", "contain");
};

/**
 * Fill the inputs fron the variable input
 */

// Source : http://stackoverflow.com/questions/3149072/determine-if-html-select-contains-a-value-in-any-of-its-child-options
function optionExists(select, val) {
    return $(select).find("option").filter(function () {
        return this.value === val;
    }).length !== 0;
}

function fill_encoders(data) {
    $.each(data, function (i, v) {
        if(!optionExists(encoderSelector, v)) {
            $(encoderSelector).append("<option>" + v + "</option>");
            $(encoderSelector).trigger('chosen:updated');
        }
    })
}

function fill_samplers(data) {
    $.each(data, function (i, v) {
        if(!optionExists(sampleSelector, v)) {
            $(sampleSelector).append("<option>" + v + "</option>");
            $(sampleSelector).trigger('chosen:updated');
        }
    })
}

function fill_metrics(data) {
    $.each(data, function (i, v) {
        if(!optionExists(metricSelector, v)) {
            $(metricSelector).append("<option>" + v + "</option>");
        }
    });
}

/**
 * Ajax Query for Execute ! button (MAIN)
 *
 * Reyssor: crochets, c'est dictionnaire et brackets listes je crois
 */
$(executeButton).click(function () {

    //Create options and fill it with the different field
    var options = {
        "date_from": "",
        "date_to": "",
        "source": [],
        "metric": "",
        "git_url": []
    };

    //Convertion to UNIX date time
    options.date_from = $(dateFromInput).datetimepicker("getDate").getTime()/thousand;
    options.date_to = $(dateToInput).datetimepicker("getDate").getTime()/thousand;

    $(sampleSelector).find("option:selected").each(function (i, selected) {
        options.source.push(selected.label);
    });

    options.metric = metricSelector.options[metricSelector.selectedIndex].text;

    $(encoderSelector).find("option:selected").each(function (i, selected) {
        options.git_url.push(selected.label);
    });

    jQuery.ajax({
        type: "GET",
        dataType: "json",
        url: "http://duckyduck.gnugen.ch/webui/json",
        data: options,
        success: function (data, textStatus, jqXHR) {
            // La reponse du serveur est contenu dans data
            // On peut faire ce qu'on veut avec ici
            //generateGraph(data); //< --- a placer dans la success function
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Une erreur s'est produite lors de la requete
            //var input = [{"git_url":"https:\/\/github.com\/videolan\/x265","filename":"out12.webm","date":"2014-05-07 17:50:30","metric":"PSNR","bitrate":"595","value":"7.81451","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"},{"git_url":"https:\/\/github.com\/videolan\/x265","filename":"out15.webm","date":"2014-05-11 13:24:43","metric":"PSNR","bitrate":"791","value":"7.81451","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"},{"git_url":"https:\/\/github.com\/videolan\/x265","filename":"out16.webm","date":1399814829,"metric":"PSNR","bitrate":"595","value":"7.81451","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"}];
            //generateGraph(input);
        }
    });

});

jQuery.ajax({
    type: "GET",
    dataType: "json",
    url: "http://duckyduck.gnugen.ch/webui/json_gui",
    data: {},
    xhrFields: {
        withCredentials: true
    },
    success: function (data, textStatus, jqXHR) {
        //fill_encoders(data.encoders);
        //fill_samplers(data.samplers);
    },
    error: function (jqXHR, textStatus, errorThrown) {
        //console.error(['API error encoders', jqXHR, textStatus, errorThrown]);
        //fill_encoders([]);
        //fill_samplers([]);
    }
});

//fill_metrics(['PSNR', 'SSIM']); // FIXME: no API
var data = [{"git_url":"https:\/\/github.com\/videolan\/x265","source":"bus_cif.webm","filename":"cronjob_1400356637.webm","url":"http:\/\/duckyduck.gnugen.ch\/webui\/media\/force_download\/095b8df9-f339-4c5e-95b5-3b289a943962","date":1400356666,"metric":"psnr","value":"7.81451","bitrate":"595","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"},{"git_url":"https:\/\/github.com\/videolan\/x265","source":"bus_cif.webm","filename":"out12.webm","url":"http:\/\/duckyduck.gnugen.ch\/webui\/media\/force_download\/15e7d73f-596f-44c8-af8a-af6667260060","date":1399477830,"metric":"psnr","value":"7.81451","bitrate":"595","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"},{"git_url":"https:\/\/github.com\/videolan\/x265","source":"bus_cif.webm","filename":"out16.webm","url":"http:\/\/duckyduck.gnugen.ch\/webui\/media\/force_download\/e9395030-713e-48a7-93be-1e2d960d0ecd","date":1399814829,"metric":"psnr","value":"7.81451","bitrate":"595","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"},{"git_url":"https:\/\/github.com\/videolan\/x265","source":"bus_cif.webm","filename":"out18.webm","url":"http:\/\/duckyduck.gnugen.ch\/webui\/media\/force_download\/7100c742-b732-4d8c-80ff-0dd3c756e129","date":1399930223,"metric":"psnr","value":"7.81451","bitrate":"595","git_commit":"d2051f9544434612a105d2f5267db23018cb3454"}]
generateGraph(data);