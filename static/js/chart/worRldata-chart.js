/**
 * Created by aditya on 30/04/15.
 */

/**
 * Created by user on 20/4/15.
 */

worlDataApp.directive('worldCharts', function() {
    return {
        template: "<canvas id='charts-bar' style='min-height: 400px'></canvas>", //style='width: 600px; height: 400px;'
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
                            //{
                            //    label: "My First dataset",
                            //    fillColor: "rgba(220,220,220,0.5)",
                            //    strokeColor: "rgba(220,220,220,0.8)",
                            //    highlightFill: "rgba(220,220,220,0.75)",
                            //    highlightStroke: "rgba(220,220,220,1)",
                            //    data: [65, 59, 80, 81, 56, 55, 40]
                            //},
                    };
                    for (var i = 0; i < inds.length; i++) {
                        var obj = {label: inds[i], data:[]};
                        for (var y = 0; y < years.length; y++) {
                            var tot = 0;
                            for (var j = 0; j < scope.mapDataInner[inds[i]][years[y]].length; j++) {
                                tot += scope.mapDataInner[inds[i]][years[y]];
                            }
                        }
                        obj.data.push(tot);
                    };
                    var ctx = document.getElementById("charts-bar").getContext("2d");
                    console.log(ctx);
                    var myBarChart = new Chart(ctx).Bar(data);
                }
            });
        }
    };
})
