/**
 * Created by user on 20/4/15.
 */

worlDataApp.directive('worldMap', function() {
    return {
        template: "<div id='map-container'> " +
        "<fieldset style=\"text-align: center\">" +
         "<label for=\"map_year\"> Map Year: </label> &nbsp;&nbsp;" +
         "<input ng-init=\"min_year\" ng-model=\"map_year\" id=\"year_choice\" type=\"range\" class=\"pure-u-2\" min=\"{{ min_year }}\" max=\"{{ max_year }}\">" + "&nbsp; {{ map_year }}</input>"
          + "<div class=\"pure-u-1-3\">" +
            "<label for=\"indicator-map\"> &nbsp; Indicator </label>" +
            "<select ng-model=\"map_var\">" +
               "<option ng-repeat=\"item in mapvars\">{{ item }}</option>" +
            "</select>" +
         "</div>" +
        "</fieldset>" +
        "<div id='result-map' style='height: 400px' />" +
        "</div>",
        restrict: 'E',
        link: function (scope, element, attrs) {
            scope.mapDataInner = attrs.mapdata;
            //setInterval(function() { console.log(attrs) } , 5000);

            scope.$watch(function(scope) {
                    return jQuery.isEmptyObject(attrs.mapdata);
            },
            function(mapDataWrapNew, mapDataWrapOld) {
                if (!jQuery.isEmptyObject(scope.mapDataInner)) {
                    if (typeof(scope.mapDataInner) == typeof("abc"))
                        scope.mapDataInner = JSON.parse(scope.mapDataInner);
                    scope.map_var = Object.keys(scope.mapDataInner)[0];
                    scope.mapvars = Object.keys(scope.mapDataInner);
                    scope.years = Object.keys(scope.mapDataInner[scope.map_var]);
                    scope.map_year = scope.years.sort()[0];
                    scope.min_year = Number(scope.years[0]);
                    scope.max_year = Number(scope.years[scope.years.length - 1]);
                    var myvalues = scope.mapDataInner[scope.map_var][scope.map_year];
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
                            el.html( el.html() + ', ' + scope.map_var + ' : ' +
                                (scope.mapDataInner[scope.map_var][scope.map_year][code] || 'NA') );
                        }
                    });
                }
            });

            scope.$watch(function(scope) {
                    return scope.map_year + " - " + scope.map_var;
            },
            function(map_year, map_year_old) {
                if (!jQuery.isEmptyObject(scope.mapDataInner)) {
                    var myvalues = scope.mapDataInner[scope.map_var][scope.map_year];
                    $('#result-map').empty();
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
                                el.html( el.html() + ', ' + scope.map_var + ' :  ' +
                                (scope.mapDataInner[scope.map_var][scope.map_year][code] || 'NA') );
                        }
                    });
                }
            });
        }
    };
})