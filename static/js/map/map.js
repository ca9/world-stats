/**
 * Created by user on 20/4/15.
 */

worlDataApp.directive('worldMap', function() {
    return {
        template: "<div id='result-map' style='height: 400px'></div>", //style='width: 600px; height: 400px;'
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
                    var myvalues = scope.mapDataInner[scope.map_var]['2011'];
                    $('#result-map').vectorMap({
                        //map: 'world-mill-en',
                        series: {
                            regions: [{
                                values: myvalues,
                                scale: ['#C8EEFF', '#0071A4'],
                                normalizeFunction: 'polynomial'
                            }]
                        },
                        onRegionTipShow: function(e, el, code) {
                                el.html( el.html() + ', ' + scope.map_var + ' - ' +
                                (scope.mapDataInner[scope.map_var]['2011'][code] || 'NA'));
                        }
                    });
                }
            });
        }
    };
})