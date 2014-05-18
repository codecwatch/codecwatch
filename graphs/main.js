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
    return encoder + '/commit/' + git_commit;
}

// Date format displayed
function formatDate(date) {
    return '{0} {1}'.format(
        date.toLocaleDateString(),
        date.toLocaleTimeString()
    );
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

    var xyEncoder = new Object();
    var encoderLabel = new Object();

    for (var i = 0; i < data.length; i++) {

        var entry = data[i];
        var date = new Date(entry.date*thousand); //Unix format To standard one;
        // Each key creates a new line in the graph
        var key = [entry.git_url, entry.git_commit, entry.source];

        // Create a corresponding label for this graph line
        if (!(key in xyEncoder)) {
            xyEncoder[key] = [];

            // How the label is displayed
            hTitle = $('<td/>', {'class': legendTitleClass})
                .text('{0}: '.format(entry.source));
            hGitA = $('<a/>', {
                'href': mapEncoGitToLink(entry.git_url, entry.git_commit),
                'title': entry.git_commit,
            }).text(gitUrlToEncoder(entry.git_url));
            hInfo = $('<td/>', {'class': legendInfoClass})
                .append(hGitA)
                .append(' ({0})'.format(formatDate(date)))
            encoderLabel[key] = hTitle.html() + hInfo.html();
        }

        // Each point is bitrate-value pair
        xyEncoder[key].push([entry.bitrate, entry.value]);
    }

    // Create the dataset for the plot
    var dataset = [];
    for (key in xyEncoder) {
        var entry = xyEncoder[key];
        dataset.push({
            "label": encoderLabel[key],
            "data": entry.sort(),
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
            generateGraph(data); //< --- a placer dans la success function
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error(['API error json', jqXHR, textStatus, errorThrown]);
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
        fill_encoders(data.encoders);
        fill_samplers(data.samplers);
    },
    error: function (jqXHR, textStatus, errorThrown) {
        console.error(['API error encoders', jqXHR, textStatus, errorThrown]);
    }
});

fill_metrics(['PSNR', 'SSIM']); // FIXME: no API
