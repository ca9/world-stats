/**
 * Created by aditya on 30/04/15.
 */

/**
 * Created by user on 20/4/15.
 */

worlDataApp.directive('worldCharts', function() {
    return {
        template: "<div class=\"pure-g code\">" +
                        "<div class=\"pure-u-2-3\"><p><canvas id='charts-bar' style='min-height: 300px'></canvas></p></div>" +
                        "<div class=\"pure-u-1-3\"><p id='charts-legend'></p></div>" +
        "</div>",
        restrict: 'E',
        link: function (scope, element, attrs) {
            scope.map_year = '2011';
            scope.mapDataInner = attrs.mapdata;
            //setInterval(function() { console.log(attrs) } , 5000);

            scope.$watch(function(scope) {
                    return jQuery.isEmptyObject(attrs.mapdata);
            },
            //Todo: add the year slider, and var
            function(mapDataWrapNew, mapDataWrapOld) {
                if (!jQuery.isEmptyObject(scope.mapDataInner)) {
                    if (typeof(scope.mapDataInner) == typeof("abc"))
                        scope.mapDataInner = JSON.parse(scope.mapDataInner);
                    scope.map_var = Object.keys(scope.mapDataInner)[0]; //Todo: update this
                    var inds = Object.keys(scope.mapDataInner);
                    var years = Object.keys(scope.mapDataInner[inds[0]]).sort();
                    var data = {
                        labels: years, //years
                        datasets: []
                    };
                    for (var i = 0; i < inds.length; i++) {
                        var col1 = Math.round(Math.random() * 255).toString();
                        var col2 = Math.round(Math.random() * 255).toString();
                        var col3 = Math.round(Math.random() * 255).toString();
                        var obj = {label: inds[i], data:[],
                            fillColor: "rgba(" + col1 + ", " + col2 + ", " + col3 + ", 0.5)",
                            strokeColor: "rgba(" + col1 + ", " + col2 + ", " + col3 + ", 0.8)",
                            highlightFill: "rgba(" + col1 + ", " + col2 + ", " + col3 + ", 0.75)",
                            highlightStroke: "rgba(" + col1 + ", " + col2 + ", " + col3 + ", 0.1)"
                        };
                        for (var y = 0; y < years.length; y++) {
                            var tot = 0;
                            var dat_keys = Object.keys(scope.mapDataInner[inds[i]][years[y]]).sort();
                            for (var j = 0; j < dat_keys.length; j++) {
                                tot += scope.mapDataInner[inds[i]][years[y]][dat_keys[j]];
                            }
                            obj.data.push(tot);
                        }
                        data.datasets.push(obj);
                    };
                    var ctx = document.getElementById("charts-bar").getContext("2d");
                    //console.log(ctx);
                    var myBarChart = new Chart(ctx).Bar(data, {
                        showTooltips: true,
                        scaleShowLabels: true,
                        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
                        legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\">[&nbsp;&nbsp;]</span> &nbsp; <%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
                    });
                    $("#charts-legend").html(myBarChart.generateLegend());
                    $("#charts-legend").append('Bars are subject to data availability for respective years. Please bear in mind.');
                }
            });
        }
    };
})
